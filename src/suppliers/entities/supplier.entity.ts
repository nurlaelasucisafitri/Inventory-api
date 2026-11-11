import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Stub entity – implementasi lengkap ada di modul Suppliers (anggota lain)
@Entity({ name: 'suppliers' })
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 150 })
    name: string;
}
