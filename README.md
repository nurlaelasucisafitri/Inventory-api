# Inventory Management API

Backend aplikasi pengelolaan persediaan barang (Studi Kasus 1) memakai **NestJS**, **TypeORM**, dan **PostgreSQL**.
Mencakup kategori, pemasok, gudang, produk, serta transaksi pergerakan stok (barang masuk dan keluar).

## Anggota kelompok dan pembagian tugas

| Anggota | Modul / tugas |
|---------|---------------|
| Nur Laela Suci Safitri | Setup project, Categories, README, perancangan, ERD |
| (nama anggota 2) | Suppliers, Warehouses |
| Alief Satrio | Products, Stocks (informasi stok) |
| (nama anggota 4) | Stock Movements (transaksi barang masuk/keluar) |

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/PERANCANGAN.md](docs/PERANCANGAN.md) | Kebutuhan, alur pengguna, aturan bisnis, keputusan desain |
| [docs/ERD.md](docs/ERD.md) dan [docs/erd.png](docs/erd.png) | ERD |
| [docs/api-spec/](docs/api-spec/) | API Specification per modul |
| [docs/postman/](docs/postman/) | Postman Collection |

### 2. Konfigurasi environment
Buat file bernama `.env` di folder utama (sejajar dengan `package.json`). isinya:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=isi_password_pilihanmu
DB_DATABASE=inventory_db
```
