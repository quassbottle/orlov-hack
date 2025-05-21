import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TelegramService.name);
    private readonly client: TelegramClient;

    constructor(configService: ConfigService) {
        const session = new StringSession(
            configService.getOrThrow<string>('TELEGRAM_API_TOKEN'),
        );

        this.client = new TelegramClient(
            session,
            Number(configService.getOrThrow<number>('TELEGRAM_API_ID')),
            configService.getOrThrow<string>('TELEGRAM_API_HASH'),
            {
                connectionRetries: 5,
                langCode: 'en',
            },
        );
    }

    public get instance() {
        return this.client;
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }

    async onModuleInit() {
        await this.client.connect();
        const me = await this.client.getMe();
        this.logger.log(`Logged in as ${me.firstName} (${me.id})`);
    }
}
