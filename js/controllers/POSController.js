/**
 * RestoFlow Merchant Admin POS Controller
 * Bridges the AppModel and POSView. Coordinates actions and dashboard states.
 */

export class POSController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Controller Local State (UI Session Parameters)
        this.enteredPin = "";
        this.posSelectedTableId = null;
        this.appliedDiscountPercent = 0;
        this.currentDashboardTab = "pos";
        this.posDraftBasket = [];
        this.posOrderModalCategory = "All";

        // Listen for database changes to keep UI synchronized
        this.model.addEventListener("stateChange", (e) => {
            this.refreshActiveDashboardView();
        });
    }

    init() {
        // Bind real-time cross-tab updates from system
        window.addEventListener("restoflowStateChange", (e) => {
            this.refreshActiveDashboardView();
        });

        // Skip login gate if session already exists
        const session = this.model.getCurrentUser();
        if (session) {
            this.view.showLoginGate(false);
            this.view.setStaffIndicator(session.name, session.role);
            this.initDashboardEngine();
        } else {
            this.view.showLoginGate(true);
        }
    }

    // 1. PIN Access Gate Controls
    pressPin(num) {
        if (this.enteredPin.length < 4) {
            this.enteredPin += num;
            this.view.updatePinDisplay(this.enteredPin);
        }
    }

    clearPin() {
        this.enteredPin = "";
        this.view.updatePinDisplay(this.enteredPin);
    }

    submitPin() {
        const select = document.getElementById("login-username-select");
        const username = select ? select.value : "admin";

        if (this.enteredPin.length < 4) {
            this.view.showLoginError("Access PIN must be 4 digits.");
            return;
        }

        const sessionUser = this.model.login(username, this.enteredPin);

        if (sessionUser) {
            this.view.showLoginGate(false);
            this.view.setStaffIndicator(sessionUser.name, sessionUser.role);
            this.clearPin();
            this.initDashboardEngine();
        } else {
            this.clearPin();
            this.view.showLoginError("Incorrect Secure PIN code. Access denied.");
        }
    }

    logoutMerchant() {
        this.model.logout();
        this.posSelectedTableId = null;
        this.appliedDiscountPercent = 0;
        this.view.showLoginGate(true);
    }

    // 2. Dashboard Lifecycle Initialization
    initDashboardEngine() {
        const activeSession = this.model.getCurrentUser();
        if (!activeSession) {
            this.logoutMerchant();
            return;
        }
        this.refreshActiveDashboardView();
    }

    refreshActiveDashboardView() {
        try {
            if (this.currentDashboardTab === "pos") {
                this.view.renderPOSFloorLayout(this.posSelectedTableId);
                this.view.renderActiveCheckoutTicket(this.posSelectedTableId, this.appliedDiscountPercent);
            } else if (this.currentDashboardTab === "online") {
                this.view.renderOnlineOrdersDesk();
            } else if (this.currentDashboardTab === "kds") {
                this.view.renderKDSKitchenMonitor();
            } else if (this.currentDashboardTab === "inventory") {
                this.view.renderInventoryManager();
            } else if (this.currentDashboardTab === "reports") {
                this.view.renderAnalyticsReports();
            } else if (this.currentDashboardTab === "security") {
                this.view.renderSecurityAccessConsole();
            }
        } catch (e) {
            console.error("Fatal error in dashboard view manager:", e);
        }
    }

    switchDashboardTab(tabId) {
        this.currentDashboardTab = tabId;
        this.view.switchTab(tabId);
        this.refreshActiveDashboardView();
    }

    // 3. Table / Seat Management Controls
    selectPOSTable(tableId) {
        this.posSelectedTableId = tableId;
        this.appliedDiscountPercent = 0; // Reset cashier discount
        this.view.hidePOSLoyaltyDetails();
        
        this.view.renderPOSFloorLayout(this.posSelectedTableId);
        this.view.renderActiveCheckoutTicket(this.posSelectedTableId, this.appliedDiscountPercent);
    }

    createWalkInOrder() {
        const sampleDishes = [
            { id: "m2", name: "Artisanal Paneer Tikka Masala Combo", qty: 1, price: 320.00, customizations: ["Extra Roti"] },
            { id: "m6", name: "Authentic Masala Kulhad Chai", qty: 2, price: 40.00, customizations: [] }
        ];

        this.model.createOrder({
            tableId: this.posSelectedTableId,
            items: sampleDishes,
            subtotal: 400.00,
            tax: 20.00, // 5% GST
            total: 420.00,
            paymentStatus: "unpaid",
            status: "pending",
            orderType: "Dine-In"
        });

        this.model.logSecurityEvent(`Walk-in customer seated and order created for Table ${this.posSelectedTableId}`);
        this.refreshActiveDashboardView();
    }

    applyDiscount(percent) {
        this.appliedDiscountPercent = percent;
        this.model.logSecurityEvent(`Applied ${percent}% discount to receipt for Table ${this.posSelectedTableId}`, "WARNING");
        this.view.renderActiveCheckoutTicket(this.posSelectedTableId, this.appliedDiscountPercent);
    }

    processTerminalCheckout() {
        const activeOrder = this.model.getOrders().find(o => o.tableId === this.posSelectedTableId && o.status !== "completed");
        if (!activeOrder) return;

        // Settle payment
        this.model.settlePayment(activeOrder.id, "Terminal Cash");
        this.model.logSecurityEvent(`Table ${this.posSelectedTableId} checkout settled. Revenue: ₹${activeOrder.total.toFixed(2)}.`);
        
        // Reset local selection state
        this.posSelectedTableId = null;
        this.appliedDiscountPercent = 0;
        
        this.refreshActiveDashboardView();
    }

    // 4. Kitchen Monitors Controls (KDS)
    updateKDSOrder(orderId, nextStatus) {
        if (nextStatus === "completed") {
            this.model.settlePayment(orderId, "Direct Register");
        } else {
            this.model.updateOrderStatus(orderId, nextStatus);
        }
        this.model.logSecurityEvent(`Updated KOT Order Docket ${orderId} status to ${nextStatus}.`);
        this.refreshActiveDashboardView();
    }

    cancelKDSOrder(orderId) {
        const orders = this.model.getOrders().filter(o => o.id !== orderId);
        this.model.saveOrders(orders);
        this.model.logSecurityEvent(`Rejected and voided Order Docket ID: ${orderId}`, "DANGER");
        this.refreshActiveDashboardView();
    }

    // 5. Stock Inventory Desk Controls
    addStockItem(key) {
        const input = document.getElementById(`restock-input-${key}`);
        const addedVal = input ? parseFloat(input.value) : 0;
        
        if (isNaN(addedVal) || addedVal <= 0) return;

        const inv = this.model.getInventory();
        if (inv[key]) {
            inv[key].qty += addedVal;
            this.model.saveInventory(inv);
            this.model.logSecurityEvent(`Restocked raw ingredient: ${inv[key].name} by ${addedVal} ${inv[key].unit}.`);
            this.refreshActiveDashboardView();
        }
    }

    resetDefaultStock() {
        localStorage.removeItem("restoflow_inventory");
        this.model.init();
        this.model.logSecurityEvent("Refilled all database recipe ingredients to full capacity.", "WARNING");
        this.refreshActiveDashboardView();
    }

    // 6. Custom Order Modal Panel Actions
    openOrderModal() {
        this.posDraftBasket = [];
        this.posOrderModalCategory = "All";
        this.view.showOrderModal(this.posSelectedTableId, this.posOrderModalCategory, this.posDraftBasket);
    }

    closeOrderModal() {
        this.view.hideOrderModal();
    }

    setPOSModalCategory(cat) {
        this.posOrderModalCategory = cat;
        this.view.renderPOSModalCategories(cat);
        this.view.renderPOSModalMenuGrid(cat);
    }

    addPOSDraftItem(itemId) {
        const menu = this.model.getMenu();
        const item = menu.find(i => i.id === itemId);
        if (!item) return;

        const existing = this.posDraftBasket.find(i => i.id === itemId);
        if (existing) {
            existing.qty++;
        } else {
            this.posDraftBasket.push({
                id: item.id,
                name: item.name,
                qty: 1,
                price: item.price,
                customizations: []
            });
        }

        this.view.renderPOSDraftTicket(this.posDraftBasket);
    }

    adjustPOSDraftQty(idx, change) {
        this.posDraftBasket[idx].qty += change;
        if (this.posDraftBasket[idx].qty <= 0) {
            this.posDraftBasket.splice(idx, 1);
        }
        this.view.renderPOSDraftTicket(this.posDraftBasket);
    }

    submitPOSModalOrder() {
        if (this.posDraftBasket.length === 0) {
            alert("Your order draft is empty. Please add some dishes first.");
            return;
        }

        let subtotal = 0;
        this.posDraftBasket.forEach(i => subtotal += (i.price * i.qty));
        const tax = subtotal * 0.05; // 5% GST
        const total = subtotal + tax;

        const existingOrder = this.model.getOrders().find(o => o.tableId === this.posSelectedTableId && o.status !== "completed");

        if (existingOrder) {
            // Append draft basket dishes to existing docket
            this.posDraftBasket.forEach(draftItem => {
                const existingItem = existingOrder.items.find(i => i.id === draftItem.id && (!i.customizations || i.customizations.length === 0));
                if (existingItem) {
                    existingItem.qty += draftItem.qty;
                } else {
                    existingOrder.items.push(draftItem);
                }
                this.model.deductStock(draftItem.id, draftItem.qty, []);
            });

            // Recalculate totals
            let newSubtotal = 0;
            existingOrder.items.forEach(i => newSubtotal += (i.price * i.qty));
            existingOrder.subtotal = newSubtotal;
            existingOrder.tax = newSubtotal * 0.05;
            existingOrder.total = newSubtotal * 1.05;
            existingOrder.status = "pending"; // Reset cooking status back to KDS

            const orders = this.model.getOrders();
            const idx = orders.findIndex(o => o.id === existingOrder.id);
            if (idx !== -1) {
                orders[idx] = existingOrder;
                this.model.saveOrders(orders);
            }

            this.model.logSecurityEvent(`Appended ${this.posDraftBasket.length} custom items to Table ${this.posSelectedTableId} bill from POS billing counter.`);
        } else {
            // Create brand new dine-in order
            this.model.createOrder({
                tableId: this.posSelectedTableId,
                items: this.posDraftBasket,
                subtotal,
                tax,
                total,
                paymentStatus: "unpaid",
                status: "pending",
                orderType: "Dine-In"
            });

            this.model.logSecurityEvent(`Custom KOT Order created for Table ${this.posSelectedTableId} from POS billing counter.`);
        }

        this.posDraftBasket = [];
        this.closeOrderModal();
        this.refreshActiveDashboardView();
    }

    // 7. CRM CRM Customer Loyalty Desk Actions
    lookupPOSLoyalty() {
        const input = document.getElementById("pos-crm-phone-input");
        const phone = input ? input.value.trim() : "";

        if (phone.length !== 10 || isNaN(phone)) {
            const details = document.getElementById("pos-crm-status-details");
            if (details) {
                details.innerHTML = `<span style="color:var(--status-alert); font-weight:700;">Enter a valid 10-digit number.</span>`;
                details.style.display = "block";
            }
            return;
        }

        const customer = this.model.getLoyaltyCustomer(phone);
        const activeOrder = this.model.getOrders().find(o => o.tableId === this.posSelectedTableId && o.status !== "completed");

        this.view.renderPOSLoyaltyLookupResult(phone, customer, activeOrder);
    }

    registerPOSLoyalty(phone) {
        this.model.registerLoyaltyCustomer(phone, "POS Guest Customer");
        this.lookupPOSLoyalty();
        alert("New loyalty profile registered successfully!");
    }

    applyPOSLoyaltyRedeem(phone) {
        const input = document.getElementById("pos-crm-redeem-input");
        const pts = input ? parseInt(input.value) : 0;
        const customer = this.model.getLoyaltyCustomer(phone);
        const activeOrder = this.model.getOrders().find(o => o.tableId === this.posSelectedTableId && o.status !== "completed");

        if (!customer || !activeOrder || isNaN(pts) || pts <= 0) return;

        if (pts > customer.points) {
            alert("Requested points redemption exceeds customer balance!");
            return;
        }

        activeOrder.phone = phone;
        activeOrder.loyaltyDiscount = pts;
        
        let subtotal = activeOrder.subtotal || 0;
        let couponDiscount = activeOrder.couponDiscount || 0;
        let net = Math.max(0, subtotal - couponDiscount - pts);
        let tax = (activeOrder.couponCode === "GSTFREE" || activeOrder.appliedCoupon === "GSTFREE") ? 0 : net * 0.05;
        activeOrder.tax = tax;
        activeOrder.total = net + tax;

        const orders = this.model.getOrders();
        const idx = orders.findIndex(o => o.id === activeOrder.id);
        if (idx !== -1) {
            orders[idx] = activeOrder;
            this.model.saveOrders(orders);
        }

        this.model.logSecurityEvent(`Redeemed ₹${pts} from CRM points for Table ${this.posSelectedTableId} bill.`);
        this.lookupPOSLoyalty();
        this.view.renderActiveCheckoutTicket(this.posSelectedTableId, this.appliedDiscountPercent);
    }

    // 8. Online Delivery Aggregators Handlers
    acceptOnlineOrder(orderId) {
        const order = this.model.acceptAggregatorOrder(orderId);
        if (order) {
            alert(`Aggregator Order ${orderId} accepted successfully! Transferred to KDS.`);
            this.refreshActiveDashboardView();
        }
    }

    rejectOnlineOrder(orderId) {
        if (confirm(`Are you sure you want to reject Aggregator Docket ${orderId}?`)) {
            this.model.rejectAggregatorOrder(orderId);
            this.refreshActiveDashboardView();
        }
    }
}
