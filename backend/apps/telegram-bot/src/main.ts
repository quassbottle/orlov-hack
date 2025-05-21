import { NestFactory } from '@nestjs/core';
import { TelegramBotModule } from './modules/telegram-bot.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(TelegramBotModule);
    await app.listen();
}
bootstrap();
