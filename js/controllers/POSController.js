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

        // Employee Management Filter States
        this.employeeSearchQuery = "";
        this.employeeRoleFilter = "All";
        this.employeeStatusFilter = "All";
        this.employeeBranchFilter = "All";

        // Inventory Management Filter States
        this.inventorySearchQuery = "";
        this.inventoryCategoryFilter = "All";
        this.inventoryStatusFilter = "All";

        // Orders Management Filter States
        this.orderSearchQuery = "";
        this.orderChannelFilter = "All";
        this.orderStatusFilter = "All";

        // Menu Management Filter States
        this.menuSearchQuery = "";
        this.menuCategoryFilter = "All";
        this.menuStatusFilter = "All";

        // Listen for database changes to keep UI synchronized
        this.model.addEventListener("stateChange", (e) => {
            this.refreshActiveDashboardView();
        });
    }

    init() {
        // Redefine window.alert to show modern non-blocking Toast
        window.alert = (msg) => {
            this.view.showToast(msg, "info");
        };

        // Force-populate staff dropdown dynamically
        const staffList = this.model.getStaffList();
        this.view.renderLoginProfiles(staffList);

        // Bind physical keyboard support for PIN code entry
        window.addEventListener("keydown", (e) => {
            const loginGate = document.getElementById("merchant-login-gate");
            if (loginGate && loginGate.style.display !== "none") {
                // If focus is on the dropdown select, ignore keyboard triggers for standard numeric pin-pad actions so they can select via arrow keys
                if (document.activeElement === document.getElementById("login-username-select")) {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        this.submitPin();
                    }
                    return;
                }

                if (e.key >= "0" && e.key <= "9") {
                    this.pressPin(e.key);
                } else if (e.key === "Backspace") {
                    this.clearPin();
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    this.submitPin();
                }
            }
        });

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

    showConfirm(title, message, onConfirm) {
        const modal = document.createElement("div");
        modal.className = "modal open";
        modal.id = "custom-confirm-modal";
        modal.style.zIndex = "100000";

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; padding: 2.5rem; width: 90%; text-align: center;">
                <h3 style="font-family:'Playfair Display', serif; font-size:1.5rem; margin-bottom: 1rem; color:var(--pos-text);">${title}</h3>
                <p style="color:var(--pos-text-secondary); font-size:0.9rem; margin-bottom:2rem; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="confirm-cancel-btn" class="btn-pos-secondary" style="flex: 1; padding: 0.75rem;">Cancel</button>
                    <button id="confirm-ok-btn" class="btn-pos-primary" style="flex: 1; padding: 0.75rem; background: var(--pos-primary); color: white;">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => {
            modal.classList.remove("open");
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector("#confirm-cancel-btn").onclick = () => {
            close();
        };

        modal.querySelector("#confirm-ok-btn").onclick = () => {
            close();
            if (onConfirm) onConfirm();
        };
    }

    showEmployeePin(name, pin) {
        this.view.showToast(`Employee "${name}" Access PIN: ${pin}`, "warning");
    }

    viewCustomerActivity(name) {
        this.view.showToast(`Loading transaction activity history for ${name}...`, "success");
    }

    printReceipt(orderId) {
        this.view.showToast(`Receipt docket for order ${orderId} sent to thermal printer.`, "success");
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
            if (this.currentDashboardTab === "dashboard") {
                this.view.renderPOSDashboard();
            } else if (this.currentDashboardTab === "pos") {
                this.view.renderPOSFloorLayout(this.posSelectedTableId);
                this.view.renderActiveCheckoutTicket(this.posSelectedTableId, this.appliedDiscountPercent);
            } else if (this.currentDashboardTab === "orders") {
                this.view.renderOrdersManager(this.orderSearchQuery, this.orderChannelFilter, this.orderStatusFilter);
            } else if (this.currentDashboardTab === "menu") {
                this.view.renderMenuEditor(this.menuSearchQuery, this.menuCategoryFilter, this.menuStatusFilter);
            } else if (this.currentDashboardTab === "online") {
                this.view.renderOnlineOrdersDesk();
            } else if (this.currentDashboardTab === "kds") {
                this.view.renderKDSKitchenMonitor();
            } else if (this.currentDashboardTab === "inventory") {
                this.view.renderInventoryManager(this.inventorySearchQuery, this.inventoryCategoryFilter, this.inventoryStatusFilter);
            } else if (this.currentDashboardTab === "customers") {
                this.view.renderCustomersManager();
            } else if (this.currentDashboardTab === "employees") {
                this.view.renderEmployeeManager(this.employeeSearchQuery, this.employeeRoleFilter, this.employeeStatusFilter, this.employeeBranchFilter);
            } else if (this.currentDashboardTab === "branches") {
                this.view.renderBranches();
            } else if (this.currentDashboardTab === "integrations") {
                this.view.renderIntegrations();
            } else if (this.currentDashboardTab === "permissions") {
                this.view.renderPermissions();
            } else if (this.currentDashboardTab === "reports") {
                this.view.renderAnalyticsReports();
            } else if (this.currentDashboardTab === "billing-sub") {
                this.view.renderBilling();
            } else if (this.currentDashboardTab === "settings") {
                this.view.renderSettings();
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

    // --- Dynamic Employee Directory Handlers ---
    handleEmployeeSearch(val) {
        this.employeeSearchQuery = val;
        this.view.renderEmployeeManager(this.employeeSearchQuery, this.employeeRoleFilter, this.employeeStatusFilter, this.employeeBranchFilter);
    }

    handleEmployeeFilter(type, val) {
        if (type === 'role') this.employeeRoleFilter = val;
        if (type === 'status') this.employeeStatusFilter = val;
        if (type === 'branch') this.employeeBranchFilter = val;
        this.view.renderEmployeeManager(this.employeeSearchQuery, this.employeeRoleFilter, this.employeeStatusFilter, this.employeeBranchFilter);
    }

    addEmployeePrompt() {
        const modal = document.getElementById("pos-add-employee-modal");
        if (modal) {
            const form = document.getElementById("pos-add-employee-form");
            if (form) form.reset();
            modal.classList.add("open");
        }
    }

    closeAddEmployeeModal() {
        const modal = document.getElementById("pos-add-employee-modal");
        if (modal) {
            modal.classList.remove("open");
        }
    }

    submitAddEmployeeForm(event) {
        event.preventDefault();
        const name = document.getElementById("add-emp-name").value.trim();
        const role = document.getElementById("add-emp-role").value;
        const branch = document.getElementById("add-emp-branch").value;
        const email = document.getElementById("add-emp-email").value.trim();
        const pin = document.getElementById("add-emp-pin").value.trim();
        const phone = document.getElementById("add-emp-phone").value.trim();

        const currentStaff = JSON.parse(localStorage.getItem("restoflow_staff")) || [];
        const newEmp = {
            username: name.toLowerCase().replace(/\s+/g, ""),
            pin: pin || "0000",
            name,
            role,
            branch,
            contact: `${email} / +91 ${phone}`,
            joinDate: new Date().toISOString().split('T')[0],
            status: "Active"
        };
        currentStaff.push(newEmp);
        localStorage.setItem("restoflow_staff", JSON.stringify(currentStaff));
        this.model.logSecurityEvent(`Registered new employee profile: ${name} (${role})`);
        this.view.showToast(`Registered employee profile: ${name}`, "success");
        this.closeAddEmployeeModal();
        this.refreshActiveDashboardView();
        this.view.renderLoginProfiles(currentStaff);
    }

    // --- Dynamic Inventory Table Handlers ---
    handleInventorySearch(val) {
        this.inventorySearchQuery = val;
        this.view.renderInventoryManager(this.inventorySearchQuery, this.inventoryCategoryFilter, this.inventoryStatusFilter);
    }

    handleInventoryFilter(type, val) {
        if (type === 'category') this.inventoryCategoryFilter = val;
        if (type === 'status') this.inventoryStatusFilter = val;
        this.view.renderInventoryManager(this.inventorySearchQuery, this.inventoryCategoryFilter, this.inventoryStatusFilter);
    }

    addInventoryItemPrompt() {
        const modal = document.getElementById("pos-add-inventory-modal");
        if (modal) {
            const form = document.getElementById("pos-add-inventory-form");
            if (form) form.reset();
            modal.classList.add("open");
        }
    }

    closeAddInventoryModal() {
        const modal = document.getElementById("pos-add-inventory-modal");
        if (modal) {
            modal.classList.remove("open");
        }
    }

    submitAddInventoryForm(event) {
        event.preventDefault();
        const name = document.getElementById("add-inv-name").value.trim();
        const category = document.getElementById("add-inv-category").value;
        const maxQty = parseFloat(document.getElementById("add-inv-max").value);
        const cost = parseFloat(document.getElementById("add-inv-cost").value);
        const supplier = document.getElementById("add-inv-supplier").value.trim();
        const unit = document.getElementById("add-inv-unit").value.trim() || "pcs";

        const inv = this.model.getInventory();
        const key = name.toLowerCase().replace(/\s+/g, "");
        inv[key] = {
            name,
            category,
            qty: maxQty,
            max: maxQty,
            unit,
            min: maxQty * 0.2,
            cost,
            supplier,
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        this.model.saveInventory(inv);
        this.model.logSecurityEvent(`Added new raw inventory item: ${name} (Supplier: ${supplier})`);
        this.view.showToast(`Added ingredient: ${name} to stock`, "success");
        this.closeAddInventoryModal();
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

    addTablePrompt() {
        const modal = document.getElementById("pos-add-table-modal");
        if (modal) {
            const form = document.getElementById("pos-add-table-form");
            if (form) form.reset();
            modal.classList.add("open");
        }
    }

    closeAddTableModal() {
        const modal = document.getElementById("pos-add-table-modal");
        if (modal) {
            modal.classList.remove("open");
        }
    }

    submitAddTableForm(event) {
        event.preventDefault();
        const name = document.getElementById("add-table-name").value.trim();
        const seats = parseInt(document.getElementById("add-table-seats").value);

        if (isNaN(seats) || seats <= 0) {
            this.view.showToast("Invalid number of seats!", "error");
            return;
        }

        this.model.addTable({ name, seats });
        this.view.showToast(`Table ${name} added successfully!`, "success");
        this.closeAddTableModal();
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

    deleteReceiptItem(orderId, itemId) {
        this.showConfirm("Void Item?", "Are you sure you want to delete/void this item from the receipt?", () => {
            const orders = this.model.getOrders();
            const orderIdx = orders.findIndex(o => o.id === orderId);
            
            if (orderIdx !== -1) {
                const order = orders[orderIdx];
                const itemIdx = order.items.findIndex(i => i.id === itemId);
                
                if (itemIdx !== -1) {
                    const deletedItem = order.items[itemIdx];
                    order.items.splice(itemIdx, 1);
                    
                    // Recalculate subtotal
                    let subtotal = 0;
                    order.items.forEach(i => subtotal += (i.price * i.qty));
                    order.subtotal = subtotal;
                    
                    // Recalculate discounts and taxes
                    const couponDiscount = order.couponDiscount ? parseFloat(order.couponDiscount) : 0;
                    const loyaltyDiscount = order.loyaltyDiscount ? parseFloat(order.loyaltyDiscount) : 0;
                    const cashierDiscountVal = (subtotal - couponDiscount - loyaltyDiscount) * (this.appliedDiscountPercent / 100);
                    const totalDiscount = couponDiscount + loyaltyDiscount + cashierDiscountVal;
                    
                    const isGSTFree = order.couponCode === "GSTFREE" || order.appliedCoupon === "GSTFREE";
                    const tax = isGSTFree ? 0 : Math.max(0, subtotal - totalDiscount) * 0.05;
                    
                    order.tax = tax;
                    order.total = Math.max(0, subtotal - totalDiscount) + tax;
                    
                    if (order.items.length === 0) {
                        orders.splice(orderIdx, 1);
                        this.model.updateTableStatus(order.tableId, "Free");
                        this.posSelectedTableId = null;
                        this.model.logSecurityEvent(`Voided entire empty receipt for Table ${order.tableId}.`, "WARNING");
                        this.view.showToast(`Voided empty receipt for Table ${order.tableId}`, "warning");
                    } else {
                        orders[orderIdx] = order;
                        this.model.logSecurityEvent(`Deleted item "${deletedItem.name}" from Table ${order.tableId} receipt.`, "WARNING");
                        this.view.showToast(`Voided ${deletedItem.name} from Table ${order.tableId}`, "success");
                    }
                    
                    this.model.saveOrders(orders);
                    this.refreshActiveDashboardView();
                }
            }
        });
    }

    deleteKDSItem(orderId, itemId) {
        this.showConfirm("Void Kitchen Item?", "Are you sure you want to void this item from the kitchen order card?", () => {
            const orders = this.model.getOrders();
            const orderIdx = orders.findIndex(o => o.id === orderId);
            
            if (orderIdx !== -1) {
                const order = orders[orderIdx];
                const itemIdx = order.items.findIndex(i => i.id === itemId);
                
                if (itemIdx !== -1) {
                    const deletedItem = order.items[itemIdx];
                    order.items.splice(itemIdx, 1);
                    
                    // Recalculate subtotal
                    let subtotal = 0;
                    order.items.forEach(i => subtotal += (i.price * i.qty));
                    order.subtotal = subtotal;
                    
                    // Recalculate discounts and taxes
                    const couponDiscount = order.couponDiscount ? parseFloat(order.couponDiscount) : 0;
                    const loyaltyDiscount = order.loyaltyDiscount ? parseFloat(order.loyaltyDiscount) : 0;
                    const totalDiscount = couponDiscount + loyaltyDiscount;
                    
                    const isGSTFree = order.couponCode === "GSTFREE" || order.appliedCoupon === "GSTFREE";
                    const tax = isGSTFree ? 0 : Math.max(0, subtotal - totalDiscount) * 0.05;
                    
                    order.tax = tax;
                    order.total = Math.max(0, subtotal - totalDiscount) + tax;
                    
                    if (order.items.length === 0) {
                        orders.splice(orderIdx, 1);
                        this.model.updateTableStatus(order.tableId, "Free");
                        this.model.logSecurityEvent(`Voided entire kitchen ticket for Table ${order.tableId} from KDS.`, "WARNING");
                        this.view.showToast(`Voided KDS ticket for Table ${order.tableId}`, "warning");
                    } else {
                        orders[orderIdx] = order;
                        this.model.logSecurityEvent(`Voided item "${deletedItem.name}" from KDS Docket ${order.id}.`, "WARNING");
                        this.view.showToast(`Voided ${deletedItem.name} from KDS`, "success");
                    }
                    
                    this.model.saveOrders(orders);
                    this.refreshActiveDashboardView();
                }
            }
        });
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

    showFeedbackListModal() {
        const feedback = this.model.getFeedback();
        this.view.showFeedbackModal(feedback);
    }

    closeFeedbackModal() {
        this.view.hideFeedbackModal();
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
            this.view.showToast("Your order draft is empty. Please add some dishes first.", "error");
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
        this.view.showToast("New loyalty profile registered successfully!", "success");
    }

    applyPOSLoyaltyRedeem(phone) {
        const input = document.getElementById("pos-crm-redeem-input");
        const pts = input ? parseInt(input.value) : 0;
        const customer = this.model.getLoyaltyCustomer(phone);
        const activeOrder = this.model.getOrders().find(o => o.tableId === this.posSelectedTableId && o.status !== "completed");

        if (!customer || !activeOrder || isNaN(pts) || pts <= 0) return;

        if (pts > customer.points) {
            this.view.showToast("Requested points redemption exceeds customer balance!", "error");
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
        const aggOrders = this.model.getAggregatorOrders();
        const idx = aggOrders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            aggOrders[idx].status = "cooking"; // Change status to cooking so it shows "Mark food ready"
            this.model.saveAggregatorOrders(aggOrders);
            this.model.logSecurityEvent(`Accepted online aggregator order ${orderId} into Cooking queue.`);
            
            // Also push to central model queue for KDS sync
            const order = this.model.acceptAggregatorOrder(orderId);
            if (order) {
                this.view.showToast(`Aggregator Order ${orderId} accepted successfully! Transferred to KDS.`, "success");
            }
            this.refreshActiveDashboardView();
        }
    }

    dispatchOnlineOrder(orderId) {
        const aggOrders = this.model.getAggregatorOrders();
        const idx = aggOrders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            aggOrders[idx].status = "served"; // Dispatched
            this.model.saveAggregatorOrders(aggOrders);
            this.model.logSecurityEvent(`Marked Online order ${orderId} as ready & Dispatched.`);
            this.view.showToast(`Aggregator Order ${orderId} food ready & Dispatched`, "success");
            this.refreshActiveDashboardView();
        }
    }

    rejectOnlineOrder(orderId) {
        this.showConfirm("Reject Order?", `Are you sure you want to reject Aggregator Docket ${orderId}?`, () => {
            const aggOrders = this.model.getAggregatorOrders();
            const idx = aggOrders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
                aggOrders.splice(idx, 1);
                this.model.saveAggregatorOrders(aggOrders);
                this.model.logSecurityEvent(`Rejected Aggregator Order ${orderId}.`);
                this.view.showToast(`Rejected Aggregator Order ${orderId}`, "warning");
                this.refreshActiveDashboardView();
            }
        });
    }

    // --- Dynamic Orders Filter Handlers ---
    handleOrderSearch(val) {
        this.orderSearchQuery = val;
        this.view.renderOrdersManager(this.orderSearchQuery, this.orderChannelFilter, this.orderStatusFilter);
    }

    handleOrderFilter(type, val) {
        if (type === 'channel') this.orderChannelFilter = val;
        if (type === 'status') this.orderStatusFilter = val;
        this.view.renderOrdersManager(this.orderSearchQuery, this.orderChannelFilter, this.orderStatusFilter);
    }

    // --- Dynamic Menu Editor Handlers ---
    handleMenuSearch(val) {
        this.menuSearchQuery = val;
        this.view.renderMenuEditor(this.menuSearchQuery, this.menuCategoryFilter, this.menuStatusFilter);
    }

    handleMenuFilter(type, val) {
        if (type === 'category') this.menuCategoryFilter = val;
        this.view.renderMenuEditor(this.menuSearchQuery, this.menuCategoryFilter, this.menuStatusFilter);
    }

    toggleMenuItemAvailability(itemId) {
        const menu = this.model.getMenu();
        const idx = menu.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            menu[idx].status = menu[idx].status === "Inactive" ? "Active" : "Inactive";
            this.model.saveMenu(menu);
            this.model.logSecurityEvent(`Toggled menu availability for ${menu[idx].name}.`);
            this.refreshActiveDashboardView();
        }
    }

    openEditMenuModal(itemId) {
        const menu = this.model.getMenu();
        const item = menu.find(i => i.id === itemId);
        if (!item) return;

        document.getElementById("edit-menu-id").value = item.id;
        document.getElementById("edit-menu-name").value = item.name;
        document.getElementById("edit-menu-category").value = item.category;
        document.getElementById("edit-menu-price").value = item.price;
        document.getElementById("edit-menu-desc").value = item.description;
        document.getElementById("edit-menu-image").value = item.image || "";

        const modal = document.getElementById("pos-edit-menu-modal");
        if (modal) {
            modal.classList.add("open");
        }
    }

    closeEditMenuModal() {
        const modal = document.getElementById("pos-edit-menu-modal");
        if (modal) {
            modal.classList.remove("open");
        }
    }

    submitEditMenuForm(event) {
        event.preventDefault();
        const id = document.getElementById("edit-menu-id").value;
        const name = document.getElementById("edit-menu-name").value.trim();
        const category = document.getElementById("edit-menu-category").value;
        const price = parseFloat(document.getElementById("edit-menu-price").value);
        const description = document.getElementById("edit-menu-desc").value.trim();
        const image = document.getElementById("edit-menu-image").value.trim();

        if (!name || isNaN(price) || price <= 0) {
            this.view.showToast("Please enter a valid name and price!", "error");
            return;
        }

        const menu = this.model.getMenu();
        const itemIdx = menu.findIndex(i => i.id === id);
        if (itemIdx !== -1) {
            menu[itemIdx].name = name;
            menu[itemIdx].category = category;
            menu[itemIdx].price = price;
            menu[itemIdx].description = description;
            if (image) {
                menu[itemIdx].image = image;
            }
            this.model.saveMenu(menu);
            this.model.logSecurityEvent(`Updated menu item: ${name} (₹${price})`);
            this.view.showToast(`Updated menu item: ${name}`, "success");
        }
        this.closeEditMenuModal();
        this.refreshActiveDashboardView();
    }

    deleteMenuItem(itemId) {
        const menu = this.model.getMenu();
        const item = menu.find(i => i.id === itemId);
        if (!item) return;

        this.showConfirm("Delete Dish?", `Are you sure you want to permanently remove "${item.name}" from the menu catalog?`, () => {
            const updatedMenu = menu.filter(i => i.id !== itemId);
            this.model.saveMenu(updatedMenu);
            this.model.logSecurityEvent(`Deleted catalog menu item: ${item.name}`, "WARNING");
            this.view.showToast(`Deleted ${item.name} from catalog`, "success");
            this.refreshActiveDashboardView();
        });
    }

    addMenuItemPrompt() {
        const modal = document.getElementById("pos-add-menu-modal");
        if (modal) {
            const form = document.getElementById("pos-add-menu-form");
            if (form) form.reset();
            modal.classList.add("open");
        }
    }

    closeAddMenuModal() {
        const modal = document.getElementById("pos-add-menu-modal");
        if (modal) {
            modal.classList.remove("open");
        }
    }

    submitAddMenuForm(event) {
        event.preventDefault();
        const name = document.getElementById("add-menu-name").value.trim();
        const category = document.getElementById("add-menu-category").value;
        const price = parseFloat(document.getElementById("add-menu-price").value);
        const description = document.getElementById("add-menu-desc").value.trim();
        const image = document.getElementById("add-menu-image").value.trim();

        if (!name || isNaN(price) || price <= 0) {
            this.view.showToast("Please enter a valid name and price!", "error");
            return;
        }

        const menu = this.model.getMenu();
        const nextId = "m" + (menu.length + 1);
        const newItem = {
            id: nextId,
            name,
            category,
            price,
            description,
            image: image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600",
            ingredients: { spices: 1 },
            status: "Active"
        };

        menu.push(newItem);
        this.model.saveMenu(menu);
        this.model.logSecurityEvent(`Added new menu item via Admin Form: ${name} (₹${price})`);
        this.view.showToast(`Added ${name} to catalog`, "success");
        
        this.closeAddMenuModal();
        this.refreshActiveDashboardView();
    }
}
