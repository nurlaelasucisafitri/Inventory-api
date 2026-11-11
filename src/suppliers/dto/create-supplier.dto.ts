import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty({ message: 'name harus diisi' })
    @MaxLength(150)
    name: string;

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
