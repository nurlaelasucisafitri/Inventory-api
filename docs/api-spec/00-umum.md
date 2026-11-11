# API Specification: Ketentuan Umum

Spesifikasi per modul ada di file lain di folder ini (`01-categories.md`, `02-...`, dst). Setiap anggota menulis spesifikasi modulnya sendiri.

Base URL: `http://localhost:3000` (sesuai `PORT` di `.env`). Semua request dan response berformat **JSON**.
Header untuk request ber-body: `Content-Type: application/json`.

## 1. Format response

**Sukses** (status 200 / 201):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Berhasil",
  "data": { },
  "timestamp": "2026-11-06T04:00:00.000Z"
}
```

**Error** (status 4xx / 5xx):
```json
{
  "success": false,
  "statusCode": 404,
  "error": "Not Found",
  "message": "Produk 00000000-... tidak ditemukan",
  "path": "/products/00000000-...",
  "timestamp": "2026-11-06T04:00:00.000Z"
}
```
`message` berupa **array string** bila ada beberapa error validasi (status 400).

## 2. Kode status

| Kode | Arti | Kapan terjadi |
|------|------|---------------|
| 200 OK | Berhasil | GET, PUT, DELETE sukses |
| 201 Created | Data dibuat | POST sukses |
| 400 Bad Request | Input tidak valid | Field wajib kosong, tipe salah, field tidak dikenal, id bukan UUID, produk dobel dalam satu transaksi |
| 404 Not Found | Data tidak ditemukan | Id tidak ada, atau id relasi (kategori/pemasok/gudang/produk) di body tidak ada |
| 409 Conflict | Konflik data/relasi | Nilai unik sudah dipakai (nama, email, SKU, nomor referensi); menghapus data yang masih dipakai |
| 422 Unprocessable Entity | Aturan bisnis dilanggar | Stok menjadi negatif (OUT melebihi stok, revisi atau hapus transaksi yang membuat stok minus) |
| 500 Internal Server Error | Kesalahan server | Error tak terduga |

Validasi global: field di luar yang didefinisikan **ditolak** (400, `property xxx should not exist`).
Parameter `:id` harus UUID, kalau tidak maka 400 `Validation failed (uuid is expected)`.

## 3. Ringkasan endpoint

| Resource | GET (list) | GET (detail) | POST | PUT | DELETE |
|----------|-----------|--------------|------|-----|--------|
| Categories | `/categories` | `/categories/:id` | `/categories` | `/categories/:id` | `/categories/:id` |
| Suppliers | `/suppliers` | `/suppliers/:id` | `/suppliers` | `/suppliers/:id` | `/suppliers/:id` |
| Warehouses | `/warehouses` | `/warehouses/:id` | `/warehouses` | `/warehouses/:id` | `/warehouses/:id` |
| Products | `/products` | `/products/:id` | `/products` | `/products/:id` | `/products/:id` |
| Stock Movements | `/stock-movements` | `/stock-movements/:id` | `/stock-movements` | `/stock-movements/:id` | `/stock-movements/:id` |
| Stocks (info stok) | `/stocks` | `/stocks/products/:productId` | - | - | - |

Total: **27 endpoint**.

---
