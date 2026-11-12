import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesController } from './warehouses.controller.js';
import { WarehousesService } from './warehouses.service.js';
import { Warehouse } from './entities/warehouse.entity.js';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Warehouse, StockMovement])],
    controllers: [WarehousesController],
    providers: [WarehousesService],
})
export class WarehousesModule {}