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

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: 'sku harus diisi' })
    @MaxLength(50)
    sku: string;

    @IsString()
    @IsNotEmpty({ message: 'name harus diisi' })
    @MaxLength(150)
    name: string;

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

    @IsUUID('all', { message: 'category_id harus berupa UUID' })
    category_id: string;

    @IsUUID('all', { message: 'supplier_id harus berupa UUID' })
    supplier_id: string;
}
