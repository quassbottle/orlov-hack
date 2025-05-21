import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScraperWorker } from './scraper.worker';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
    providers: [ScraperWorker],
    imports: [
        ConfigModule.forRoot(),
        ClientsModule.registerAsync({
            clients: [
                {
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => ({
                        name: 'SCRAPER_PRODUCER',
                        transport: Transport.KAFKA,
                        options: {
                            client: {
                                clientId: 'scraper',
                                brokers: [
                                    config.get<string>('KAFKA_ENDPOINT')!,
                                ],
                            },
                            producerOnlyMode: true,
                        },
                    }),
                    name: 'SCRAPER_PRODUCER',
                },
            ],
        }),
        TelegramModule,
    ],
})
export class ScraperModule {}
