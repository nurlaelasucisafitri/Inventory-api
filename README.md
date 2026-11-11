# Inventory Management API

Backend aplikasi pengelolaan persediaan barang (Studi Kasus 1) memakai **NestJS**, **TypeORM**, dan **PostgreSQL**.
Mencakup kategori, pemasok, gudang, produk, serta transaksi pergerakan stok (barang masuk dan keluar).

## Anggota kelompok dan pembagian tugas

| Anggota | Modul / tugas |
|---------|---------------|
| (nama anggota 1) | Setup project, Categories, README, perancangan, ERD |
| (nama anggota 2) | Suppliers, Warehouses |
| (nama anggota 3) | Products, Stocks (informasi stok) |
| (nama anggota 4) | Stock Movements (transaksi barang masuk/keluar) |

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [docs/PERANCANGAN.md](docs/PERANCANGAN.md) | Kebutuhan, alur pengguna, aturan bisnis, keputusan desain |
| [docs/ERD.md](docs/ERD.md) dan [docs/erd.png](docs/erd.png) | ERD |
| [docs/api-spec/](docs/api-spec/) | API Specification per modul |
| [docs/postman/](docs/postman/) | Postman Collection |

## Prasyarat
- Node.js dan npm
- Docker Desktop (untuk PostgreSQL) atau PostgreSQL yang sudah terpasang
- Postman

## Instalasi dan menjalankan

### 1. Clone dan install dependency
```bash
git clone <link-repository>
cd inventory-api
npm install
```

### 2. Konfigurasi environment
Buat file bernama `.env` di folder utama (sejajar dengan `package.json`). File ini **tidak ada di repository**
karena berisi password, jadi setiap anggota membuatnya sendiri di komputernya. Isinya:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=isi_password_pilihanmu
DB_DATABASE=inventory_db
```

| Variabel | Keterangan |
|----------|------------|
| `PORT` | Port aplikasi (default 3000) |
| `NODE_ENV` | `development` / `staging` / `production`. Tabel dibuat otomatis hanya pada `development` |
| `DB_HOST` | Host database |
| `DB_PORT` | Port database. Ubah (mis. `5433`) bila port 5432 sudah dipakai aplikasi lain |
| `DB_USERNAME` | User database |
| `DB_PASSWORD` | Password database (pilih sendiri, bebas) |
| `DB_DATABASE` | Nama database |

### 3. Jalankan database (Docker)
```bash
docker compose up -d
```
`docker-compose.yml` membaca nilai dari `.env`, jadi database yang dibuat otomatis cocok dengan konfigurasi aplikasi.
Reset database: `docker compose down -v` lalu `docker compose up -d`.

### 4. Migrasi database
Proyek memakai fitur **`synchronize`** TypeORM: saat aplikasi dijalankan dengan `NODE_ENV=development`,
tabel dibuat dan disesuaikan otomatis dari file `*.entity.ts`. Tidak ada perintah migrasi manual.
(Untuk production sebaiknya memakai TypeORM migration.)

### 5. Jalankan aplikasi
```bash
npm run start:dev
```
Berhasil jika muncul `Nest application successfully started`. Cek di browser: `http://localhost:3000`.

## Pengujian dengan Postman
Import file di `docs/postman/` ke Postman, lalu klik kanan collection, pilih **Run collection**.
Jalankan pada database yang masih kosong, dan jalankan berurutan.

## Alur kerja Git kelompok
1. Setiap anggota membuat branch sendiri: `git checkout -b feature/nama-modul`.
2. Commit kecil dan sering dengan pesan jelas, lalu `git push -u origin feature/nama-modul`.
3. Buat **Pull Request** ke `main` di GitHub, lalu digabung setelah direview anggota lain.
4. Sebelum mulai bekerja: `git checkout main` lalu `git pull origin main`.

## Struktur folder
```
src/
├── main.ts                # titik masuk: ValidationPipe, interceptor, filter
├── app.module.ts          # konfigurasi .env + koneksi database + daftar module
├── common/                # interceptor response, filter error, transformer decimal
└── <modul>/               # entities/, dto/, *.service.ts, *.controller.ts, *.module.ts
docs/                      # perancangan, ERD, API spec, Postman collection
```

## Troubleshooting
| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED` | Database belum jalan: nyalakan Docker Desktop, lalu `docker compose up -d` |
| `password authentication failed` | `DB_PASSWORD` di `.env` berbeda dengan saat database pertama dibuat: `docker compose down -v`, lalu `docker compose up -d` |
| `port is already allocated` | Port database bentrok: ubah `DB_PORT` di `.env` (mis. 5433), lalu `docker compose up -d` lagi |
| `Config validation error` | Ada variabel `.env` yang kosong atau salah |
