import * as dotenv from 'dotenv';
import * as path from 'path';
// Load .env from project root before anything else
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { GlobalExceptionsFilter } from './common/filters/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5176',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // global filters must be registered before specific filters
  // Because the filters are executed in the reverse order they are registered
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new GlobalExceptionsFilter(httpAdapterHost),
    new PrismaClientExceptionFilter(),
  );

  await app.listen(3000);
}
bootstrap();
