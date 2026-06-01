/**
 * RestoFlow Core State Model (Indian Edition)
 * Manages currency (₹), GST (5% comprising 2.5% CGST + 2.5% SGST),
 * Indian recipe items, loyalty points databases, coupons verification,
 * and live Zomato / Swiggy aggregator orders queues.
 * 
 * Extends EventTarget to act as an observable model in our MVC architecture.
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
        customizations: []
    },
    {
        id: "m8",
        name: "Chicken Biriyani",
        category: "Mains",
        price: 280.00,
        description: "Premium Basmati rice cooked with layered spiced chicken, saffron, cardamoms, and deep fried onions.",
        ingredients: { chicken: 1.5, rice: 2.0, spices: 1 },
        customizations: []
    },
    {
        id: "m9",
        name: "Choco Lava Cake",
        category: "Desserts",
        price: 350.00,
        description: "Decadent chocolate cake with a rich molten lava core served piping warm.",
        ingredients: { sugar: 1.5, butter: 1.0 },
        customizations: []
    },
    {
        id: "m10",
        name: "Pastry Small",
        category: "Desserts",
        price: 100.00,
        description: "Indulgent single slice vanilla frosted premium sponge pastry.",
        ingredients: { sugar: 1.0, cream: 1.0 },
        customizations: []
    },
    {
        id: "m11",
        name: "Banana Pastry",
        category: "Desserts",
        price: 200.00,
        description: "Decadent pastry loaded with caramelized local banana layers.",
        ingredients: { sugar: 1.0, cream: 1.0 },
        customizations: []
    }
];

const DEFAULT_INVENTORY = {
    chicken: { name: "Chicken", category: "Meat", qty: 25, max: 50, unit: "kg", min: 8, cost: 220, supplier: "Fresh Farms", lastUpdated: "2023-06-15" },
    rice: { name: "Rice", category: "Ingredients", qty: 45, max: 100, unit: "kg", min: 10, cost: 80, supplier: "Grain Suppliers", lastUpdated: "2023-06-14" },
    paneer: { name: "Paneer", category: "Dairy", qty: 8, max: 30, unit: "kg", min: 6, cost: 320, supplier: "Dairy Fresh", lastUpdated: "2023-06-15" },
    tomato: { name: "Tomatoes", category: "Produce", qty: 15, max: 40, unit: "kg", min: 5, cost: 60, supplier: "Fresh Farms", lastUpdated: "2023-06-15" },
    spices: { name: "Garam Masala", category: "Spices", qty: 2, max: 5, unit: "kg", min: 2, cost: 800, supplier: "Spice World", lastUpdated: "2023-06-10" },
    takeaway: { name: "Takeaway Boxes", category: "Packaging", qty: 0, max: 500, unit: "pcs", min: 50, cost: 12, supplier: "Package Solutions", lastUpdated: "2023-06-12" },
    atta: { name: "Atta Flour", category: "Ingredients", qty: 50, max: 100, unit: "kg", min: 10, cost: 45, supplier: "Grain Suppliers", lastUpdated: "2023-06-14" },
    butter: { name: "Butter", category: "Dairy", qty: 15, max: 30, unit: "kg", min: 3, cost: 250, supplier: "Dairy Fresh", lastUpdated: "2023-06-15" },
    dough: { name: "Pizza Dough", category: "Ingredients", qty: 40, max: 80, unit: "pcs", min: 10, cost: 15, supplier: "Fresh Farms", lastUpdated: "2023-06-15" },
    cheese: { name: "Mozzarella Cheese", category: "Dairy", qty: 20, max: 40, unit: "kg", min: 4, cost: 450, supplier: "Dairy Fresh", lastUpdated: "2023-06-15" },
    yogurt: { name: "Yogurt", category: "Dairy", qty: 24, max: 50, unit: "litres", min: 6, cost: 60, supplier: "Dairy Fresh", lastUpdated: "2023-06-15" },
    mango: { name: "Mango Pulp", category: "Produce", qty: 15, max: 30, unit: "litres", min: 3, cost: 180, supplier: "Fresh Farms", lastUpdated: "2023-06-15" },
    tea: { name: "Tea Leaves", category: "Ingredients", qty: 8, max: 20, unit: "kg", min: 2, cost: 140, supplier: "Spice World", lastUpdated: "2023-06-10" },
    milk: { name: "Buffalo Milk", category: "Dairy", qty: 45, max: 100, unit: "litres", min: 10, cost: 65, supplier: "Dairy Fresh", lastUpdated: "2023-06-15" },
    sugar: { name: "Sugar", category: "Ingredients", qty: 20, max: 50, unit: "kg", min: 5, cost: 40, supplier: "Grain Suppliers", lastUpdated: "2023-06-14" },
    cream: { name: "Rabdi Cream", category: "Dairy", qty: 12, max: 30, unit: "litres", min: 3, cost: 220, supplier: "Dairy Fresh", lastUpdated: "2023-06-15" }
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
    { username: "manager", pin: "2222", name: "Rajesh Kumar", role: "Restaurant Manager", branch: "Main Branch", contact: "rajesh.kumar@example.com / +91 98765 43210", joinDate: "2021-03-15", status: "Active" },
    { username: "billing", pin: "4444", name: "Priya Singh", role: "Cashier", branch: "Main Branch", contact: "priya.singh@example.com / +91 87654 32109", joinDate: "2021-05-20", status: "Active" },
    { username: "chef", pin: "5555", name: "Amit Patel", role: "Chef", branch: "Main Branch", contact: "amit.patel@example.com / +91 76543 21098", joinDate: "2021-04-10", status: "Active" },
    { username: "waiter1", pin: "6666", name: "Neha Sharma", role: "Waiter", branch: "Downtown Branch", contact: "neha.sharma@example.com / +91 65432 10987", joinDate: "2022-01-15", status: "Active" },
    { username: "waiter2", pin: "7777", name: "Vikram Reddy", role: "Waiter", branch: "Downtown Branch", contact: "vikram.reddy@example.com / +91 54321 09876", joinDate: "2022-02-20", status: "Inactive" },
    { username: "admin", pin: "1111", name: "Ananya Desai", role: "Admin", branch: "Main Branch", contact: "ananya.desai@example.com / +91 43210 98765", joinDate: "2020-11-10", status: "Active" },
    { username: "chef2", pin: "8888", name: "Rahul Gupta", role: "Chef", branch: "Uptown Branch", contact: "rahul.gupta@example.com / +91 32109 87654", joinDate: "2022-03-05", status: "Active" }
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

const DEFAULT_ORDERS = [
    {
        id: "RF-892341",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "UPI",
        items: [
            { id: "m1", name: "Butter Chicken & Garlic Naan Combo", qty: 2, price: 380.00 }
        ],
        subtotal: 760.00,
        tax: 38.00,
        total: 798.00,
        tableId: 3,
        orderType: "Dine-In",
        phone: "9876543210"
    },
    {
        id: "RF-104928",
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        status: "completed",
        paymentStatus: "paid",
        paymentMethod: "Cash",
        items: [
            { id: "m10", name: "Pastry Small", qty: 1, price: 100.00 },
            { id: "m11", name: "Banana Pastry", qty: 2, price: 200.00 },
            { id: "m9", name: "Choco Lava Cake", qty: 2, price: 350.00 }
        ],
        subtotal: 1200.00,
        tax: 60.00,
        total: 1260.00,
        tableId: 7,
        orderType: "Dine-In",
        phone: "9998887776"
    },
    {
        id: "RF-556432",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: "cooking",
        paymentStatus: "unpaid",
        items: [
            { id: "m3", name: "Spicy Kadai Paneer Pizza", qty: 1, price: 290.00 },
            { id: "m6", name: "Authentic Masala Kulhad Chai", qty: 2, price: 40.00 }
        ],
        subtotal: 370.00,
        tax: 18.50,
        total: 388.50,
        tableId: 1,
        orderType: "Dine-In"
    }
];

const DEFAULT_AGGREGATOR_ORDERS = [
    {
        id: "SWI-8831",
        aggregator: "Swiggy",
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
        customer: "Aarav Gupta (+91 98122 33445)",
        status: "incoming",
        items: [
            { id: "s1", name: "Fried Papad", qty: 1, price: 30.00 },
            { id: "s2", name: "Samosa", qty: 1, price: 20.00 }
        ],
        subtotal: 50.00,
        tax: 2.50,
        total: 52.50,
        orderType: "Delivery"
    },
    {
        id: "ZOM-7649",
        aggregator: "Zomato",
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
        customer: "Sneha Sen (+91 99110 55432)",
        status: "cooking", // Maps to Dispatched in KOT card views
        items: [
            { id: "z1", name: "Palak Paneer", qty: 1, price: 280.00 },
            { id: "z2", name: "Butter Naan", qty: 12, price: 40.00 }
        ],
        subtotal: 760.00,
        tax: 38.00,
        total: 798.00,
        orderType: "Delivery"
    },
    {
        id: "TAL-9912",
        aggregator: "Talabat",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        customer: "Fatima Khan (+971 50 123 4567)",
        status: "served", // Maps to Delivered in KOT cards
        items: [
            { id: "t1", name: "Masala Dosa", qty: 2, price: 120.00 },
            { id: "t2", name: "Idli-sambar", qty: 1, price: 80.00 }
        ],
        subtotal: 320.00,
        tax: 16.00,
        total: 336.00,
        orderType: "Delivery"
    }
];

export class AppModel extends EventTarget {
    constructor() {
        super();
        this.init();
    }

    safeGetItem(key, defaultVal = []) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return defaultVal;
            return JSON.parse(data);
        } catch (e) {
            console.error(`Error parsing localStorage key ${key}:`, e);
            return defaultVal;
        }
    }

    init() {
        // Dynamic self-healing schema re-seeder for menu
        try {
            const storedMenu = localStorage.getItem("restoflow_menu");
            if (!storedMenu || !storedMenu.includes("m8")) {
                localStorage.setItem("restoflow_menu", JSON.stringify(DEFAULT_MENU));
            }
        } catch (e) {
            localStorage.setItem("restoflow_menu", JSON.stringify(DEFAULT_MENU));
        }

        // Dynamic self-healing schema re-seeder for inventory
        try {
            const storedInventory = localStorage.getItem("restoflow_inventory");
            const hasCost = storedInventory && storedInventory.includes("cost");
            if (!storedInventory || !hasCost) {
                localStorage.setItem("restoflow_inventory", JSON.stringify(DEFAULT_INVENTORY));
            }
        } catch (e) {
            localStorage.setItem("restoflow_inventory", JSON.stringify(DEFAULT_INVENTORY));
        }

        try {
            if (!localStorage.getItem("restoflow_tables")) {
                localStorage.setItem("restoflow_tables", JSON.stringify(DEFAULT_TABLES));
            }
        } catch (e) {
            localStorage.setItem("restoflow_tables", JSON.stringify(DEFAULT_TABLES));
        }

        try {
            const storedStaff = localStorage.getItem("restoflow_staff");
            const hasContact = storedStaff && storedStaff.includes("contact");
            const hasAnanya = storedStaff && storedStaff.includes("Ananya Desai");
            if (!storedStaff || !hasContact || !hasAnanya) {
                localStorage.setItem("restoflow_staff", JSON.stringify(DEFAULT_STAFF));
            }
        } catch (e) {
            localStorage.setItem("restoflow_staff", JSON.stringify(DEFAULT_STAFF));
        }

        try {
            if (!localStorage.getItem("restoflow_coupons")) {
                localStorage.setItem("restoflow_coupons", JSON.stringify(DEFAULT_COUPONS));
            }
        } catch (e) {
            localStorage.setItem("restoflow_coupons", JSON.stringify(DEFAULT_COUPONS));
        }
        try {
            if (!localStorage.getItem("restoflow_loyalty")) {
                localStorage.setItem("restoflow_loyalty", JSON.stringify(DEFAULT_LOYALTY));
            }
        } catch (e) {
            localStorage.setItem("restoflow_loyalty", JSON.stringify(DEFAULT_LOYALTY));
        }
        try {
            if (!localStorage.getItem("restoflow_aggregator_orders")) {
                localStorage.setItem("restoflow_aggregator_orders", JSON.stringify(DEFAULT_AGGREGATOR_ORDERS));
            }
        } catch (e) {
            localStorage.setItem("restoflow_aggregator_orders", JSON.stringify(DEFAULT_AGGREGATOR_ORDERS));
        }

        try {
            const storedOrders = localStorage.getItem("restoflow_orders");
            let parseFailed = false;
            try {
                if (storedOrders) JSON.parse(storedOrders);
            } catch (err) {
                parseFailed = true;
            }
            if (!storedOrders || storedOrders === "[]" || parseFailed || JSON.parse(storedOrders).length < 2) {
                localStorage.setItem("restoflow_orders", JSON.stringify(DEFAULT_ORDERS));
            }
        } catch (e) {
            localStorage.setItem("restoflow_orders", JSON.stringify(DEFAULT_ORDERS));
        }
        try {
            if (!localStorage.getItem("restoflow_feedback")) {
                localStorage.setItem("restoflow_feedback", JSON.stringify([]));
            }
        } catch (e) {
            localStorage.setItem("restoflow_feedback", JSON.stringify([]));
        }

        // Cross-tab sync via localstorage event
        window.addEventListener("storage", (e) => {
            if (e.key && e.key.startsWith("restoflow_")) {
                this.notifyChange(e.key);
            }
        });
    }

    // Menu Methods

    getMenu() {
        return this.safeGetItem("restoflow_menu", DEFAULT_MENU);
    }
    saveMenu(menu) {
        localStorage.setItem("restoflow_menu", JSON.stringify(menu));
        this.notifyChange("restoflow_menu");
    }

    // Inventory Methods
    getInventory() {
        return this.safeGetItem("restoflow_inventory", DEFAULT_INVENTORY);
    }
    saveInventory(inv) {
        localStorage.setItem("restoflow_inventory", JSON.stringify(inv));
        this.notifyChange("restoflow_inventory");
    }
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
    }

    // Tables Methods
    getTables() {
        return this.safeGetItem("restoflow_tables", DEFAULT_TABLES);
    }
    saveTables(tables) {
        localStorage.setItem("restoflow_tables", JSON.stringify(tables));
        this.notifyChange("restoflow_tables");
    }
    updateTableStatus(tableId, status) {
        const tables = this.getTables();
        const table = tables.find(t => t.id === parseInt(tableId));
        if (table) {
            table.status = status;
            this.saveTables(tables);
        }
    }
    addTable(tableData) {
        const tables = this.getTables();
        const nextId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
        const newTable = {
            id: nextId,
            name: tableData.name || `Table ${nextId}`,
            seats: tableData.seats || 4,
            status: "Free"
        };
        tables.push(newTable);
        this.saveTables(tables);
        this.logSecurityEvent(`Added new floor layout seat: ${newTable.name} (${newTable.seats} Seats)`);
        return newTable;
    }

    // Coupons Methods
    getCoupons() {
        return this.safeGetItem("restoflow_coupons", DEFAULT_COUPONS);
    }
    verifyCoupon(code, billSubtotal) {
        const coupons = this.getCoupons();
        const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
        if (coupon && billSubtotal >= coupon.minBill) {
            return coupon;
        }
        return null;
    }

    // Loyalty CRM Database Methods
    getLoyaltyDatabase() {
        return this.safeGetItem("restoflow_loyalty", DEFAULT_LOYALTY);
    }
    saveLoyaltyDatabase(loyalty) {
        localStorage.setItem("restoflow_loyalty", JSON.stringify(loyalty));
        this.notifyChange("restoflow_loyalty");
    }
    getLoyaltyCustomer(phone) {
        const db = this.getLoyaltyDatabase();
        return db[phone] || null;
    }
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
    }
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
    }
    registerLoyaltyCustomer(phone, name) {
        const db = this.getLoyaltyDatabase();
        db[phone] = { name: name || "Guest Customer", points: 0 };
        this.saveLoyaltyDatabase(db);
        this.logSecurityEvent(`Registered new loyalty profile for ${name} (${phone}).`);
        return db[phone];
    }

    // Online Aggregator Orders (Zomato & Swiggy)
    getAggregatorOrders() {
        return this.safeGetItem("restoflow_aggregator_orders", DEFAULT_AGGREGATOR_ORDERS);
    }
    saveAggregatorOrders(orders) {
        localStorage.setItem("restoflow_aggregator_orders", JSON.stringify(orders));
        this.notifyChange("restoflow_aggregator_orders");
    }
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
    }
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
    }

    // Orders Methods
    getOrders() {
        return this.safeGetItem("restoflow_orders", DEFAULT_ORDERS);
    }
    saveOrders(orders) {
        localStorage.setItem("restoflow_orders", JSON.stringify(orders));
        this.notifyChange("restoflow_orders");
    }
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
    }
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
    }
    settlePayment(orderId, paymentMethod) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.paymentStatus = "paid";
            order.paymentMethod = paymentMethod;
            order.status = "pending"; // Push to KDS kitchen queue
            if (order.tableId) {
                this.updateTableStatus(order.tableId, "Dining");
            }
            this.saveOrders(orders);
        }
    }

    getStaffList() {
        return this.safeGetItem("restoflow_staff", DEFAULT_STAFF);
    }

    // Session / Auth simulation
    getCurrentUser() {
        try {
            return JSON.parse(sessionStorage.getItem("restoflow_user")) || null;
        } catch (e) {
            return null;
        }
    }
    login(username, pin) {
        const staff = this.getStaffList();
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
    }
    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.logSecurityEvent(`User ${user.name} logged out.`);
        }
        sessionStorage.removeItem("restoflow_user");
    }
    logSecurityEvent(message, level = "INFO") {
        const logs = this.safeGetItem("restoflow_security_logs", []);
        logs.push({
            timestamp: new Date().toISOString(),
            level,
            message
        });
        localStorage.setItem("restoflow_security_logs", JSON.stringify(logs.slice(-100))); // Keep last 100
        this.notifyChange("restoflow_security_logs");
    }
    getSecurityLogs() {
        return this.safeGetItem("restoflow_security_logs", []);
    }

    // Feedback Methods
    addFeedback(feedbackData) {
        const feedback = this.safeGetItem("restoflow_feedback", []);
        const item = {
            id: "FB-" + Math.floor(1000 + Math.random() * 9000),
            timestamp: new Date().toISOString(),
            ...feedbackData
        };
        feedback.push(item);
        localStorage.setItem("restoflow_feedback", JSON.stringify(feedback));
        this.notifyChange("restoflow_feedback");
    }
    getFeedback() {
        return this.safeGetItem("restoflow_feedback", []);
    }

    notifyChange(key) {
        // Dispatch internally
        this.dispatchEvent(new CustomEvent("stateChange", { detail: { key } }));
        // Dispatch globally for cross-tab listeners
        const event = new CustomEvent("restoflowStateChange", { detail: { key } });
        window.dispatchEvent(event);
    }
}

// Single instance to use throughout
export const appModel = new AppModel();
