import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementsController } from './stock-movements.controller.js';
import { StockMovementsService } from './stock-movements.service.js';
import { StockMovement } from './entities/stock-movement.entity.js';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';
import { Warehouse } from '../warehouses/entities/warehouse.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { StocksModule } from '../stocks/stocks.module.js';

@Module({
    imports: [TypeOrmModule.forFeature([StockMovement, StockMovementItem, Warehouse, Product]), StocksModule],
    controllers: [StockMovementsController],
    providers: [StockMovementsService],
})
export class StockMovementsModule {}