import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import type { Relation } from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

// Stub entity – implementasi lengkap ada di modul StockMovements (anggota lain)
@Entity({ name: 'stock_movement_items' })
export class StockMovementItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'product_id' })
    product_id: string;

    @ManyToOne('Product', 'movementItems')
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @Column({ type: 'int', default: 0 })
    quantity: number;
}
