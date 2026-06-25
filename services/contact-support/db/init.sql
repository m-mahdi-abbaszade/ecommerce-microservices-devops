-- ═══════════════════════════════════════════════
--  Contact Support Database Schema
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(30) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL DEFAULT 'customer',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_messages_ticket ON ticket_messages(ticket_id);

-- ─── Seed Data ───

INSERT INTO tickets (user_id, subject, category, status, priority) VALUES
(1, 'Order not received',      'order',    'open',      'high'),
(1, 'Product quality issue',   'product',  'in_progress','medium'),
(2, 'Refund request',          'billing',  'resolved',  'medium'),
(2, 'Shipping delay inquiry',  'shipping', 'open',      'low')
ON CONFLICT DO NOTHING;

INSERT INTO ticket_messages (ticket_id, sender, message) VALUES
(1, 'customer', 'I placed an order 2 weeks ago and still have not received it. Order #ORD-12345.'),
(1, 'agent',    'We apologize for the delay. Let me check the shipping status for you.'),
(2, 'customer', 'The headphones I received have a broken left earpiece. Would like a replacement.'),
(3, 'customer', 'I was charged twice for my last order. Please process a refund.'),
(3, 'agent',    'I can see the duplicate charge. A refund has been initiated and will reflect in 3-5 business days.'),
(4, 'customer', 'When will my express shipping order arrive?')
ON CONFLICT DO NOTHING;
