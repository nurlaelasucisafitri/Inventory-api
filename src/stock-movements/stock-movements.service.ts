import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity.js';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';
import { Warehouse } from '../warehouses/entities/warehouse.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { StocksService } from '../stocks/stocks.service.js';
import { CreateStockMovementDto, StockMovementItemDto } from './dto/create-stock-movement.dto.js';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto.js';
import { FilterStockMovementDto } from './dto/filter-stock-movement.dto.js';

@Injectable()
export class StockMovementsService {
    constructor(
        @InjectRepository(StockMovement)
        private readonly movementRepository: Repository<StockMovement>,
        private readonly stocksService: StocksService,
        private readonly dataSource: DataSource,
    ) {}

    private readonly relations = { warehouse: true, items: { product: true } };

    async findAll(filter: FilterStockMovementDto): Promise<StockMovement[]> {
        return await this.movementRepository.find({
            where: {
                ...(filter.type ? { type: filter.type } : {}),
                ...(filter.warehouse_id ? { warehouse_id: filter.warehouse_id } : {}),
            },
            relations: this.relations,
            order: { movement_date: 'DESC', created_at: 'DESC' },
        });
    }

    async findById(id: string): Promise<StockMovement> {
        const movement = await this.movementRepository.findOne({
            where: { id },
            relations: this.relations,
        });
        if (!movement) {
            throw new NotFoundException(`Transaksi stok ${id} tidak ditemukan`);
        }
        return movement;
    }

    // Membuat transaksi + detail barang dalam SATU database transaction.
    async create(dto: CreateStockMovementDto): Promise<StockMovement> {
        this.assertNoDuplicateProducts(dto.items);

        const id = await this.dataSource.transaction(async (manager) => {
            await this.assertWarehouseExists(manager, dto.warehouse_id);
            await this.assertProductsExist(manager, dto.items);

            const reference = dto.reference_number ?? this.generateReference(dto.type);
            const duplicate = await manager.findOneBy(StockMovement, { reference_number: reference });
            if (duplicate) {
                throw new ConflictException(`Nomor referensi "${reference}" sudah dipakai`);
            }

            const movement = await manager.save(
                manager.create(StockMovement, {
                    reference_number: reference,
                    type: dto.type,
                    warehouse_id: dto.warehouse_id,
                    notes: dto.notes ?? null,
                    ...(dto.movement_date ? { movement_date: new Date(dto.movement_date) } : {}),
                }),
            );

            await this.insertItems(manager, movement.id, dto.items);

            // barang keluar tidak boleh membuat stok menjadi minus
            await this.stocksService.assertNoNegativeStock(
                manager,
                [dto.warehouse_id],
                dto.items.map((i) => i.product_id),
            );

            return movement.id;
        });

        return await this.findById(id);
    }

    // Mengubah transaksi. Jenis (IN/OUT) tidak bisa diubah.
    async update(id: string, dto: UpdateStockMovementDto): Promise<StockMovement> {
        if (dto.items) {
            this.assertNoDuplicateProducts(dto.items);
        }

        await this.dataSource.transaction(async (manager) => {
            const movement = await manager.findOne(StockMovement, {
                where: { id },
                relations: { items: true },
            });
            if (!movement) {
                throw new NotFoundException(`Transaksi stok ${id} tidak ditemukan`);
            }

            const oldWarehouseId = movement.warehouse_id;
            const affectedProducts = new Set(movement.items.map((i) => i.product_id));

            if (dto.warehouse_id) {
                await this.assertWarehouseExists(manager, dto.warehouse_id);
            }

            // update data header (hanya field yang dikirim)
            const header: Partial<StockMovement> = {};
            if (dto.warehouse_id !== undefined) header.warehouse_id = dto.warehouse_id;
            if (dto.notes !== undefined) header.notes = dto.notes;
            if (dto.movement_date !== undefined) header.movement_date = new Date(dto.movement_date);
            if (Object.keys(header).length > 0) {
                await manager.update(StockMovement, id, header);
            }

            // ganti semua detail jika items dikirim
            if (dto.items) {
                await this.assertProductsExist(manager, dto.items);
                await manager.delete(StockMovementItem, { stock_movement_id: id });
                await this.insertItems(manager, id, dto.items);
                dto.items.forEach((i) => affectedProducts.add(i.product_id));
            }

            // cek ulang stok di gudang lama dan gudang baru
            const warehouseIds = [...new Set([oldWarehouseId, dto.warehouse_id ?? oldWarehouseId])];
            await this.stocksService.assertNoNegativeStock(manager, warehouseIds, [...affectedProducts]);
        });

        return await this.findById(id);
    }

    // Menghapus transaksi. Ditolak (422) jika penghapusan membuat stok menjadi minus
    // (contoh: menghapus barang masuk yang barangnya sudah keluar).
    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.dataSource.transaction(async (manager) => {
            const movement = await manager.findOne(StockMovement, {
                where: { id },
                relations: { items: true },
            });
            if (!movement) {
                throw new NotFoundException(`Transaksi stok ${id} tidak ditemukan`);
            }

            await manager.delete(StockMovement, id); // detail ikut terhapus (ON DELETE CASCADE)
            await this.stocksService.assertNoNegativeStock(
                manager,
                [movement.warehouse_id],
                movement.items.map((i) => i.product_id),
            );
        });

        return { message: `Transaksi stok ${id} berhasil dihapus`, deletedId: id };
    }

    // ---------- helper ----------
    private assertNoDuplicateProducts(items: StockMovementItemDto[]) {
        const ids = items.map((i) => i.product_id);
        if (new Set(ids).size !== ids.length) {
            throw new BadRequestException('Produk yang sama tidak boleh muncul dua kali dalam satu transaksi');
        }
    }

    private async assertWarehouseExists(manager: EntityManager, warehouseId: string) {
        const warehouse = await manager.findOneBy(Warehouse, { id: warehouseId });
        if (!warehouse) {
            throw new NotFoundException(`Gudang ${warehouseId} tidak ditemukan`);
        }
    }

    private async assertProductsExist(manager: EntityManager, items: StockMovementItemDto[]) {
        const ids = items.map((i) => i.product_id);
        const found = await manager.findBy(Product, { id: In(ids) });
        const missing = ids.filter((id) => !found.some((p) => p.id === id));
        if (missing.length > 0) {
            throw new NotFoundException(`Produk tidak ditemukan: ${missing.join(', ')}`);
        }
    }

    private async insertItems(manager: EntityManager, movementId: string, items: StockMovementItemDto[]) {
        await manager.save(
            items.map((i) =>
                manager.create(StockMovementItem, {
                    stock_movement_id: movementId,
                    product_id: i.product_id,
                    quantity: i.quantity,
                }),
            ),
        );
    }

    private generateReference(type: string): string {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${type}-${date}-${random}`;
    }
}