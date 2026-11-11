# Perancangan Sistem: Inventory Management System

## 1. Gambaran umum
Backend untuk aplikasi pengelolaan persediaan barang. Sistem mencatat data master (kategori, pemasok, gudang, produk)
dan **transaksi pergerakan stok** (barang masuk dan barang keluar). Jumlah stok tidak diinput manual,
tetapi **dihitung dari transaksi** yang tercatat.

## 2. Aktor dan alur pengguna
Aktor: **Admin gudang** (mengelola seluruh data lewat aplikasi frontend / Postman).

Alur utama:
1. Admin membuat **kategori**, **pemasok**, dan **gudang** (data master).
2. Admin membuat **produk** dan memilih kategori serta pemasoknya.
3. Barang datang dari pemasok: admin membuat transaksi **IN** di gudang tertentu berisi daftar produk dan jumlahnya, sehingga stok bertambah.
4. Barang dijual atau dikirim: admin membuat transaksi **OUT**, sehingga stok berkurang. Jika jumlah melebihi stok, sistem menolak.
5. Admin melihat **informasi stok** per produk (total dan per gudang) atau seluruh produk, termasuk penanda stok menipis.
6. Bila ada salah input, admin dapat **merevisi** atau **menghapus** transaksi (dengan pengecekan stok tidak boleh minus).

Contoh halaman frontend yang bisa dibuat di atas API ini: Dashboard stok, Master Kategori, Master Pemasok, Master Gudang,
Master Produk, Form Barang Masuk, Form Barang Keluar, Riwayat Transaksi, Detail Stok Produk.

## 3. Kebutuhan fungsional
| Kode | Kebutuhan |
|------|-----------|
| FR-01 | CRUD kategori |
| FR-02 | CRUD pemasok |
| FR-03 | CRUD gudang |
| FR-04 | CRUD produk (terhubung ke kategori dan pemasok), dengan filter kategori, pemasok, dan pencarian nama/SKU |
| FR-05 | Mencatat transaksi barang masuk (IN) dan barang keluar (OUT) beserta detail produk dan kuantitasnya |
| FR-06 | Menampilkan daftar dan detail transaksi (dapat difilter jenis dan gudang) |
| FR-07 | Mengubah dan menghapus transaksi stok |
| FR-08 | Menampilkan informasi stok semua produk (opsional per gudang) |
| FR-09 | Menampilkan detail stok satu produk: total masuk, total keluar, stok, dan rincian per gudang |

## 4. Aturan bisnis
| Kode | Aturan | Wujud di API |
|------|--------|--------------|
| BR-01 | Stok = total barang masuk (IN) dikurangi total barang keluar (OUT). Stok tidak disimpan di tabel produk. | `StocksService` menghitung dengan `SUM(CASE ...)` |
| BR-02 | Stok per produk per gudang tidak boleh negatif. | Transaksi OUT, revisi, atau hapus yang membuat stok minus ditolak dengan **422** dan database di-rollback |
| BR-03 | Satu transaksi hanya terjadi di satu gudang, dengan jenis IN atau OUT, dan minimal 1 detail barang. | Validasi DTO |
| BR-04 | Satu produk hanya boleh muncul satu kali dalam satu transaksi. | Validasi 400 + `UNIQUE (stock_movement_id, product_id)` |
| BR-05 | Kuantitas harus bilangan bulat minimal 1. | Validasi DTO |
| BR-06 | Jenis transaksi (IN/OUT) dan nomor referensi tidak dapat diubah setelah dibuat. | DTO update tidak menerima `type` dan `reference_number` (400) |
| BR-07 | SKU produk, nama kategori, nama gudang, email pemasok, dan nomor referensi harus unik. | 409 Conflict |
| BR-08 | Produk wajib punya kategori dan pemasok yang valid. | 404 bila id kategori/pemasok tidak ada |
| BR-09 | Data master yang masih dipakai tidak boleh dihapus (kategori, pemasok, gudang, produk). | 409 Conflict |
| BR-10 | Penyimpanan transaksi dan detailnya bersifat atomik (semua tersimpan atau tidak sama sekali). | `DataSource.transaction` |
| BR-11 | Produk dianggap "stok menipis" jika `stok <= min_stock`. | Field `is_low_stock` |

## 5. Rancangan database
Lihat [ERD.md](./ERD.md). Ringkasan tabel:

| Tabel | Kolom utama |
|-------|-------------|
| `categories` | id (PK), name (unik), description |
| `suppliers` | id (PK), name, email (unik), phone, address |
| `warehouses` | id (PK), name (unik), location |
| `products` | id (PK), sku (unik), name, description, unit, price, min_stock, category_id (FK), supplier_id (FK) |
| `stock_movements` | id (PK), reference_number (unik), type (IN/OUT), movement_date, notes, warehouse_id (FK) |
| `stock_movement_items` | id (PK), stock_movement_id (FK, cascade), product_id (FK), quantity |

Semua tabel memakai primary key **UUID** dan kolom `created_at`/`updated_at` (kecuali tabel detail).

## 6. Keputusan desain
1. **Stok dihitung, bukan disimpan.** Dengan begitu data stok selalu konsisten dengan riwayat transaksi (tidak ada kolom stok yang bisa "tidak cocok").
   Konsekuensi: setiap kali stok ditanyakan, sistem menjumlahkan transaksi (cukup cepat untuk skala tugas ini).
2. **Pengecekan stok setelah perubahan, dalam database transaction.** Perubahan disimpan dulu, lalu stok akibatnya dicek;
   bila ada yang minus, error dilempar sehingga seluruh perubahan dibatalkan (rollback). Cara ini juga menangani revisi dan penghapusan transaksi.
3. **Hapus data master memakai hard delete** dengan pengecekan relasi terlebih dahulu (409). Data transaksi tidak pernah "hilang" diam-diam.
4. **Update transaksi** (`PUT /stock-movements/:id`) boleh mengganti seluruh detail barang bila `items` dikirim.
5. **Format response seragam** lewat interceptor (sukses) dan exception filter (error), sehingga mudah diuji dan didokumentasikan.
6. **Kode status**: 400 input tidak valid, 404 data tidak ditemukan, 409 konflik data/relasi, 422 aturan bisnis stok dilanggar.
