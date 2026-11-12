import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findAll(): Promise<Category[]> {
        return await this.categoryRepository.find({ order: { name: 'ASC' } });
    }

    // detail kategori sekaligus daftar produk di dalamnya
    async findById(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: { products: true },
        });
        if (!category) {
            throw new NotFoundException(`Kategori ${id} tidak ditemukan`);
        }
        return category;
    }

    async create(dto: CreateCategoryDto): Promise<Category> {
        await this.ensureNameAvailable(dto.name);
        return await this.categoryRepository.save(this.categoryRepository.create(dto));
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
        await this.findById(id);
        if (dto.name !== undefined) {
            await this.ensureNameAvailable(dto.name, id);
        }

        const data = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)) as UpdateCategoryDto;
        if (Object.keys(data).length > 0) {
            await this.categoryRepository.update(id, data);
        }
        return await this.findById(id);
    }

    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findById(id);

        const productCount = await this.productRepository.count({ where: { category_id: id } });
        if (productCount > 0) {
            throw new ConflictException(
                `Kategori tidak bisa dihapus karena masih dipakai ${productCount} produk`,
            );
        }

        await this.categoryRepository.delete(id);
        return { message: `Kategori ${id} berhasil dihapus`, deletedId: id };
    }

    private async ensureNameAvailable(name: string, exceptId?: string) {
        const existing = await this.categoryRepository.findOneBy({ name });
        if (existing && existing.id !== exceptId) {
            throw new ConflictException(`Kategori dengan nama "${name}" sudah ada`);
        }
    }
}