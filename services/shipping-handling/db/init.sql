-- ═══════════════════════════════════════════════
--  Shipping & Handling Database Schema
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS shipping_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    estimated_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    order_number VARCHAR(50),
    shipping_method_id INTEGER REFERENCES shipping_methods(id),
    status VARCHAR(30) DEFAULT 'pending',
    destination_address TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    weight_kg DECIMAL(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_order ON shipments(order_number);

-- ─── Seed Data ───

INSERT INTO shipping_methods (name, description, base_price, estimated_days) VALUES
('Standard Shipping',  'Delivery in 5-7 business days',  5.99,  7),
('Express Shipping',   'Delivery in 2-3 business days',  12.99, 3),
('Overnight Shipping', 'Next business day delivery',     24.99, 1),
('Free Shipping',      'Free delivery in 7-10 business days', 0.00, 10)
ON CONFLICT DO NOTHING;
