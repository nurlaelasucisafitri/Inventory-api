import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

@Entity({ name: 'categories' })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    // satu kategori memiliki banyak produk
    @OneToMany('Product', 'category')
    products: Product[];

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;
}