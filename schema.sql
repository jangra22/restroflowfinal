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
    image TEXT,
    ingredients JSONB NOT NULL, -- Format: {"ingredient_key": amount}
    customizations JSONB DEFAULT '[]'::jsonb -- Array of optional add-ons
);

-- Seed starting premium vegetarian menu items
INSERT INTO menu (id, name, category, price, description, image, ingredients, customizations) VALUES
('m1', 'Crispy Corn & Pepper Salt', 'Starters', 220.00, 'Sweet corn kernels fried crisp and tossed with red onions, spring greens, crushed black pepper, and sea salt.', 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80&w=600', '{"corn": 1, "spices": 1}', '[]'),
('m2', 'Artisanal Paneer Tikka Masala Combo', 'Mains', 320.00, 'Spiced chargrilled cottage cheese paneer cooked in a tomato-onion masala gravel served with two butter rotis.', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=600', '{"paneer": 1.5, "atta": 2, "butter": 1, "tomato": 1, "spices": 1}', '[{"name": "Extra Roti", "price": 30.00}, {"name": "Add Cheese Layer", "price": 40.00}]'),
('m3', 'Spicy Kadai Paneer Pizza', 'Fusion Pizzas', 290.00, 'Hand-stretched pizza topped with wok-tossed spicy paneer, bell peppers, onions, and local mozzarella.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600', '{"dough": 1, "cheese": 2, "paneer": 1, "tomato": 1}', '[{"name": "Cheese Burst Crust", "price": 60.00}, {"name": "Extra Paneer Cubes", "price": 50.00}]'),
('m4', 'Truffle Mushroom & Spinach Pizza', 'Fusion Pizzas', 350.00, 'Artisanal pizza loaded with sautéed wild button mushrooms, fresh baby spinach, white garlic cream, and truffle oil.', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&q=80&w=600', '{"dough": 1, "cheese": 2, "spices": 1}', '[{"name": "Double Cheese", "price": 50.00}]'),
('m5', 'Royal Mango Lassi', 'Beverages', 90.00, 'Creamy, thick yogurt sweet beverage churned with handpicked premium Alphonso mango pulp and saffron.', 'https://images.unsplash.com/photo-1571006682887-f13c63968600?auto=format&fit=crop&q=80&w=600', '{"yogurt": 1, "mango": 1, "sugar": 1}', '[{"name": "Add Pistachio Garnish", "price": 15.00}]'),
('m6', 'Authentic Masala Kulhad Chai', 'Beverages', 40.00, 'Slow-brewed strong CTC tea boiled with fresh buffalo milk, grated ginger, cardamoms, and lemongrass.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600', '{"tea": 1, "milk": 1, "ginger": 1, "sugar": 1}', '[{"name": "Sugar-Free", "price": 0.00}]'),
('m7', 'Hot Gulab Jamun (2 Pcs) with Rabdi', 'Desserts', 90.00, 'Golden milk-solid dumplings soaked in warm cardamom sugar syrup topped with chilled rabdi cream.', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600', '{"milk": 1.5, "sugar": 2, "cream": 1}', '[{"name": "Add Extra Rabdi", "price": 30.00}]'),
('m8', 'Paneer Kathi Roll', 'Starters', 180.00, 'Flaky paratha loaded with spice-marinated roasted paneer cubes, crunchy green bell peppers, tangy red onions, and fresh mint-yogurt chutney.', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600', '{"paneer": 1, "atta": 1, "butter": 1, "spices": 1}', '[]'),
('m9', 'Crispy Honey Chilli Potato', 'Chinese', 210.00, 'Crispy double-fried potato fingers tossed with capsicums and spring onions in a sweet-and-spicy honey sesame sauce.', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600', '{"tomato": 1, "sugar": 1, "spices": 1}', '[]'),
('m10', 'Vegetable Hakka Noodles', 'Chinese', 230.00, 'Stir-fried boiled wheat noodles tossed with colorful julienned cabbage, fresh carrots, crisp capsicum, and premium soy sauce.', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600', '{"atta": 1, "spices": 1}', '[{"name": "Schezwan Style", "price": 20.00}]'),
('m11', 'Choco Lava Cake', 'Desserts', 150.00, 'Decadent warm chocolate cake with a rich, molten cocoa lava core, served piping hot.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600', '{"sugar": 1.5, "butter": 1.0}', '[]'),
('m12', 'Classic Steamed Veg Momos', 'Chinese', 140.00, 'Thin wheat wrappers loaded with minced seasoned cabbage, carrots, onions, and spring garlic, steamed soft. Served with spicy tomato-chili dip.', 'https://images.unsplash.com/photo-1625220194771-7ebedd0b7a2a?auto=format&fit=crop&q=80&w=600', '{"atta": 1, "spices": 1}', '[]'),
('m13', 'Sizzling Veg Manchurian Gravy', 'Chinese', 240.00, 'Deep-fried vegetable globes cooked in a classic dark, thick soy-chili gravy with minced garlic and green onions.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600', '{"atta": 1, "spices": 1, "tomato": 1}', '[]'),
('m14', 'Dal Makhani with Laccha Paratha', 'Mains', 290.00, 'Slow-cooked premium black lentils simmered overnight on low charcoal fire with cream and churned table butter. Served with a crispy layered paratha.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600', '{"milk": 1, "butter": 1.5, "atta": 2, "spices": 1}', '[{"name": "Extra Butter Paratha", "price": 40.00}]'),
('m15', 'Dahi Ke Kebab', 'Starters', 240.00, 'Velvet-soft shallow-fried patties prepared with hung yogurt curd, fresh cottage cheese, crushed cardamoms, and green chilies.', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600', '{"yogurt": 2, "paneer": 1, "spices": 1}', '[]'),
('m16', 'Classic Kesar Pista Kulfi', 'Desserts', 110.00, 'Traditional Indian frozen dairy ice-cream flavored with premium saffron threads, ground pistachios, and rich cardamom milk.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600', '{"milk": 2, "sugar": 1, "cream": 1}', '[]'),
('m17', 'Virgin Mojito Mint Cooler', 'Beverages', 120.00, 'Sparkling summer cooler made with fresh muddled mint leaves, lime chunks, cane sugar, and chilled carbonated water.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', '{"sugar": 1}', '[]'),
('m18', 'Veg Biryani with Mix Raita', 'Mains', 270.00, 'Fragrant premium long-grain Basmati rice slow-cooked on dum with saffron, mint, garden peas, carrots, french beans, and fried cashews.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600', '{"yogurt": 1, "spices": 1}', '[]'),
('m19', 'Premium Veg Spring Rolls', 'Chinese', 180.00, 'Golden, paper-thin crispy wrappers filled with stir-fried glass noodles, mushrooms, shredded cabbage, carrots, and soy sauce.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600', '{"atta": 1, "spices": 1}', '[]'),
('m20', 'Samosa Chaat Platter', 'Starters', 130.00, 'Crispy spiced potato-loaded samosas crushed and smothered with thick sweet yogurt, tangy tamarind, spicy mint chutney, and sev.', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600', '{"atta": 1, "yogurt": 1, "spices": 1}', '[]'),
('m21', 'Banarasi Tamatar Chaat', 'Starters', 140.00, 'Iconic spicy Varanasi street food prepared with mashed tomatoes, potatoes, ginger-chili paste, ghee, and sweet cumin water.', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600', '{"tomato": 2, "butter": 1, "spices": 1}', '[]'),
('m22', 'Royal Rabdi Malpua', 'Desserts', 180.00, 'Shallow-fried sweet fennel-infused pancakes soaked in sugar syrup and topped with thick, chilled Rabdi cream.', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600', '{"milk": 2, "sugar": 2, "cream": 1, "atta": 1}', '[]');

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
('cream', 'Chilled Rabdi Cardamom Basundi', 12.0, 'litres', 3.0),
('corn', 'Crispy Golden Sweet Corn', 20.0, 'kg', 4.0),
('rice', 'Dehraduni Premium Basmati Rice', 50.0, 'kg', 10.0);

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
