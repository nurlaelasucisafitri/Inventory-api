import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksController } from './stocks.controller.js';
import { StocksService } from './stocks.service.js';
import { Product } from '../products/entities/product.entity.js';
import { Warehouse } from '../warehouses/entities/warehouse.entity.js';
import { StockMovementItem } from '../stock-movements/stock-movements.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Warehouse, StockMovementItem])],
    controllers: [StocksController],
    providers: [StocksService],
    exports: [StocksService],
})
export class StocksModule {}
