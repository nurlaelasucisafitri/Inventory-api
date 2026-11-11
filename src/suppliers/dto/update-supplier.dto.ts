import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'name tidak boleh kosong' })
    @MaxLength(150)
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'email tidak valid' })
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
