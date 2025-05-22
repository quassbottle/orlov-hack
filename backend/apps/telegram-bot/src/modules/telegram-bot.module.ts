import { Module } from '@nestjs/common';
import { BotUpdate } from './bot/bot.update';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { ClickHouseModule } from '@app/clickhouse';
import { ClickHouseLogLevel } from '@clickhouse/client';
import { MessagesModule } from './messages/messages.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TelegrafModule.forRootAsync({
            inject: [ConfigService],
            imports: [ConfigModule],
            useFactory(configService: ConfigService) {
                return {
                    token: configService.getOrThrow('TELEGRAM_BOT_TOKEN'),
                };
            },
        }),
        ClickHouseModule.forRootAsync({
            inject: [ConfigService],
            imports: [ConfigModule],
            useFactory(configService: ConfigService) {
                return {
                    url: configService.getOrThrow('CLICKHOUSE_URL'),
                    username: 'admin',
                    password: 'password',
                    log: {
                        level: ClickHouseLogLevel.DEBUG,
                    },
                };
            },
        }),
        MessagesModule,
    ],
    providers: [BotUpdate],
})
export class TelegramBotModule {}
