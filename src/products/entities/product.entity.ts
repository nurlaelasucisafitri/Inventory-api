import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { Supplier } from '../../suppliers/entities/supplier.entity.js';
import { StockMovementItem } from '../../stock-movements/entities/stock-movement-item.entity.js';
import { numericTransformer } from '../../common/transformers/numeric.transformer.js';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    sku: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', length: 20, default: 'pcs' })
    unit: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, transformer: numericTransformer })
    price: number;

    // batas stok minimum, dipakai untuk penanda "stok menipis"
    @Column({ type: 'int', default: 0 })
    min_stock: number;

    @Column({ type: 'uuid', name: 'category_id' })
    category_id: string;

    // banyak produk dimiliki satu kategori
    @ManyToOne('Category', 'products', { nullable: false })
    @JoinColumn({ name: 'category_id' })
    category: Relation<Category>;

    @Column({ type: 'uuid', name: 'supplier_id' })
    supplier_id: string;

    // banyak produk dipasok satu pemasok
    @ManyToOne('Supplier', 'products', { nullable: false })
    @JoinColumn({ name: 'supplier_id' })
    supplier: Relation<Supplier>;

    // satu produk bisa muncul di banyak detail transaksi stok
    @OneToMany('StockMovementItem', 'product')
    movementItems: StockMovementItem[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}
