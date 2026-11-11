import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { Warehouse } from '../warehouses/entities/warehouse.entity.js';
import { StockMovementItem } from '../stock-movements/entities/stock-movement-item.entity.js';

// Stok TIDAK disimpan di tabel produk. Stok selalu dihitung dari transaksi:
//   stok = jumlah semua barang masuk (IN) - jumlah semua barang keluar (OUT)
const STOCK_SUM = `SUM(CASE WHEN movement.type = 'IN' THEN item.quantity ELSE -item.quantity END)`;

@Injectable()
export class StocksService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(StockMovementItem)
        private readonly itemRepository: Repository<StockMovementItem>,
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
    ) {}

    // ringkasan stok semua produk (opsional: hanya satu gudang)
    async findAll(warehouseId?: string) {
        if (warehouseId) {
            const warehouse = await this.warehouseRepository.findOneBy({ id: warehouseId });
            if (!warehouse) {
                throw new NotFoundException(`Gudang ${warehouseId} tidak ditemukan`);
            }
        }

        const query = this.itemRepository
            .createQueryBuilder('item')
            .innerJoin('item.stockMovement', 'movement')
            .select('item.product_id', 'product_id')
            .addSelect(STOCK_SUM, 'stock')
            .groupBy('item.product_id');
        if (warehouseId) {
            query.where('movement.warehouse_id = :warehouseId', { warehouseId });
        }
        const rows = await query.getRawMany<{ product_id: string; stock: string }>();
        const stockByProduct = new Map(rows.map((r) => [r.product_id, Number(r.stock)]));

        const products = await this.productRepository.find({
            relations: { category: true },
            order: { name: 'ASC' },
        });

        return products.map((p) => {
            const stock = stockByProduct.get(p.id) ?? 0;
            return {
                product_id: p.id,
                sku: p.sku,
                name: p.name,
                unit: p.unit,
                category: p.category?.name ?? null,
                min_stock: p.min_stock,
                stock,
                is_low_stock: stock <= p.min_stock,
            };
        });
    }

    // detail stok satu produk: total masuk, total keluar, stok, dan rinciannya per gudang
    async findByProduct(productId: string) {
        const product = await this.productRepository.findOne({
            where: { id: productId },
            relations: { category: true },
        });
        if (!product) {
            throw new NotFoundException(`Produk ${productId} tidak ditemukan`);
        }

        const rows = await this.itemRepository
            .createQueryBuilder('item')
            .innerJoin('item.stockMovement', 'movement')
            .innerJoin('movement.warehouse', 'warehouse')
            .select('warehouse.id', 'warehouse_id')
            .addSelect('warehouse.name', 'warehouse_name')
            .addSelect(`SUM(CASE WHEN movement.type = 'IN' THEN item.quantity ELSE 0 END)`, 'total_in')
            .addSelect(`SUM(CASE WHEN movement.type = 'OUT' THEN item.quantity ELSE 0 END)`, 'total_out')
            .where('item.product_id = :productId', { productId })
            .groupBy('warehouse.id')
            .addGroupBy('warehouse.name')
            .orderBy('warehouse.name', 'ASC')
            .getRawMany<{ warehouse_id: string; warehouse_name: string; total_in: string; total_out: string }>();

        const warehouses = rows.map((r) => ({
            warehouse_id: r.warehouse_id,
            warehouse_name: r.warehouse_name,
            total_in: Number(r.total_in),
            total_out: Number(r.total_out),
            stock: Number(r.total_in) - Number(r.total_out),
        }));
        const total_in = warehouses.reduce((sum, w) => sum + w.total_in, 0);
        const total_out = warehouses.reduce((sum, w) => sum + w.total_out, 0);
        const stock = total_in - total_out;

        return {
            product_id: product.id,
            sku: product.sku,
            name: product.name,
            unit: product.unit,
            category: product.category?.name ?? null,
            min_stock: product.min_stock,
            total_in,
            total_out,
            stock,
            is_low_stock: stock <= product.min_stock,
            warehouses,
        };
    }

    // Dipanggil setelah transaksi stok dibuat/diubah/dihapus (di dalam database transaction).
    // Jika ada produk yang stoknya menjadi minus di gudang terkait -> error 422 dan transaksi dibatalkan.
    async assertNoNegativeStock(manager: EntityManager, warehouseIds: string[], productIds: string[]) {
        if (warehouseIds.length === 0 || productIds.length === 0) return;

        const rows = await manager
            .createQueryBuilder(StockMovementItem, 'item')
            .innerJoin('item.stockMovement', 'movement')
            .select('movement.warehouse_id', 'warehouse_id')
            .addSelect('item.product_id', 'product_id')
            .addSelect(STOCK_SUM, 'stock')
            .where('movement.warehouse_id IN (:...warehouseIds)', { warehouseIds })
            .andWhere('item.product_id IN (:...productIds)', { productIds })
            .groupBy('movement.warehouse_id')
            .addGroupBy('item.product_id')
            .getRawMany<{ warehouse_id: string; product_id: string; stock: string }>();

        const negative = rows.filter((r) => Number(r.stock) < 0);
        if (negative.length === 0) return;

        const products = await manager.findBy(Product, { id: In(negative.map((r) => r.product_id)) });
        const warehouses = await manager.findBy(Warehouse, { id: In(negative.map((r) => r.warehouse_id)) });
        const details = negative.map((r) => {
            const product = products.find((p) => p.id === r.product_id);
            const warehouse = warehouses.find((w) => w.id === r.warehouse_id);
            return `produk "${product?.name}" di gudang "${warehouse?.name}" kekurangan ${Math.abs(Number(r.stock))} ${product?.unit ?? 'unit'}`;
        });
        throw new UnprocessableEntityException(`Stok tidak mencukupi: ${details.join('; ')}`);
    }
}
