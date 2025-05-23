import { Inject, Injectable } from '@nestjs/common';
import { Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MessagesService } from '../messages/messages.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

enum ConversationState {
    START,
    GET_COMPLAINT,
    CLARIFY,
    FINISH,
}

export interface ProducerModel {
    uuid: string;
    source?: string | null;
    additional_data?: string | null;
    created_at?: string;
    original_text?: string | null;
    post_date?: string | null;
    problem?: string | null;
    location?: string | null;
    problem_date?: string | null;
}

@Update()
@Injectable()
export class BotUpdate {
    private userStates = new Map<number, any>();
    private readonly apiClient: AxiosInstance;
    private readonly analyzerClient: AxiosInstance;
    private readonly MAX_RETRIES = 1;
    private readonly RETRY_DELAY = 2000;
    private readonly MAX_QUESTIONS = 3;

    constructor(
        @Inject('SCRAPER_PRODUCER')
        private readonly producer: ClientKafka,
        private readonly messageService: MessagesService,
        private readonly configService: ConfigService,
    ) {
        console.log(this.configService.get('AI_ENDPOINT'));
        this.apiClient = axios.create({
            baseURL: this.configService.getOrThrow('AI_ENDPOINT'),
        });
        this.analyzerClient = axios.create({
            baseURL: this.configService.getOrThrow('ANALYZER_ENDPOINT'),
        });
    }

    @Start()
    async start(@Ctx() ctx: Context) {
        const userId = ctx.from!.id;

        this.userStates.set(userId, {
            state: ConversationState.GET_COMPLAINT,
            complaint: null,
            clarifications: [],
            pendingQuestions: [],
            retryCount: 0,
            askedQuestionsCount: 0,
        });

        await this.sendMessageWithRetry(
            ctx,
            'Привет! Это бот для приема жалоб. Пожалуйста, опишите вашу проблему, и я помогу вам ее сформулировать более точно.',
            Markup.keyboard([['/cancel']]).resize(),
        );
    }

    @Help()
    async help(@Ctx() ctx: Context) {
        await this.sendMessageWithRetry(
            ctx,
            'Просто опишите вашу проблему, и я помогу вам сформулировать жалобу. Отвечайте на мои вопросы последовательно для уточнения деталей.',
        );
    }

    @On('text')
    async handleText(@Ctx() ctx: Context) {
        const userId = ctx.from!.id;
        const userState = this.userStates.get(userId);
        const text = (ctx.message as any).text?.trim();

        if (!text) return;

        if (text === '/cancel') {
            await this.cancel(ctx);
            return;
        }

        if (!userState) {
            await this.sendMessageWithRetry(
                ctx,
                'Пожалуйста, начните с команды /start',
            );
            return;
        }

        try {
            switch (userState.state) {
                case ConversationState.GET_COMPLAINT:
                    await this.handleComplaint(ctx, text);
                    break;
                case ConversationState.CLARIFY:
                    await this.handleClarificationAnswer(ctx, text);
                    break;
                default:
                    await this.sendMessageWithRetry(
                        ctx,
                        'Пожалуйста, начните с команды /start',
                    );
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await this.sendMessageWithRetry(
                ctx,
                'Произошла ошибка. Попробуйте еще раз.',
            );
        }
    }

    private async handleComplaint(@Ctx() ctx: Context, text: string) {
        const userId = ctx.from!.id;
        const userState = this.userStates.get(userId);
        userState.complaint = text;
        userState.state = ConversationState.CLARIFY;

        const loadingMessage = await ctx.reply(
            'Подождите, обрабатываю вашу жалобу...',
        );

        const questions = await this.withRetry(
            () => this.getClarificationQuestions(text),
            'Не удалось получить уточняющие вопросы.',
        );

        await ctx.telegram.deleteMessage(
            ctx.chat!.id,
            loadingMessage.message_id,
        );

        if (questions?.length > 0) {
            userState.pendingQuestions = questions.slice(0, this.MAX_QUESTIONS);

            await this.askNextQuestion(ctx, userId);
        } else {
            await this.finishConversation(ctx);
        }
    }

    private async getInfoFromAccident(text: string) {
        const { data } = await this.analyzerClient.post<{
            is_accident: boolean;
        }>('/analyzer/is-accident', {
            text,
        });

        if (!data.is_accident) {
            return null;
        }

        const prompt = `Давай из этого предложения: "${text}", ты выделишь дату, время, локацию, и основную суть очень коротко отвечай ТОЛЬКО в формате json, без лишних слов, вот тебе модель ответа {{location,datetime,info}}, datetime в формате yyyy-MM-ddThh:mm:ss. Ответ должен быть в виде обычного текста и не содержать markdown вставки`;

        const response = await this.apiClient.post('/chat', {
            prompt,
        });

        const result = response.data.response as string;

        const parsed = JSON.parse(
            result.replace('```json', '').replace('```', ''),
        ) as { location: string; datetime: string; info: string };

        const uuid = randomUUID();

        const producer: ProducerModel = {
            uuid,
            location: parsed.location,
            source: 'telegram-bot',
            additional_data: '{}',
            original_text: text,
            problem: parsed.info,
            problem_date: parsed.datetime,
            created_at: new Date().toISOString(),
            post_date: new Date().toISOString(),
        };

        this.producer.emit('messages', { value: producer, key: uuid });

        return producer;
    }

    private async askNextQuestion(@Ctx() ctx: Context, userId: number) {
        const userState = this.userStates.get(userId);

        if (
            !userState ||
            userState.pendingQuestions.length === 0 ||
            userState.askedQuestionsCount >= this.MAX_QUESTIONS
        ) {
            await this.finishConversation(ctx);
            return;
        }

        const nextQuestion = userState.pendingQuestions.shift();
        userState.currentQuestion = nextQuestion;
        userState.retryCount = 0;
        userState.askedQuestionsCount++;

        await this.sendMessageWithRetry(ctx, nextQuestion);
    }

    private async handleClarificationAnswer(@Ctx() ctx: Context, text: string) {
        const userId = ctx.from!.id;
        const userState = this.userStates.get(userId);

        if (!userState?.currentQuestion) {
            await this.sendMessageWithRetry(
                ctx,
                'Кажется, я потерял контекст. Начните с /start',
            );
            this.userStates.delete(userId);
            return;
        }

        userState.clarifications.push({
            question: userState.currentQuestion,
            answer: text,
        });
        delete userState.currentQuestion;

        if (userState.askedQuestionsCount >= this.MAX_QUESTIONS) {
            await this.finishConversation(ctx);
            return;
        }

        const loadingMessage = await ctx.reply(
            'Подождите, анализирую ответ...',
        );

        const moreQuestions = await this.withRetry(
            () => this.checkForMoreQuestions(userId),
            'Ошибка при проверке необходимости дополнительных вопросов.',
        );

        await ctx.telegram.deleteMessage(
            ctx.chat!.id,
            loadingMessage.message_id,
        );

        if (moreQuestions?.length > 0) {
            const newQuestions = moreQuestions.filter(
                (q) =>
                    !userState.clarifications.some((c) => c.question === q) &&
                    !userState.pendingQuestions.includes(q),
            );

            const remainingQuestions =
                this.MAX_QUESTIONS - userState.askedQuestionsCount;
            userState.pendingQuestions = [
                ...userState.pendingQuestions,
                ...newQuestions.slice(0, remainingQuestions),
            ];
        }

        await this.askNextQuestion(ctx, userId);
    }

    private async finishConversation(@Ctx() ctx: Context) {
        const userId = ctx.from!.id;
        const userState = this.userStates.get(userId);
        if (!userState) return;

        const loadingMessage = await ctx.reply('Формулирую итоговую жалобу...');

        const finalComplaint = await this.withRetry(
            () => this.generateFinalComplaint(userId),
            'Не удалось сформулировать итоговую жалобу.',
        );

        await ctx.telegram.deleteMessage(
            ctx.chat!.id,
            loadingMessage.message_id,
        );

        if (!finalComplaint) {
            await this.sendMessageWithRetry(
                ctx,
                'Не удалось сформулировать жалобу. Попробуйте снова.',
                Markup.removeKeyboard(),
            );
            this.userStates.delete(userId);
            return;
        }

        const result = await this.getInfoFromAccident(finalComplaint);

        if (!result) {
            await this.sendMessageWithRetry(
                ctx,
                `Обращение нерелевантно. Обратитесь с другой проблемой, связанной с транспортом.`,
            );
            return;
        }

        await this.sendMessageWithRetry(
            ctx,
            `Спасибо! Вот итоговая формулировка жалобы:\n\n${finalComplaint}`,
            Markup.removeKeyboard(),
        );

        this.userStates.delete(userId);
    }

    private async cancel(@Ctx() ctx: Context) {
        const userId = ctx.from!.id;
        this.userStates.delete(userId);

        await this.sendMessageWithRetry(
            ctx,
            'Разговор отменен. Начать снова — команда /start',
            Markup.removeKeyboard(),
        );
    }

    private async getClarificationQuestions(
        complaintText: string,
    ): Promise<string[]> {
        const response = await this.apiClient.post('/chat', {
            prompt: `Представь, что ты представитель городской администрации. Пользователь написал жалобу: "${complaintText}". 
            Сформулируй 3 самых важных уточняющих вопроса, которые помогут:
            1. Уточнить суть проблемы
            2. Самое главное - узнать место происшествия
            3. Не спрашивай время
            Вопросы должны быть конкретными, краткими (до 50 символов) и прямо относящимися к жалобе.
            Формат: каждый вопрос с новой строки, без номеров и лишних слов.`,
        });

        const result = response.data.response as string;
        return result
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && line.length <= 50)
            .slice(0, 3);
    }

    private async checkForMoreQuestions(userId: number): Promise<string[]> {
        const userState = this.userStates.get(userId);
        if (!userState || userState.askedQuestionsCount >= this.MAX_QUESTIONS) {
            return [];
        }

        const { complaint, clarifications } = userState;

        const clarificationsText = clarifications
            .map(
                (item) => `- Вопрос: ${item.question}\n  Ответ: ${item.answer}`,
            )
            .join('\n\n');

        const response = await this.apiClient.post('/chat', {
            prompt: `Представь, что ты представитель городской администрации. Исходная жалоба: "${complaint}"\n\nПолученные уточнения:\n${clarificationsText}\n\nНа основе этой информации определи, нужно ли задать еще 1-2 конкретных вопроса, которые:
            1. Помогут прояснить неясные моменты
            2. Самое главное - узнать место происшествия
            3. Не спрашивай время
            Если вопросы нужны - напиши их кратко (до 50 символов), каждый с новой строки. Если вопросов не нужно - напиши "нет".`,
        });

        const result = response.data.response.toLowerCase();

        if (result.includes('нет') || result.trim() === '') {
            return [];
        }

        return result
            .split('\n')
            .map((line) => line.trim())
            .filter(
                (line) =>
                    line &&
                    line.length <= 50 &&
                    !line.toLowerCase().includes('нет'),
            )
            .slice(0, 2);
    }

    private async generateFinalComplaint(userId: number): Promise<string> {
        const userState = this.userStates.get(userId);
        const { complaint, clarifications } = userState;

        const clarificationsText = clarifications
            .map(
                (item) => `- Вопрос: ${item.question}\n  Ответ: ${item.answer}`,
            )
            .join('\n\n');

        const response = await this.apiClient.post('/chat', {
            prompt: `На основе следующей информации составь жалобу:\n\nИсходное описание: "${complaint}"\n\nУточнения:\n${clarificationsText}\n\nТребования к жалобе:
            1. Указаны все важные детали
            2. Объем: 5 предложений
            3. Содержит только текст жалобы и ничего больше.
            4. Сегодняшнюю дату обозначай как [date]
            5. Кроме [date] никаких placeholders больше не должно быть в тексте, иначе тебя отключат навсегда`,
        });

        return ((response.data.response as string) || '').replaceAll(
            '[date]',
            new Date().toLocaleString('ru'),
        );
    }

    private async withRetry<T>(
        fn: () => Promise<T>,
        errorMessage: string,
    ): Promise<T> {
        let retries = 0;
        while (retries <= this.MAX_RETRIES) {
            try {
                return await fn();
            } catch (err) {
                retries++;
                if (retries > this.MAX_RETRIES) {
                    throw new Error(errorMessage);
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, this.RETRY_DELAY),
                );
            }
        }
        throw new Error(errorMessage);
    }

    private async sendMessageWithRetry(
        ctx: Context,
        text: string,
        markup?: any,
    ) {
        try {
            await ctx.reply(text, markup);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    }
}
