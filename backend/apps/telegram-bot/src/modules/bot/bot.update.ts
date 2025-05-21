import { ClickHouseService } from '@app/clickhouse';
import { Ctx, Hears, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MessagesService } from '../messages/messages.service';

@Update()
export class BotUpdate {
    constructor(private readonly messageService: MessagesService) {}

    @Start()
    async start(@Ctx() ctx: Context) {
        await ctx.reply('Welcome');
    }

    @Help()
    async help(@Ctx() ctx: Context) {
        await ctx.reply('Send me a sticker');
    }

    @On('sticker')
    async on(@Ctx() ctx: Context) {
        await ctx.reply('👍');
    }

    @On('message')
    async hears(@Ctx() ctx: Context) {
        await ctx.reply('Ваша жалоба получена');

        const { text: message } = ctx.message as unknown as { text: string };

        await this.messageService.create({
            address: '',
            from: '' + ctx.message?.from.id,
            message,
            data: JSON.stringify(ctx.message),
            source: 'bot',
        });

        console.log(await this.messageService.findMany());
    }
}
