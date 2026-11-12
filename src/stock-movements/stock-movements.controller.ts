import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto.js';
import { FilterStockMovementDto } from './dto/filter-stock-movement.dto.js';

@Controller('stock-movements')
export class StockMovementsController {
    constructor(private readonly stockMovementsService: StockMovementsService) {}

    @Get()
    findAll(@Query() filter: FilterStockMovementDto) {
        return this.stockMovementsService.findAll(filter);
    }

    @Get(':id')
    findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.stockMovementsService.findById(id);
    }

    @Post()
    create(@Body() dto: CreateStockMovementDto) {
        return this.stockMovementsService.create(dto);
    }

    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStockMovementDto) {
        return this.stockMovementsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.stockMovementsService.remove(id);
    }
}