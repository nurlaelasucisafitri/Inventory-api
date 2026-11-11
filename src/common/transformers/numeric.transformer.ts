import type { ValueTransformer } from 'typeorm';

// PostgreSQL mengembalikan kolom decimal sebagai string ("75000.00").
// Transformer ini mengubahnya menjadi number agar JSON response rapi.
export const numericTransformer: ValueTransformer = {
    to: (value?: number | null) => value,
    from: (value?: string | null) => (value === null || value === undefined ? value : parseFloat(value)),
};