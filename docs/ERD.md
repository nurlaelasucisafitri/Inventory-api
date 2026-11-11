# ERD (Entity Relationship Diagram)

Gambar: [`erd.png`](./erd.png) &nbsp;|&nbsp; Sumber diagram: [`erd.mmd`](./erd.mmd)

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : "memiliki"
    SUPPLIERS ||--o{ PRODUCTS : "memasok"
    WAREHOUSES ||--o{ STOCK_MOVEMENTS : "memiliki"
    STOCK_MOVEMENTS ||--|{ STOCK_MOVEMENT_ITEMS : "terdiri dari"
    PRODUCTS ||--o{ STOCK_MOVEMENT_ITEMS : "muncul di"

    CATEGORIES {
        uuid id PK
        varchar name UK
        text description
        timestamp created_at
        timestamp updated_at
    }
    SUPPLIERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar phone
        text address
        timestamp created_at
        timestamp updated_at
    }
    WAREHOUSES {
        uuid id PK
        varchar name UK
        varchar location
        timestamp created_at
        timestamp updated_at
    }
    PRODUCTS {
        uuid id PK
        varchar sku UK
        varchar name
        text description
        varchar unit
        decimal price
        int min_stock
        uuid category_id FK
        uuid supplier_id FK
        timestamp created_at
        timestamp updated_at
    }
    STOCK_MOVEMENTS {
        uuid id PK
        varchar reference_number UK
        enum type "IN atau OUT"
        timestamp movement_date
        text notes
        uuid warehouse_id FK
        timestamp created_at
        timestamp updated_at
    }
    STOCK_MOVEMENT_ITEMS {
        uuid id PK
        uuid stock_movement_id FK
        uuid product_id FK
        int quantity
    }
```

## Daftar relasi

| # | Relasi | Jenis | Foreign key | Perilaku saat induk dihapus |
|---|--------|-------|-------------|-----------------------------|
| 1 | Category → Product | One-to-Many | `products.category_id` | Ditolak (409) bila masih punya produk |
| 2 | Supplier → Product | One-to-Many | `products.supplier_id` | Ditolak (409) bila masih memasok produk |
| 3 | Warehouse → StockMovement | One-to-Many | `stock_movements.warehouse_id` | Ditolak (409) bila sudah punya transaksi |
| 4 | StockMovement → StockMovementItem | One-to-Many | `stock_movement_items.stock_movement_id` | Detail ikut terhapus (`ON DELETE CASCADE`) |
| 5 | Product → StockMovementItem | One-to-Many | `stock_movement_items.product_id` | Ditolak (409) bila sudah dipakai di transaksi |

`stock_movement_items` adalah **tabel penghubung** antara `products` dan `stock_movements`.
Secara logis, hubungan Product dan StockMovement adalah **many-to-many** (satu produk ada di banyak transaksi,
satu transaksi berisi banyak produk) dan tabel penghubung ini membawa atribut tambahan: `quantity`.

Constraint tambahan:
- `UNIQUE (stock_movement_id, product_id)` pada `stock_movement_items`: satu produk hanya muncul sekali per transaksi.
- `UNIQUE` pada `categories.name`, `suppliers.email`, `warehouses.name`, `products.sku`, `stock_movements.reference_number`.
