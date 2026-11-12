import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { StockMovementItemDto } from './create-stock-movement.dto.js';

// type (IN/OUT) dan reference_number sengaja tidak bisa diubah
export class UpdateStockMovementDto {
    @IsOptional()
    @IsUUID('all', { message: 'warehouse_id harus berupa UUID' })
    warehouse_id?: string;

    @IsOptional()
    @IsDateString({}, { message: 'movement_date harus format tanggal ISO' })
    movement_date?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    // jika dikirim, seluruh detail lama DIGANTI dengan daftar ini
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1, { message: 'items minimal 1 produk' })
    @ValidateNested({ each: true })
    @Type(() => StockMovementItemDto)
    items?: StockMovementItemDto[];
}