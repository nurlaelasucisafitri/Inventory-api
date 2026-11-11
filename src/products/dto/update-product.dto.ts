import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'sku tidak boleh kosong' })
    @MaxLength(50)
    sku?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'name tidak boleh kosong' })
    @MaxLength(150)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    min_stock?: number;

    @IsOptional()
    @IsUUID('all', { message: 'category_id harus berupa UUID' })
    category_id?: string;

    @IsOptional()
    @IsUUID('all', { message: 'supplier_id harus berupa UUID' })
    supplier_id?: string;
}
