-- ═══════════════════════════════════════════════
--  Product Catalog Database Schema
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE,
    brand VARCHAR(100),
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);

-- ─── Seed Data ───

INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Latest gadgets and electronic devices', '/images/categories/electronics.jpg'),
('Clothing', 'Fashion and apparel for everyone', '/images/categories/clothing.jpg'),
('Books', 'Best sellers and educational books', '/images/categories/books.jpg'),
('Home & Garden', 'Furniture, decor, and garden supplies', '/images/categories/home.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, sku, brand, rating, review_count) VALUES
('Wireless Bluetooth Headphones', 'Premium noise-canceling wireless headphones with 30hr battery life', 79.99, '/images/products/headphones.jpg', 1, 'ELEC-001', 'SoundMax', 4.5, 234),
('Smart Watch Pro', 'Fitness tracking, heart rate monitor, GPS, waterproof', 199.99, '/images/products/smartwatch.jpg', 1, 'ELEC-002', 'TechFit', 4.7, 567),
('4K Ultra HD Monitor', '27-inch IPS panel, HDR10, 144Hz refresh rate', 349.99, '/images/products/monitor.jpg', 1, 'ELEC-003', 'ViewPro', 4.6, 189),
('USB-C Docking Station', '12-in-1 hub with dual HDMI, ethernet, and power delivery', 59.99, '/images/products/dock.jpg', 1, 'ELEC-004', 'ConnectAll', 4.3, 98),
('Classic Denim Jacket', 'Vintage-style denim jacket with modern fit', 69.99, '/images/products/denim.jpg', 2, 'CLTH-001', 'UrbanStyle', 4.4, 156),
('Premium Cotton T-Shirt', '100% organic cotton, available in 12 colors', 24.99, '/images/products/tshirt.jpg', 2, 'CLTH-002', 'ComfortWear', 4.2, 890),
('Running Shoes Ultra', 'Lightweight running shoes with responsive cushioning', 129.99, '/images/products/shoes.jpg', 2, 'CLTH-003', 'SpeedRun', 4.8, 432),
('Wool Winter Sweater', 'Merino wool blend, perfect for cold weather', 54.99, '/images/products/sweater.jpg', 2, 'CLTH-004', 'WarmKnit', 4.3, 201),
('The Art of Programming', 'Comprehensive guide to algorithms and data structures', 49.99, '/images/products/progbook.jpg', 3, 'BOOK-001', 'TechPress', 4.9, 1234),
('Modern Web Development', 'Full-stack JavaScript with React and Node.js', 39.99, '/images/products/webbook.jpg', 3, 'BOOK-002', 'CodeBooks', 4.6, 567),
('Docker & Kubernetes Guide', 'Container orchestration from beginner to expert', 44.99, '/images/products/dockerbook.jpg', 3, 'BOOK-003', 'DevOpsPress', 4.7, 345),
('Ergonomic Office Chair', 'Adjustable lumbar support, breathable mesh back', 299.99, '/images/products/chair.jpg', 4, 'HOME-001', 'ErgoMax', 4.5, 678),
('Smart LED Desk Lamp', 'Touch control, 5 color modes, USB charging port', 34.99, '/images/products/lamp.jpg', 4, 'HOME-002', 'BrightLight', 4.4, 234),
('Indoor Plant Set', 'Collection of 3 low-maintenance indoor plants', 42.99, '/images/products/plants.jpg', 4, 'HOME-003', 'GreenLife', 4.6, 456)
ON CONFLICT (sku) DO NOTHING;
