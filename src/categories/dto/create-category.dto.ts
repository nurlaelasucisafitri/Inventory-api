import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty({ message: 'name harus diisi' })
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}