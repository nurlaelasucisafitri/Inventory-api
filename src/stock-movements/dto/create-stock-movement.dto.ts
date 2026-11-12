import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { MovementType } from '../enums/movement-type.enum.js';

export class StockMovementItemDto {
    @IsUUID('all', { message: 'product_id harus berupa UUID' })
    product_id: string;

    @IsInt({ message: 'quantity harus bilangan bulat' })
    @Min(1, { message: 'quantity minimal 1' })
    quantity: number;
}

export class CreateStockMovementDto {
    @IsEnum(MovementType, { message: 'type harus IN atau OUT' })
    type: MovementType;

    @IsUUID('all', { message: 'warehouse_id harus berupa UUID' })
    warehouse_id: string;

    // opsional: kalau kosong dibuat otomatis (contoh: IN-20261106-4821)
    @IsOptional()
    @IsString()
    @MaxLength(50)
    reference_number?: string;

    @IsOptional()
    @IsDateString({}, { message: 'movement_date harus format tanggal ISO, contoh 2026-11-06T08:00:00Z' })
    movement_date?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'items minimal 1 produk' })
    @ValidateNested({ each: true })
    @Type(() => StockMovementItemDto)
    items: StockMovementItemDto[];
}