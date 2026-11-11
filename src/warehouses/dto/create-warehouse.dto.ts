import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    @IsNotEmpty({ message: 'name harus diisi' })
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;
}
