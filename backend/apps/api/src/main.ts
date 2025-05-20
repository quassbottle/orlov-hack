import { INestApplication, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

const enableCorsByEnv = (app: INestApplication<unknown>) => {
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  });
};

const setupDocumentation = async (app: INestApplication) => {
  const documentConfig = new DocumentBuilder()
    .setTitle('API')
    .setDescription(' API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api/v1/docs/swagger', app, document, {
    swaggerOptions: {
      defaultModelRendering: 'model',
      defaultModelsExpandDepth: 0,
      defaultModelExpandDepth: 10,
    },
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = app.get<ConfigService>(ConfigService);

  setupDocumentation(app);
  enableCorsByEnv(app);

  await app.listen(config.get<number>('PORT') ?? 3001);
}

bootstrap();
