import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';

@Module({
  imports: [
    // membaca file .env dan memvalidasinya
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),

    // koneksi database PostgreSQL lewat TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true, // entity didaftarkan lewat TypeOrmModule.forFeature di tiap module
        synchronize: config.get<string>('NODE_ENV') === 'development', // tabel dibuat otomatis (hanya development)
      }),
    }),
    
    CategoriesModule,
    
    SuppliersModule,
    
    WarehousesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
