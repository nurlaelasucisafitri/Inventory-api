import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity.js';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';

@Injectable()
export class WarehousesService {
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
        @InjectRepository(StockMovement)
        private readonly movementRepository: Repository<StockMovement>,
    ) {}

    async findAll(): Promise<Warehouse[]> {
        return await this.warehouseRepository.find({ order: { name: 'ASC' } });
    }

    async findById(id: string): Promise<Warehouse> {
        const warehouse = await this.warehouseRepository.findOneBy({ id });
        if (!warehouse) {
            throw new NotFoundException(`Gudang ${id} tidak ditemukan`);
        }
        return warehouse;
    }

    async create(dto: CreateWarehouseDto): Promise<Warehouse> {
        await this.ensureNameAvailable(dto.name);
        return await this.warehouseRepository.save(this.warehouseRepository.create(dto));
    }

    async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
        await this.findById(id);
        if (dto.name !== undefined) {
            await this.ensureNameAvailable(dto.name, id);
        }

        const data = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)) as UpdateWarehouseDto;
        if (Object.keys(data).length > 0) {
            await this.warehouseRepository.update(id, data);
        }
        return await this.findById(id);
    }

    async remove(id: string): Promise<{ message: string; deletedId: string }> {
        await this.findById(id);

        const movementCount = await this.movementRepository.count({ where: { warehouse_id: id } });
        if (movementCount > 0) {
            throw new ConflictException(
                `Gudang tidak bisa dihapus karena sudah memiliki ${movementCount} transaksi stok`,
            );
        }

        await this.warehouseRepository.delete(id);
        return { message: `Gudang ${id} berhasil dihapus`, deletedId: id };
    }

    private async ensureNameAvailable(name: string, exceptId?: string) {
        const existing = await this.warehouseRepository.findOneBy({ name });
        if (existing && existing.id !== exceptId) {
            throw new ConflictException(`Gudang dengan nama "${name}" sudah ada`);
        }
    }
}