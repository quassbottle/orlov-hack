import { NestFactory } from '@nestjs/core';
import { ScraperModule } from './scraper.module';

async function bootstrap() {
  const app = await NestFactory.create(ScraperModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
