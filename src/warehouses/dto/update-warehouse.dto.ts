import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWarehouseDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'name tidak boleh kosong' })
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;
}
