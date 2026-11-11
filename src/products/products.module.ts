import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { Product } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Supplier } from '../suppliers/entities/supplier.entity.js';
import { StockMovementItem } from '../stock-movements/entities/stock-movement-item.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category, Supplier, StockMovementItem])],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
