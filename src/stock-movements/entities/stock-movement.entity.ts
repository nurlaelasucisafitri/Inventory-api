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
import { Warehouse } from '../../warehouses/entities/warehouse.entity.js';
import { StockMovementItem } from './stock-movement-item.entity.js';
import { MovementType } from '../enums/movement-type.enum.js';

@Entity({ name: 'stock_movements' })
export class StockMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    reference_number: string;

    @Column({ type: 'enum', enum: MovementType })
    type: MovementType;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    movement_date: Date;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'uuid', name: 'warehouse_id' })
    warehouse_id: string;

    // banyak transaksi terjadi di satu gudang
    @ManyToOne('Warehouse', 'stockMovements', { nullable: false })
    @JoinColumn({ name: 'warehouse_id' })
    warehouse: Relation<Warehouse>;

    // satu transaksi memiliki banyak detail barang
    @OneToMany('StockMovementItem', 'stockMovement')
    items: StockMovementItem[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}