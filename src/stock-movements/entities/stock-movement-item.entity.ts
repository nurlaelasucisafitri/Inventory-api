import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { StockMovement } from './stock-movement.entity.js';
import { Product } from '../../products/entities/product.entity.js';

// satu produk hanya boleh muncul satu kali dalam satu transaksi
@Entity({ name: 'stock_movement_items' })
@Unique(['stock_movement_id', 'product_id'])
export class StockMovementItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'stock_movement_id' })
    stock_movement_id: string;

    // hapus transaksi -> detailnya ikut terhapus (CASCADE)
    @ManyToOne('StockMovement', 'items', { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'stock_movement_id' })
    stockMovement: Relation<StockMovement>;

    @Column({ type: 'uuid', name: 'product_id' })
    product_id: string;

    // satu produk bisa muncul di banyak detail transaksi
    @ManyToOne('Product', 'movementItems', { nullable: false })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @Column({ type: 'int' })
    quantity: number;
}