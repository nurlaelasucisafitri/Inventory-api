import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterProductDto {
    @IsOptional()
    @IsUUID('all', { message: 'category_id harus berupa UUID' })
    category_id?: string;

    @IsOptional()
    @IsUUID('all', { message: 'supplier_id harus berupa UUID' })
    supplier_id?: string;

    // cari berdasarkan potongan nama atau sku
    @IsOptional()
    @IsString()
    search?: string;
}
