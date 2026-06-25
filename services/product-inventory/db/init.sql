-- ═══════════════════════════════════════════════
--  Product Inventory Database Schema
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    warehouse_location VARCHAR(100),
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_product ON inventory(product_id);

-- ─── Seed Data (matching product catalog IDs) ───

INSERT INTO inventory (product_id, quantity_in_stock, quantity_reserved, reorder_level, warehouse_location) VALUES
(1,  150, 5,  20, 'Warehouse-A, Shelf-1'),
(2,  75,  2,  15, 'Warehouse-A, Shelf-2'),
(3,  45,  0,  10, 'Warehouse-B, Shelf-1'),
(4,  200, 8,  25, 'Warehouse-A, Shelf-3'),
(5,  120, 3,  20, 'Warehouse-C, Shelf-1'),
(6,  300, 10, 30, 'Warehouse-C, Shelf-2'),
(7,  60,  1,  10, 'Warehouse-B, Shelf-2'),
(8,  90,  4,  15, 'Warehouse-C, Shelf-3'),
(9,  50,  0,  10, 'Warehouse-D, Shelf-1'),
(10, 80,  2,  15, 'Warehouse-D, Shelf-2'),
(11, 65,  1,  10, 'Warehouse-D, Shelf-3'),
(12, 35,  0,  10, 'Warehouse-E, Shelf-1'),
(13, 110, 3,  20, 'Warehouse-E, Shelf-2'),
(14, 85,  2,  15, 'Warehouse-E, Shelf-3')
ON CONFLICT (product_id) DO NOTHING;
