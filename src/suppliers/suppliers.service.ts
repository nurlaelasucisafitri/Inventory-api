import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private readonly supplierRepository: Repository<Supplier>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findAll(): Promise<Supplier[]> {
        return await this.supplierRepository.find({ order: { name: 'ASC' } });
    }

    // detail pemasok sekaligus produk yang dipasoknya
    async findById(id: string): Promise<Supplier> {
        const supplier = await this.supplierRepository.findOne({
            where: { id },
            relations: { products: true },
        });
        if (!supplier) {
            throw new NotFoundException(`Pemasok ${id} tidak ditemukan`);
        }
        return supplier;
    }

    async create(dto: CreateSupplierDto): Promise<Supplier> {
        if (dto.email) {
            await this.ensureEmailAvailable(dto.email);
        }
        return await this.supplierRepository.save(this.supplierRepository.create(dto));
    }

    async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
        await this.findById(id);
        if (dto.email) {
            await this.ensureEmailAvailable(dto.email, id);
        }

        const data = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)) as UpdateSupplierDto;
        if (Object.keys(data).length > 0) {
            await this.supplierRepository.update(id, data);
        }
        return await this.findById(id);
    }

    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findById(id);

        const productCount = await this.productRepository.count({ where: { supplier_id: id } });
        if (productCount > 0) {
            throw new ConflictException(
                `Pemasok tidak bisa dihapus karena masih memasok ${productCount} produk`,
            );
        }

        await this.supplierRepository.delete(id);
        return { message: `Pemasok ${id} berhasil dihapus`, deletedId: id };
    }

    private async ensureEmailAvailable(email: string, exceptId?: string) {
        const existing = await this.supplierRepository.findOneBy({ email });
        if (existing && existing.id !== exceptId) {
            throw new ConflictException(`Email "${email}" sudah dipakai pemasok lain`);
        }
    }
}