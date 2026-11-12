import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity.js';

@Entity({ name: 'warehouses' })
export class Warehouse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string | null;

    // satu gudang memiliki banyak transaksi pergerakan stok
    @OneToMany('StockMovement', 'warehouse')
    stockMovements: StockMovement[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}