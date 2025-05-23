import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ScraperModule } from './modules/scraper/scraper.module';


async function bootstrap() {
    const app =
        await NestFactory.createMicroservice<MicroserviceOptions>(
            ScraperModule,
        );
    await app.listen();
}
bootstrap();
