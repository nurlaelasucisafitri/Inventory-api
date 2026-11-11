import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Stub entity – implementasi lengkap ada di modul Warehouses (anggota lain)
@Entity({ name: 'warehouses' })
export class Warehouse {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;
}
