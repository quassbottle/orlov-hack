import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    providers: [TelegramService],
    exports: [TelegramService],
    imports: [ConfigModule.forRoot()],
})
export class TelegramModule {}
