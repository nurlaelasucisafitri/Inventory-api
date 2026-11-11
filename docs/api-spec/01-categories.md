# API Specification: Categories

> Catatan: respons `GET /categories/:id` memuat daftar `products` setelah modul Products terintegrasi.


## Skema Category
| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | dibuat otomatis |
| name | string (maks 100) | unik |
| description | string / null | |
| created_at, updated_at | datetime | otomatis |

### `GET /categories` → 200
Daftar kategori, urut nama A-Z. `data`: array Category.

### `GET /categories/:id` → 200
`data`: Category + `products` (array produk di kategori tersebut).
Error: 400 (id bukan UUID), 404.

### `POST /categories` → 201
| Field | Wajib | Aturan |
|-------|-------|--------|
| name | ya | string, tidak kosong, maks 100 |
| description | tidak | string |

```json
{ "name": "Elektronik", "description": "Perangkat elektronik" }
```
Error: 400 (validasi), 409 (nama sudah ada).

### `PUT /categories/:id` → 200
Body sama dengan POST, **semua field opsional** (hanya field yang dikirim yang berubah).
Error: 400, 404, 409 (nama sudah dipakai kategori lain).

### `DELETE /categories/:id` → 200
```json
{ "message": "Kategori <id> berhasil dihapus", "deletedId": "<id>" }
```
Error: 404, **409** bila masih dipakai produk.

---
