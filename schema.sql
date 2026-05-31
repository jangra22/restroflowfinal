-- ====================================================================
-- GANESHWARAM SIGNATURE - PRODUCTION DATABASE INITIALIZATION SCHEMA
-- ====================================================================
-- Target Database: PostgreSQL / Supabase
-- Description: Creates the five core schemas and seeds them with starting 
--              Ganeshwaram menu recipes, tables layout, raw stocks, 
--              coupons, and CRM loyalty accounts.
-- ====================================================================

-- Clean up existing tables (Optional/Safe execution)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS loyalty CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS menu CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS security_logs CASCADE;

-- --------------------------------------------------------------------
-- 1. FLOOR TABLES STRUCTURE
-- --------------------------------------------------------------------
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    seats INTEGER NOT NULL DEFAULT 4,
    status VARCHAR(30) NOT NULL DEFAULT 'Free' CHECK (status IN ('Free', 'Dining', 'Billing'))
);

-- Seed Standard Tables layout
INSERT INTO tables (id, name, seats, status) VALUES
(1, 'Table 1', 2, 'Free'),
(2, 'Table 2', 2, 'Free'),
(3, 'Table 3', 4, 'Free'),
(4, 'Table 4', 4, 'Free'),
(5, 'Table 5', 6, 'Free'),
(6, 'Table 6', 6, 'Free'),
(7, 'Table 7', 8, 'Free'),
(8, 'Table 8', 2, 'Free'),
(9, 'Table 9', 4, 'Free'),
(10, 'Table 10', 4, 'Free'),
(11, 'Bar 11', 1, 'Free'),
(12, 'Bar 12', 1, 'Free');

-- --------------------------------------------------------------------
-- 2. DISHES MENU REGISTRY
-- --------------------------------------------------------------------
CREATE TABLE menu (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL, -- Format: {"ingredient_key": amount}
    customizations JSONB DEFAULT '[]'::jsonb -- Array of optional add-ons
);

-- Seed starting premium menu items
INSERT INTO menu (id, name, category, price, description, ingredients, customizations) VALUES
('m1', 'Butter Chicken & Garlic Naan Combo', 'Mains', 380.00, 'Tender tandoori chicken cooked in a rich, buttery tomato sauce served with two garlic naans.', '{"chicken": 1.5, "atta": 2, "butter": 1, "tomato": 1, "spices": 1}', '[{"name": "Double Butter", "price": 40.00}, {"name": "Extra Garlic Naan", "price": 50.00}]'),
('m2', 'Artisanal Paneer Tikka Masala Combo', 'Mains', 320.00, 'Spiced chargrilled cottage cheese paneer cooked in a tomato-onion masala gravel served with two butter rotis.', '{"paneer": 1.5, "atta": 2, "butter": 1, "tomato": 1, "spices": 1}', '[{"name": "Extra Roti", "price": 30.00}, {"name": "Add Cheese Layer", "price": 40.00}]'),
('m3', 'Spicy Kadai Paneer Pizza', 'Fusion Pizzas', 290.00, 'Hand-stretched pizza topped with wok-tossed spicy paneer, bell peppers, onions, and local mozzarella.', '{"dough": 1, "cheese": 2, "paneer": 1, "tomato": 1}', '[{"name": "Cheese Burst Crust", "price": 60.00}, {"name": "Extra Paneer Cubes", "price": 50.00}]'),
('m4', 'Tandoori Chicken Tikka Pizza', 'Fusion Pizzas', 340.00, 'Smoky tandoori chicken tikka, red onions, fresh green chillies, coriander, and mint chutney drizzles.', '{"dough": 1, "cheese": 2, "chicken": 1, "tomato": 1}', '[{"name": "Double Tandoori Tikka", "price": 80.00}]'),
('m5', 'Royal Mango Lassi', 'Beverages', 90.00, 'Creamy, thick yogurt sweet beverage churned with handpicked premium Alphonso mango pulp and saffron.', '{"yogurt": 1, "mango": 1, "sugar": 1}', '[{"name": "Add Pistachio Garnish", "price": 15.00}]'),
('m6', 'Authentic Masala Kulhad Chai', 'Beverages', 40.00, 'Slow-brewed strong CTC tea boiled with fresh buffalo milk, grated ginger, cardamoms, and lemongrass.', '{"tea": 1, "milk": 1, "ginger": 1, "sugar": 1}', '[{"name": "Sugar-Free", "price": 0.00}]'),
('m7', 'Hot Gulab Jamun (2 Pcs) with Rabdi', 'Desserts', 90.00, 'Golden milk-solid dumplings soaked in warm cardamom sugar syrup topped with chilled rabdi cream.', '{"milk": 1.5, "sugar": 2, "cream": 1}', '[{"name": "Add Extra Rabdi", "price": 30.00}]');

-- --------------------------------------------------------------------
-- 3. RAW STOCK INVENTORY STORAGE
-- --------------------------------------------------------------------
CREATE TABLE inventory (
    key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    qty NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    min_threshold NUMERIC(10, 2) NOT NULL
);

-- Seed raw warehouse stock
INSERT INTO inventory (key, name, qty, unit, min_threshold) VALUES
('chicken', 'Tandoori Bone-Free Chicken Fillet', 35.0, 'kg', 8.0),
('paneer', 'Artisanal Malai Cottage Cheese', 30.0, 'kg', 6.0),
('atta', 'Premium Sharbati Atta / Flour', 50.0, 'kg', 10.0),
('butter', 'Amul Salted Table Butter', 15.0, 'kg', 3.0),
('tomato', 'Tomato Puree & Onion Masalas', 25.0, 'litres', 5.0),
('spices', 'Indian Garam Masala Blend', 10.0, 'kg', 2.0),
('dough', 'Fermented Pizza Bases', 40.0, 'pcs', 10.0),
('cheese', 'Grated Local Mozzarella Blends', 20.0, 'kg', 4.0),
('yogurt', 'Fresh Creamy Thick Curd', 24.0, 'litres', 6.0),
('mango', 'Alphonso Mango Saffron Syrup', 15.0, 'litres', 3.0),
('tea', 'Assam CTC Strong Tea Leaves', 8.0, 'kg', 2.0),
('milk', 'Buffalo Cream Dairy Milk', 45.0, 'litres', 10.0),
('sugar', 'Demerara Sugar Cardamoms', 20.0, 'kg', 5.0),
('cream', 'Chilled Rabdi Cardamom Basundi', 12.0, 'litres', 3.0);

-- --------------------------------------------------------------------
-- 4. ACTIVE PROMOTION COUPONS
-- --------------------------------------------------------------------
CREATE TABLE coupons (
    code VARCHAR(50) PRIMARY KEY,
    type VARCHAR(30) NOT NULL CHECK (type IN ('flat', 'percent', 'gstfree')),
    value NUMERIC(10, 2) NOT NULL,
    min_bill NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL
);

-- Seed starting active discount codes
INSERT INTO coupons (code, type, value, min_bill, description) VALUES
('WELCOME50', 'flat', 50.00, 200.00, '₹50 flat discount on orders above ₹200'),
('RESTO20', 'percent', 20.00, 300.00, '20% off flat on orders above ₹300'),
('GSTFREE', 'gstfree', 0.00, 0.00, 'Waives off the 5% CGST + SGST tax!');

-- --------------------------------------------------------------------
-- 5. CENTRAL LOYALTY CRM DATABASE
-- --------------------------------------------------------------------
CREATE TABLE loyalty (
    phone VARCHAR(15) PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Guest Customer',
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0)
);

-- Seed VIP customer CRM accounts
INSERT INTO loyalty (phone, name, points) VALUES
('9876543210', 'Aarav Sharma', 250),
('9998887776', 'Rohan Patel', 120),
('9871234560', 'Priya Nair', 80);

-- --------------------------------------------------------------------
-- 6. UNIFIED CENTRAL ORDERS LEDGER
-- --------------------------------------------------------------------
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cooking', 'ready', 'served', 'completed')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    payment_method VARCHAR(50) DEFAULT 'unsettled',
    items JSONB NOT NULL, -- Array structure containing order item objects
    subtotal NUMERIC(10, 2) NOT NULL,
    coupon_discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    loyalty_discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    coupon_code VARCHAR(50) REFERENCES coupons(code),
    phone VARCHAR(15) REFERENCES loyalty(phone),
    tax NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    order_type VARCHAR(30) NOT NULL DEFAULT 'Dine-In' CHECK (order_type IN ('Dine-In', 'Takeaway', 'Delivery')),
    table_id INTEGER REFERENCES tables(id)
);

-- --------------------------------------------------------------------
-- 7. PLATFORM SECURITY ACCESS AUDIT LOGS
-- --------------------------------------------------------------------
CREATE TABLE security_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL
);

-- Seed starting system log
INSERT INTO security_logs (level, message) VALUES
('INFO', 'Ganeshwaram production database schemas initialized securely.');
