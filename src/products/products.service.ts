import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { Supplier } from '../suppliers/entities/supplier.entity.js';
import { StockMovementItem } from '../stock-movements/entities/stock-movement-item.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { FilterProductDto } from './dto/filter-product.dto.js';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Supplier)
        private readonly supplierRepository: Repository<Supplier>,
        @InjectRepository(StockMovementItem)
        private readonly itemRepository: Repository<StockMovementItem>,
    ) {}

    async findAll(filter: FilterProductDto): Promise<Product[]> {
        const base: FindOptionsWhere<Product> = {};
        if (filter.category_id) base.category_id = filter.category_id;
        if (filter.supplier_id) base.supplier_id = filter.supplier_id;

        // pencarian: nama ATAU sku mengandung kata kunci
        const where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] = filter.search
            ? [
                  { ...base, name: ILike(`%${filter.search}%`) },
                  { ...base, sku: ILike(`%${filter.search}%`) },
              ]
            : base;

        return await this.productRepository.find({
            where,
            relations: { category: true, supplier: true },
            order: { name: 'ASC' },
        });
    }

    async findById(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: { category: true, supplier: true },
        });
        if (!product) {
            throw new NotFoundException(`Produk ${id} tidak ditemukan`);
        }
        return product;
    }

    async create(dto: CreateProductDto): Promise<Product> {
        await this.ensureSkuAvailable(dto.sku);
        await this.checkRelations(dto.category_id, dto.supplier_id);

        const saved = await this.productRepository.save(this.productRepository.create(dto));
        return await this.findById(saved.id);
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        await this.findById(id);
        if (dto.sku !== undefined) {
            await this.ensureSkuAvailable(dto.sku, id);
        }
        await this.checkRelations(dto.category_id, dto.supplier_id);

        const data = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)) as UpdateProductDto;
        if (Object.keys(data).length > 0) {
            await this.productRepository.update(id, data);
        }
        return await this.findById(id);
    }

    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findById(id);

        const usedCount = await this.itemRepository.count({ where: { product_id: id } });
        if (usedCount > 0) {
            throw new ConflictException(
                `Produk tidak bisa dihapus karena sudah dipakai di ${usedCount} detail transaksi stok`,
            );
        }

        await this.productRepository.delete(id);
        return { message: `Produk ${id} berhasil dihapus`, deletedId: id };
    }

    private async ensureSkuAvailable(sku: string, exceptId?: string) {
        const existing = await this.productRepository.findOneBy({ sku });
        if (existing && existing.id !== exceptId) {
            throw new ConflictException(`SKU "${sku}" sudah dipakai produk lain`);
        }
    }

    // memastikan kategori & pemasok yang dipilih benar-benar ada
    private async checkRelations(categoryId?: string, supplierId?: string) {
        if (categoryId) {
            const category = await this.categoryRepository.findOneBy({ id: categoryId });
            if (!category) {
                throw new NotFoundException(`Kategori ${categoryId} tidak ditemukan`);
            }
        }
        if (supplierId) {
            const supplier = await this.supplierRepository.findOneBy({ id: supplierId });
            if (!supplier) {
                throw new NotFoundException(`Pemasok ${supplierId} tidak ditemukan`);
            }
        }
    }
}
