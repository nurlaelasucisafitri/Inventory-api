import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // validasi DTO untuk semua endpoint
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // buang field yang tidak ada di DTO
            forbidNonWhitelisted: true, // field asing -> 400
            transform: true, // ubah payload menjadi instance DTO
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
    await app.listen(port);
    console.log(`Inventory API berjalan di http://localhost:${port}`);
}

bootstrap();