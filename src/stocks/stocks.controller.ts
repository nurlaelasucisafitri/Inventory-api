import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import { StocksService } from './stocks.service.js';

class StockQueryDto {
    @IsOptional()
    @IsUUID('all', { message: 'warehouse_id harus berupa UUID' })
    warehouse_id?: string;
}

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) {}

    // GET /stocks?warehouse_id=...
    @Get()
    findAll(@Query() query: StockQueryDto) {
        return this.stocksService.findAll(query.warehouse_id);
    }

    // GET /stocks/products/:productId
    @Get('products/:productId')
    findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
        return this.stocksService.findByProduct(productId);
    }
}
