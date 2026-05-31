/**
 * RestoFlow Core State Management Engine (Indian Edition)
 * Handles Indian Rupee currency (₹), GST (5% comprising 2.5% CGST + 2.5% SGST),
 * Indian recipe items, loyalty points databases, coupons verification,
 * and live Zomato / Swiggy aggregator orders queues.
 */

const DEFAULT_MENU = [
    {
        id: "m1",
        name: "Butter Chicken & Garlic Naan Combo",
        category: "Mains",
        price: 380.00,
        description: "Tender tandoori chicken cooked in a rich, buttery tomato sauce served with two garlic naans.",
        ingredients: { chicken: 1.5, atta: 2, butter: 1, tomato: 1, spices: 1 },
        customizations: [
            { name: "Double Butter", price: 40.00 },
            { name: "Extra Garlic Naan", price: 50.00 }
        ]
    },
    {
        id: "m2",
        name: "Artisanal Paneer Tikka Masala Combo",
        category: "Mains",
        price: 320.00,
        description: "Spiced chargrilled cottage cheese paneer cooked in a tomato-onion masala gravel served with two butter rotis.",
        ingredients: { paneer: 1.5, atta: 2, butter: 1, tomato: 1, spices: 1 },
        customizations: [
            { name: "Extra Roti", price: 30.00 },
            { name: "Add Cheese Layer", price: 40.00 }
        ]
    },
    {
        id: "m3",
        name: "Spicy Kadai Paneer Pizza",
        category: "Fusion Pizzas",
        price: 290.00,
        description: "Hand-stretched pizza topped with wok-tossed spicy paneer, bell peppers, onions, and local mozzarella.",
        ingredients: { dough: 1, cheese: 2, paneer: 1, tomato: 1 },
        customizations: [
            { name: "Cheese Burst Crust", price: 60.00 },
            { name: "Extra Paneer Cubes", price: 50.00 }
        ]
    },
    {
        id: "m4",
        name: "Tandoori Chicken Tikka Pizza",
        category: "Fusion Pizzas",
        price: 340.00,
        description: "Smoky tandoori chicken tikka, red onions, fresh green chillies, coriander, and mint chutney drizzles.",
        ingredients: { dough: 1, cheese: 2, chicken: 1, tomato: 1 },
        customizations: [
            { name: "Double Tandoori Tikka", price: 80.00 }
        ]
    },
    {
        id: "m5",
        name: "Royal Mango Lassi",
        category: "Beverages",
        price: 90.00,
        description: "Creamy, thick yogurt sweet beverage churned with handpicked premium Alphonso mango pulp and saffron.",
        ingredients: { yogurt: 1, mango: 1, sugar: 1 },
        customizations: [
            { name: "Add Pistachio Garnish", price: 15.00 }
        ]
    },
    {
        id: "m6",
        name: "Authentic Masala Kulhad Chai",
        category: "Beverages",
        price: 40.00,
        description: "Slow-brewed strong CTC tea boiled with fresh buffalo milk, grated ginger, cardamoms, and lemongrass.",
        ingredients: { tea: 1, milk: 1, ginger: 1, sugar: 1 },
        customizations: [
            { name: "Sugar-Free", price: 0.00 }
        ]
    },
    {
        id: "m7",
        name: "Hot Gulab Jamun (2 Pcs) with Rabdi",
        category: "Desserts",
        price: 90.00,
        description: "Golden milk-solid dumplings soaked in warm cardamom sugar syrup topped with chilled rabdi cream.",
        ingredients: { milk: 1.5, sugar: 2, cream: 1 },
        customizations: [
            { name: "Add Extra Rabdi", price: 30.00 }
        ]
    }
];

const DEFAULT_INVENTORY = {
    chicken: { name: "Tandoori Bone-Free Chicken Fillet", qty: 35, unit: "kg", min: 8 },
    paneer: { name: "Artisanal Malai Cottage Cheese", qty: 30, unit: "kg", min: 6 },
    atta: { name: "Premium Sharbati Atta / Flour", qty: 50, unit: "kg", min: 10 },
    butter: { name: "Amul Salted Table Butter", qty: 15, unit: "kg", min: 3 },
    tomato: { name: "Tomato Puree & Onion Masalas", qty: 25, unit: "litres", min: 5 },
    spices: { name: "Indian Garam Masala Blend", qty: 10, unit: "kg", min: 2 },
    dough: { name: "Fermented Pizza Bases", qty: 40, unit: "pcs", min: 10 },
    cheese: { name: "Grated Local Mozzarella Blends", qty: 20, unit: "kg", min: 4 },
    yogurt: { name: "Fresh Creamy Thick Curd", qty: 24, unit: "litres", min: 6 },
    mango: { name: "Alphonso Mango Saffron Syrup", qty: 15, unit: "litres", min: 3 },
    tea: { name: "Assam CTC Strong Tea Leaves", qty: 8, unit: "kg", min: 2 },
    milk: { name: "Buffalo Cream Dairy Milk", qty: 45, unit: "litres", min: 10 },
    sugar: { name: "Demerara Sugar Cardamoms", qty: 20, unit: "kg", min: 5 },
    cream: { name: "Chilled Rabdi Cardamom Basundi", qty: 12, unit: "litres", min: 3 }
};

const DEFAULT_TABLES = [
    { id: 1, name: "Table 1", seats: 2, status: "Free" },
    { id: 2, name: "Table 2", seats: 2, status: "Free" },
    { id: 3, name: "Table 3", seats: 4, status: "Free" },
    { id: 4, name: "Table 4", seats: 4, status: "Free" },
    { id: 5, name: "Table 5", seats: 6, status: "Free" },
    { id: 6, name: "Table 6", seats: 6, status: "Free" },
    { id: 7, name: "Table 7", seats: 8, status: "Free" },
    { id: 8, name: "Table 8", seats: 2, status: "Free" },
    { id: 9, name: "Table 9", seats: 4, status: "Free" },
    { id: 10, name: "Table 10", seats: 4, status: "Free" },
    { id: 11, name: "Bar 11", seats: 1, status: "Free" },
    { id: 12, name: "Bar 12", seats: 1, status: "Free" }
];

const DEFAULT_STAFF = [
    { username: "admin", pin: "1111", name: "Sarah Connor", role: "Admin" },
    { username: "manager", pin: "2222", name: "David Miller", role: "Manager" },
    { username: "captain", pin: "3333", name: "Alex Mercer", role: "Captain" },
    { username: "billing", pin: "4444", name: "Emma Watson", role: "Billing Staff" }
];

const DEFAULT_COUPONS = [
    { code: "WELCOME50", type: "flat", value: 50, minBill: 200, desc: "₹50 flat discount on orders above ₹200" },
    { code: "RESTO20", type: "percent", value: 20, minBill: 300, desc: "20% off flat on orders above ₹300" },
    { code: "GSTFREE", type: "gstfree", value: 0, minBill: 0, desc: "Waives off the 5% CGST + SGST tax!" }
];

const DEFAULT_LOYALTY = {
    "9876543210": { name: "Aarav Sharma", points: 250 },
    "9998887776": { name: "Rohan Patel", points: 120 },
    "9871234560": { name: "Priya Nair", points: 80 }
};

const DEFAULT_AGGREGATOR_ORDERS = [
    {
        id: "ZOM-7649",
        aggregator: "Zomato",
        timestamp: new Date().toISOString(),
        customer: "Vikram Malhotra (+91 98110 55432)",
        status: "incoming",
        items: [
            { id: "m1", name: "Butter Chicken & Garlic Naan Combo", qty: 1, price: 380.00, customizations: ["Double Butter"] }
        ],
        subtotal: 420.00,
        tax: 21.00,
        total: 441.00,
        orderType: "Delivery"
    },
    {
        id: "SWI-8831",
        aggregator: "Swiggy",
        timestamp: new Date().toISOString(),
        customer: "Aditi Sen (+91 99330 11223)",
        status: "incoming",
        items: [
            { id: "m2", name: "Artisanal Paneer Tikka Masala Combo", qty: 1, price: 320.00, customizations: [] },
            { id: "m6", name: "Authentic Masala Kulhad Chai", qty: 2, price: 40.00, customizations: [] }
        ],
        subtotal: 400.00,
        tax: 20.00,
        total: 420.00,
        orderType: "Delivery"
    }
];

function initDatabase() {
    if (!localStorage.getItem("restoflow_menu")) {
        localStorage.setItem("restoflow_menu", JSON.stringify(DEFAULT_MENU));
    }
    if (!localStorage.getItem("restoflow_inventory")) {
        localStorage.setItem("restoflow_inventory", JSON.stringify(DEFAULT_INVENTORY));
    }
    if (!localStorage.getItem("restoflow_tables")) {
        localStorage.setItem("restoflow_tables", JSON.stringify(DEFAULT_TABLES));
    }
    if (!localStorage.getItem("restoflow_staff")) {
        localStorage.setItem("restoflow_staff", JSON.stringify(DEFAULT_STAFF));
    }
    if (!localStorage.getItem("restoflow_coupons")) {
        localStorage.setItem("restoflow_coupons", JSON.stringify(DEFAULT_COUPONS));
    }
    if (!localStorage.getItem("restoflow_loyalty")) {
        localStorage.setItem("restoflow_loyalty", JSON.stringify(DEFAULT_LOYALTY));
    }
    if (!localStorage.getItem("restoflow_aggregator_orders")) {
        localStorage.setItem("restoflow_aggregator_orders", JSON.stringify(DEFAULT_AGGREGATOR_ORDERS));
    }
    if (!localStorage.getItem("restoflow_orders")) {
        localStorage.setItem("restoflow_orders", JSON.stringify([]));
    }
    if (!localStorage.getItem("restoflow_feedback")) {
        localStorage.setItem("restoflow_feedback", JSON.stringify([]));
    }
}

// Global Core State Manager
const CoreState = {
    init() {
        initDatabase();
        window.addEventListener("storage", (e) => {
            if (e.key && e.key.startsWith("restoflow_")) {
                const event = new CustomEvent("restoflowStateChange", { detail: { key: e.key } });
                window.dispatchEvent(event);
            }
        });
    },

    // Menu Methods
    getMenu() {
        return JSON.parse(localStorage.getItem("restoflow_menu")) || [];
    },
    saveMenu(menu) {
        localStorage.setItem("restoflow_menu", JSON.stringify(menu));
        this.notifyChange("restoflow_menu");
    },

    // Inventory Methods
    getInventory() {
        return JSON.parse(localStorage.getItem("restoflow_inventory")) || {};
    },
    saveInventory(inv) {
        localStorage.setItem("restoflow_inventory", JSON.stringify(inv));
        this.notifyChange("restoflow_inventory");
    },
    deductStock(menuItemId, quantity = 1, itemCustomizations = []) {
        const menu = this.getMenu();
        const item = menu.find(m => m.id === menuItemId);
        if (!item) return;

        const inv = this.getInventory();
        let success = true;

        if (item.ingredients) {
            for (const [ingredient, amount] of Object.entries(item.ingredients)) {
                if (inv[ingredient]) {
                    inv[ingredient].qty = Math.max(0, inv[ingredient].qty - (amount * quantity));
                }
            }
        }

        itemCustomizations.forEach(cust => {
            if (cust && typeof cust === 'string') {
                if (cust.toLowerCase().includes("butter") && inv["butter"]) {
                    inv["butter"].qty = Math.max(0, inv["butter"].qty - (0.1 * quantity));
                }
                if (cust.toLowerCase().includes("garlic") && inv["atta"]) {
                    inv["atta"].qty = Math.max(0, inv["atta"].qty - (0.5 * quantity));
                }
                if (cust.toLowerCase().includes("cheese") && inv["cheese"]) {
                    inv["cheese"].qty = Math.max(0, inv["cheese"].qty - (0.1 * quantity));
                }
            }
        });

        this.saveInventory(inv);
        return success;
    },

    // Tables Methods
    getTables() {
        return JSON.parse(localStorage.getItem("restoflow_tables")) || [];
    },
    saveTables(tables) {
        localStorage.setItem("restoflow_tables", JSON.stringify(tables));
        this.notifyChange("restoflow_tables");
    },
    updateTableStatus(tableId, status) {
        const tables = this.getTables();
        const table = tables.find(t => t.id === parseInt(tableId));
        if (table) {
            table.status = status;
            this.saveTables(tables);
        }
    },

    // Coupons Methods
    getCoupons() {
        return JSON.parse(localStorage.getItem("restoflow_coupons")) || [];
    },
    verifyCoupon(code, billSubtotal) {
        const coupons = this.getCoupons();
        const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
        if (coupon && billSubtotal >= coupon.minBill) {
            return coupon;
        }
        return null;
    },

    // Loyalty CRM Database Methods
    getLoyaltyDatabase() {
        return JSON.parse(localStorage.getItem("restoflow_loyalty")) || {};
    },
    saveLoyaltyDatabase(loyalty) {
        localStorage.setItem("restoflow_loyalty", JSON.stringify(loyalty));
        this.notifyChange("restoflow_loyalty");
    },
    getLoyaltyCustomer(phone) {
        const db = this.getLoyaltyDatabase();
        return db[phone] || null;
    },
    earnLoyaltyPoints(phone, billTotal) {
        if (!phone) return;
        const db = this.getLoyaltyDatabase();
        const pointsEarned = Math.floor(billTotal / 100); // 1 Point per ₹100 spent
        
        if (db[phone]) {
            db[phone].points += pointsEarned;
        } else {
            // Auto register unnamed numbers
            db[phone] = { name: "Guest Customer", points: pointsEarned };
        }
        
        this.saveLoyaltyDatabase(db);
        this.logSecurityEvent(`Customer ${phone} earned ${pointsEarned} loyalty points.`);
        return pointsEarned;
    },
    redeemLoyaltyPoints(phone, pointsToRedeem) {
        if (!phone) return false;
        const db = this.getLoyaltyDatabase();
        
        if (db[phone] && db[phone].points >= pointsToRedeem) {
            db[phone].points -= pointsToRedeem;
            this.saveLoyaltyDatabase(db);
            this.logSecurityEvent(`Redeemed ${pointsToRedeem} points for Customer ${phone} (Value: ₹${pointsToRedeem}).`);
            return true;
        }
        return false;
    },
    registerLoyaltyCustomer(phone, name) {
        const db = this.getLoyaltyDatabase();
        db[phone] = { name: name || "Guest Customer", points: 0 };
        this.saveLoyaltyDatabase(db);
        this.logSecurityEvent(`Registered new loyalty profile for ${name} (${phone}).`);
        return db[phone];
    },

    // Online Aggregator Orders (Zomato & Swiggy)
    getAggregatorOrders() {
        return JSON.parse(localStorage.getItem("restoflow_aggregator_orders")) || [];
    },
    saveAggregatorOrders(orders) {
        localStorage.setItem("restoflow_aggregator_orders", JSON.stringify(orders));
        this.notifyChange("restoflow_aggregator_orders");
    },
    acceptAggregatorOrder(orderId) {
        const aggOrders = this.getAggregatorOrders();
        const orderIdx = aggOrders.findIndex(o => o.id === orderId);
        
        if (orderIdx !== -1) {
            const order = aggOrders[orderIdx];
            
            // Move into central orders queue as a standard KOT pending delivery order
            const mainOrders = this.getOrders();
            const newOrder = {
                ...order,
                status: "pending",
                paymentStatus: "paid", // Delivery orders are pre-paid
                paymentMethod: `${order.aggregator} API`,
                timestamp: new Date().toISOString()
            };

            // Deduct ingredients immediately
            newOrder.items.forEach(orderItem => {
                const customizationsList = orderItem.customizations 
                    ? orderItem.customizations.map(c => typeof c === 'object' ? c.name : c).filter(Boolean)
                    : [];
                this.deductStock(orderItem.id, orderItem.qty, customizationsList);
            });

            mainOrders.push(newOrder);
            this.saveOrders(mainOrders);

            // Remove from incoming queue
            aggOrders.splice(orderIdx, 1);
            this.saveAggregatorOrders(aggOrders);

            this.logSecurityEvent(`Accepted ${order.aggregator} Order Docket ${orderId} into billing terminal.`);
            return newOrder;
        }
        return null;
    },
    rejectAggregatorOrder(orderId) {
        const aggOrders = this.getAggregatorOrders();
        const orderIdx = aggOrders.findIndex(o => o.id === orderId);
        
        if (orderIdx !== -1) {
            const order = aggOrders[orderIdx];
            aggOrders.splice(orderIdx, 1);
            this.saveAggregatorOrders(aggOrders);
            this.logSecurityEvent(`Rejected ${order.aggregator} Order Docket ${orderId}.`, "WARNING");
            return true;
        }
        return false;
    },

    // Orders Methods
    getOrders() {
        return JSON.parse(localStorage.getItem("restoflow_orders")) || [];
    },
    saveOrders(orders) {
        localStorage.setItem("restoflow_orders", JSON.stringify(orders));
        this.notifyChange("restoflow_orders");
    },
    createOrder(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            id: "RF-" + Math.floor(100000 + Math.random() * 900000),
            timestamp: new Date().toISOString(),
            status: "pending", // pending, cooking, ready, served, completed
            paymentStatus: "unpaid", // unpaid, paid
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            tableId: null,
            orderType: "Dine-In", // Dine-In, Takeaway, Delivery
            ...orderData
        };

        // Deduct inventory items immediately upon placing order
        newOrder.items.forEach(orderItem => {
            const customizationsList = orderItem.customizations 
                ? orderItem.customizations.map(c => {
                    if (c && typeof c === 'object') return c.name;
                    return c; // string fallback
                }).filter(Boolean)
                : [];
            this.deductStock(orderItem.id, orderItem.qty, customizationsList);
        });

        // Earn loyalty points if phone is provided
        if (newOrder.phone) {
            this.earnLoyaltyPoints(newOrder.phone, newOrder.total);
        }

        orders.push(newOrder);
        this.saveOrders(orders);

        if (newOrder.tableId) {
            this.updateTableStatus(newOrder.tableId, "Dining");
        }

        return newOrder;
    },
    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            if (status === "served" && order.tableId) {
                this.updateTableStatus(order.tableId, "Billing");
            }
            if (status === "completed" && order.tableId) {
                this.updateTableStatus(order.tableId, "Free");
            }
            this.saveOrders(orders);
        }
    },
    settlePayment(orderId, paymentMethod) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.paymentStatus = "paid";
            order.paymentMethod = paymentMethod;
            order.status = "completed";
            if (order.tableId) {
                this.updateTableStatus(order.tableId, "Free");
            }
            this.saveOrders(orders);
        }
    },

    // Session / Auth simulation
    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem("restoflow_user")) || null;
    },
    login(username, pin) {
        const staff = JSON.parse(localStorage.getItem("restoflow_staff")) || [];
        const user = staff.find(s => s.username === username.toLowerCase() && s.pin === pin);
        if (user) {
            sessionStorage.setItem("restoflow_user", JSON.stringify({
                name: user.name,
                username: user.username,
                role: user.role,
                loginTime: new Date().toISOString()
            }));
            this.logSecurityEvent(`User ${user.name} (${user.role}) logged in successfully.`);
            return user;
        }
        this.logSecurityEvent(`Failed login attempt for username: ${username}.`, "WARNING");
        return null;
    },
    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.logSecurityEvent(`User ${user.name} logged out.`);
        }
        sessionStorage.removeItem("restoflow_user");
    },
    logSecurityEvent(message, level = "INFO") {
        const logs = JSON.parse(localStorage.getItem("restoflow_security_logs")) || [];
        logs.push({
            timestamp: new Date().toISOString(),
            level,
            message
        });
        localStorage.setItem("restoflow_security_logs", JSON.stringify(logs.slice(-100))); // Keep last 100
        this.notifyChange("restoflow_security_logs");
    },
    getSecurityLogs() {
        return JSON.parse(localStorage.getItem("restoflow_security_logs")) || [];
    },

    // Feedback Methods
    addFeedback(feedbackData) {
        const feedback = JSON.parse(localStorage.getItem("restoflow_feedback")) || [];
        const item = {
            id: "FB-" + Math.floor(1000 + Math.random() * 9000),
            timestamp: new Date().toISOString(),
            ...feedbackData
        };
        feedback.push(item);
        localStorage.setItem("restoflow_feedback", JSON.stringify(feedback));
        this.notifyChange("restoflow_feedback");
    },
    getFeedback() {
        return JSON.parse(localStorage.getItem("restoflow_feedback")) || [];
    },

    // Cross tab sync notification dispatcher
    notifyChange(key) {
        const event = new CustomEvent("restoflowStateChange", { detail: { key } });
        window.dispatchEvent(event);
    }
};

// Auto initialize on script include
CoreState.init();
window.CoreState = CoreState;
