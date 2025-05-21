import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientKafka } from '@nestjs/microservices';
import { TelegramService } from '../telegram/telegram.service';
import { Api } from 'telegram';
import { PrismaService } from '@app/db';
import { DateTime } from 'luxon';
import { FloodWaitError } from 'telegram/errors';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ScraperWorker implements OnModuleInit {
    private readonly logger = new Logger(ScraperWorker.name);
    private readonly MESSAGE_BATCH_SIZE = 100;
    private readonly REQUEST_DELAY_MS = 1500;

    constructor(
        @Inject('SCRAPER_PRODUCER')
        private readonly producer: ClientKafka,
        private readonly telegramService: TelegramService,
        private readonly prisma: PrismaService,
    ) {}

    async onModuleInit() {
        this.logger.log('Initial scrape on startup');
        await this.scrapAllChannels();
    }

    @Cron('0 */5 * * * *') // Каждые 5 минут
    async scrapAllChannels() {
        const channels = await this.prisma.telegramChannel.findMany();
        this.logger.log(`Scheduled scrape of ${channels.length} channels`);

        for (const channel of channels) {
            await this.scrapChannel({ url: channel.tag });
        }

        this.logger.log('Scheduled scrape complete');
    }

    private async getLastRunInfo(channelUrl: string): Promise<{
        date: Date;
        lastMessageId?: number;
        unfinishedScrape?: { id: string };
    }> {
        const unfinished = await this.prisma.channelScrape.findFirst({
            where: { tag: channelUrl, endedAt: null },
            orderBy: { createdAt: 'desc' },
        });

        if (unfinished) {
            return {
                date: unfinished.createdAt,
                lastMessageId: unfinished.lastMessageId
                    ? parseInt(unfinished.lastMessageId)
                    : undefined,
                unfinishedScrape: { id: unfinished.id },
            };
        }

        const lastFinished = await this.prisma.channelScrape.findFirst({
            where: { tag: channelUrl, endedAt: { not: null } },
            orderBy: { createdAt: 'desc' },
        });

        if (lastFinished) {
            return {
                date: lastFinished.createdAt,
                lastMessageId: lastFinished.lastMessageId
                    ? parseInt(lastFinished.lastMessageId)
                    : undefined,
            };
        }

        return {
            date: DateTime.now().minus({ months: 6 }).toJSDate(),
        };
    }

    private async processMessage(message: Api.Message, channelUrl: string) {
        try {
            if (!message.message || message.message.length === 0) return;

            this.logger.debug(
                `[${channelUrl}] Message ${new Date(message.date * 1000).toISOString()} ${message.id}: ${message.message?.substring(0, 50)}...`,
            );

            this.producer.emit('messages.raw', {
                id: message.id,
                text: message.message,
                from: message.fromId,
                date: new Date(message.date * 1000),
                channel: channelUrl,
                source: 'telegram',
            });
        } catch (error) {
            this.logger.error(
                `Error processing message ${message.id}: ${error.message}`,
            );
        }
    }

    async scrapChannel(params: { url: string }) {
        const { url } = params;
        const client = this.telegramService.instance;

        try {
            const entity = await client.getEntity(url);
            if (
                !(entity instanceof Api.Channel) &&
                !(entity instanceof Api.Chat)
            ) {
                this.logger.warn(
                    `Entity ${url} is not a channel or chat. Skipping.`,
                );
                return;
            }

            const tag = url;
            const tgId = entity.id;
            const {
                date: fromDate,
                lastMessageId: lastKnownId,
                unfinishedScrape,
            } = await this.getLastRunInfo(url);

            let scrape;

            if (unfinishedScrape) {
                scrape = await this.prisma.channelScrape.findUnique({
                    where: { id: unfinishedScrape.id },
                });
                this.logger.log(
                    `Resuming scrape ${scrape.id} from ${fromDate} (last ID: ${lastKnownId ?? 'none'})`,
                );
            } else {
                scrape = await this.prisma.channelScrape.create({
                    data: {
                        id: randomUUID(),
                        tag,
                        tgId: tgId.toString(),
                    },
                });
                this.logger.log(
                    `Starting new scrape ${scrape.id} from ${fromDate} (last ID: ${lastKnownId ?? 'none'})`,
                );
            }

            let hasMoreMessages = true;
            let totalMessagesProcessed = scrape.messageCount || 0;
            let lastProcessedId = lastKnownId || 0;
            let currentOffsetId = lastKnownId || 0;

            while (hasMoreMessages) {
                try {
                    const messages = await client.getMessages(entity, {
                        limit: this.MESSAGE_BATCH_SIZE,
                        offsetId: currentOffsetId,
                        reverse: true,
                    });

                    if (messages.length === 0) {
                        hasMoreMessages = false;
                        break;
                    }

                    for (const message of messages) {
                        if (lastKnownId && message.id <= lastKnownId) {
                            continue;
                        }

                        await this.processMessage(message, url);

                        totalMessagesProcessed++;
                        lastProcessedId = Math.max(lastProcessedId, message.id);

                        await this.prisma.channelScrape.update({
                            where: { id: scrape.id },
                            data: {
                                messageCount: totalMessagesProcessed,
                                lastMessageId: message.id.toString(),
                            },
                        });
                    }

                    currentOffsetId = messages[messages.length - 1].id;

                    await new Promise((resolve) =>
                        setTimeout(resolve, this.REQUEST_DELAY_MS),
                    );
                } catch (e) {
                    if (e instanceof FloodWaitError) {
                        const waitSeconds = e.seconds;
                        this.logger.warn(
                            `Flood wait for ${waitSeconds} seconds. Pausing...`,
                        );
                        await new Promise((resolve) =>
                            setTimeout(resolve, waitSeconds * 1000),
                        );
                        continue;
                    }
                    throw e;
                }
            }

            await this.prisma.channelScrape.update({
                where: { id: scrape.id },
                data: {
                    endedAt: new Date(),
                    messageCount: totalMessagesProcessed,
                },
            });

            this.logger.log(
                `Finished scraping ${url}. Processed ${totalMessagesProcessed} new messages.`,
            );
        } catch (error) {
            this.logger.error(
                `Error scraping channel ${url}: ${error.message}`,
            );
            if (error.stack) {
                this.logger.debug(error.stack);
            }
        }
    }
}
