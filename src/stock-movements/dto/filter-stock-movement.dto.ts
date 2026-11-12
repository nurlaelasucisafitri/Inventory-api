import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MovementType } from '../enums/movement-type.enum.js';

export class FilterStockMovementDto {
    @IsOptional()
    @IsEnum(MovementType, { message: 'type harus IN atau OUT' })
    type?: MovementType;

    @IsOptional()
    @IsUUID('all', { message: 'warehouse_id harus berupa UUID' })
    warehouse_id?: string;
}