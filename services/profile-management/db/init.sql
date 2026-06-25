-- ═══════════════════════════════════════════════
--  Profile Management Database Schema
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home',
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'US',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ─── Seed Data (passwords are bcrypt hash of 'password123') ───

INSERT INTO users (first_name, last_name, email, password_hash, phone, role) VALUES
('John', 'Doe', 'john@example.com', '$2a$10$XQJG0Z8DBKV4V6YRQJnKYOW.QkZB4Nf7YzKlR8xZ5mW2bC0mYs1a', '+1-555-0101', 'customer'),
('Jane', 'Smith', 'jane@example.com', '$2a$10$XQJG0Z8DBKV4V6YRQJnKYOW.QkZB4Nf7YzKlR8xZ5mW2bC0mYs1a', '+1-555-0102', 'customer'),
('Admin', 'User', 'admin@example.com', '$2a$10$XQJG0Z8DBKV4V6YRQJnKYOW.QkZB4Nf7YzKlR8xZ5mW2bC0mYs1a', '+1-555-0100', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO addresses (user_id, label, street, city, state, zip_code, country, is_default) VALUES
(1, 'Home',    '123 Main Street',    'New York',    'NY', '10001', 'US', TRUE),
(1, 'Work',    '456 Business Ave',   'New York',    'NY', '10002', 'US', FALSE),
(2, 'Home',    '789 Oak Boulevard',  'Los Angeles', 'CA', '90001', 'US', TRUE),
(2, 'Parents', '321 Family Road',    'Chicago',     'IL', '60601', 'US', FALSE)
ON CONFLICT DO NOTHING;
