/**
 * RestoFlow Merchant Admin POS & Dashboard Controller
 */

let enteredPin = "";
let posSelectedTableId = null;
let appliedDiscountPercent = 0;
let currentDashboardTab = "pos";

// 1. PIN Access Authorization Control
function pressPin(num) {
    if (enteredPin.length < 4) {
        enteredPin += num;
        updatePinDisplay();
    }
}

function clearPin() {
    enteredPin = "";
    updatePinDisplay();
}

function updatePinDisplay() {
    const display = document.getElementById("pin-secure-display");
    // Show hidden dots for secure pin aesthetics
    display.innerText = "•".repeat(enteredPin.length);
}

function submitPin() {
    const username = document.getElementById("login-username-select").value;
    const errorMsg = document.getElementById("login-error-msg");

    if (enteredPin.length < 4) {
        errorMsg.innerText = "Access PIN must be 4 digits.";
        errorMsg.style.display = "block";
        return;
    }

    const sessionUser = CoreState.login(username, enteredPin);

    if (sessionUser) {
        // Hide login and trigger POS workspace display
        document.getElementById("merchant-login-gate").style.display = "none";
        document.getElementById("merchant-sidebar").style.display = "flex";
        document.getElementById("merchant-main").style.display = "flex";

        // Setup staff indicators
        document.getElementById("merchant-staff-name").innerText = sessionUser.name;
        document.getElementById("merchant-staff-role").innerText = sessionUser.role;

        // Initialize dashboard systems
        clearPin();
        initDashboardEngine();
    } else {
        clearPin();
        errorMsg.innerText = "Incorrect Secure PIN code. Access denied.";
        errorMsg.style.display = "block";
    }
}

function logoutMerchant() {
    CoreState.logout();
    document.getElementById("merchant-login-gate").style.display = "flex";
    document.getElementById("merchant-sidebar").style.display = "none";
    document.getElementById("merchant-main").style.display = "none";
    document.getElementById("login-error-msg").style.display = "none";
}

// 2. Dashboard Lifecycle Initialization
function initDashboardEngine() {
    // Check if user is logged in (session backup checks)
    const activeSession = CoreState.getCurrentUser();
    if (!activeSession) {
        logoutMerchant();
        return;
    }

    // Bind state changes listener to auto-sync screens instantly
    window.addEventListener("restoflowStateChange", (e) => {
        // Redraw any currently active workspace panels
        refreshActiveDashboardView();
    });

    // Draw active default view
    refreshActiveDashboardView();
}

function refreshActiveDashboardView() {
    try {
        if (currentDashboardTab === "pos") {
            try {
                renderPOSFloorLayout();
            } catch (err) {
                console.error("Error rendering floor layout:", err);
            }
            try {
                renderActiveCheckoutTicket();
            } catch (err) {
                console.error("Error rendering checkout ticket:", err);
            }
        } else if (currentDashboardTab === "online") {
            try {
                renderOnlineOrdersDesk();
            } catch (err) {
                console.error("Error rendering online orders desk:", err);
            }
        } else if (currentDashboardTab === "kds") {
            try {
                renderKDSKitchenMonitor();
            } catch (err) {
                console.error("Error rendering KDS board:", err);
            }
        } else if (currentDashboardTab === "inventory") {
            try {
                renderInventoryManager();
            } catch (err) {
                console.error("Error rendering inventory desk:", err);
            }
        } else if (currentDashboardTab === "reports") {
            try {
                renderAnalyticsReports();
            } catch (err) {
                console.error("Error rendering analytics panel:", err);
            }
        } else if (currentDashboardTab === "security") {
            try {
                renderSecurityAccessConsole();
            } catch (err) {
                console.error("Error rendering security console:", err);
            }
        }
    } catch (e) {
        console.error("Fatal error in dashboard view manager:", e);
    }
}

function switchDashboardTab(tabId) {
    currentDashboardTab = tabId;
    
    // Toggle active link highlights
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });
    document.getElementById(`tab-nav-${tabId}`).classList.add("active");

    // Hide all view panels
    document.querySelectorAll(".pos-view-panel").forEach(panel => {
        panel.style.display = "none";
    });
    
    // Display current tab panel
    document.getElementById(`view-pos-${tabId}`).style.display = "flex";
    
    // Draw current tab content
    refreshActiveDashboardView();
}

// 3. POS Billing View Renderers
function renderPOSFloorLayout() {
    const tables = CoreState.getTables();
    const container = document.getElementById("pos-tables-floor-grid");
    if (!container) return;

    container.innerHTML = tables.map(table => {
        let statusClass = "free";
        if (table.status === "Dining") statusClass = "dining";
        if (table.status === "Billing") statusClass = "billing";

        const isSelected = table.id === posSelectedTableId ? "selected" : "";

        // Check if there is an active order sum to display
        const activeOrder = CoreState.getOrders().find(o => o.tableId === table.id && o.status !== "completed");
        
        let orderSummary = `${table.seats} Seats`;
        if (activeOrder) {
            const displayPrice = (typeof activeOrder.total === 'number') ? activeOrder.total : parseFloat(activeOrder.total || 0);
            orderSummary = isNaN(displayPrice) ? "₹0.00" : `₹${displayPrice.toFixed(2)}`;
        }

        return `
            <div class="table-node ${statusClass} ${isSelected}" onclick="selectPOSTable(${table.id})">
                <div class="table-status-pill"></div>
                <h4>${table.name}</h4>
                <span>${orderSummary}</span>
            </div>
        `;
    }).join("");
}

function selectPOSTable(tableId) {
    posSelectedTableId = tableId;
    appliedDiscountPercent = 0; // Reset discounts on selection change
    
    // Reset CRM input values
    const crmInput = document.getElementById("pos-crm-phone-input");
    if (crmInput) crmInput.value = "";
    const crmDetails = document.getElementById("pos-crm-status-details");
    if (crmDetails) crmDetails.style.display = "none";

    renderPOSFloorLayout();
    renderActiveCheckoutTicket();
}

function renderActiveCheckoutTicket() {
    const desk = document.getElementById("terminal-active-ticket-desk");
    const actions = document.getElementById("terminal-action-buttons-desk");
    const addItemsBtn = document.getElementById("btn-terminal-add-items");
    const crmWidget = document.getElementById("terminal-crm-widget");
    if (!desk) return;

    if (!posSelectedTableId) {
        desk.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No table selected. Click on a table layout block to print active billing ticket details.</p>
            </div>
        `;
        actions.style.display = "none";
        if (crmWidget) crmWidget.style.display = "none";
        if (addItemsBtn) addItemsBtn.style.display = "none";
        document.getElementById("terminal-selected-title").innerText = "Receipt Terminal: Table --";
        return;
    }

    document.getElementById("terminal-selected-title").innerText = `Receipt Terminal: Table ${posSelectedTableId}`;

    const activeOrder = CoreState.getOrders().find(o => o.tableId === posSelectedTableId && o.status !== "completed");

    if (!activeOrder) {
        desk.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <p>Table ${posSelectedTableId} is currently vacant.</p>
                <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%; margin-top:1.25rem;">
                    <button class="btn-pos-secondary" onclick="createWalkInOrder()">Seat Standard Walk-In</button>
                    <button class="btn-pos-primary" onclick="openOrderModal()" style="font-size:0.85rem; padding:0.6rem;">+ Take Custom Order</button>
                </div>
            </div>
        `;
        actions.style.display = "none";
        if (crmWidget) crmWidget.style.display = "none";
        if (addItemsBtn) addItemsBtn.style.display = "none";
        return;
    }

    // Table is occupied. Display add items and CRM widgets
    if (addItemsBtn) {
        addItemsBtn.innerText = "+ Add Items";
        addItemsBtn.style.display = "block";
    }
    if (crmWidget) {
        crmWidget.style.display = "block";
    }

    // Calculate receipt calculations safely
    const subtotal = activeOrder.subtotal ? (typeof activeOrder.subtotal === 'number' ? activeOrder.subtotal : parseFloat(activeOrder.subtotal || 0)) : 0;
    
    // Check if the order came with loyalty points or coupons from customer QR portal, otherwise use cashier discounts
    const couponDiscount = activeOrder.couponDiscount ? parseFloat(activeOrder.couponDiscount) : 0;
    const loyaltyDiscount = activeOrder.loyaltyDiscount ? parseFloat(activeOrder.loyaltyDiscount) : 0;
    
    // Cashier dynamic discount percent
    const cashierDiscountVal = isNaN(subtotal) ? 0 : (subtotal - couponDiscount - loyaltyDiscount) * (appliedDiscountPercent / 100);
    const totalDiscount = couponDiscount + loyaltyDiscount + cashierDiscountVal;
    
    // Tax computation (5% GST or exempt if GSTFREE coupon is active)
    const isGSTFree = activeOrder.couponCode === "GSTFREE" || activeOrder.appliedCoupon === "GSTFREE";
    const tax = isGSTFree ? 0 : Math.max(0, subtotal - totalDiscount) * 0.05;
    const cgst = tax / 2;
    const sgst = tax / 2;
    
    const grandTotal = Math.max(0, subtotal - totalDiscount) + tax;

    const displaySubtotal = isNaN(subtotal) ? "0.00" : subtotal.toFixed(2);
    const displayDiscount = isNaN(totalDiscount) ? "0.00" : totalDiscount.toFixed(2);
    const displayCGST = isNaN(cgst) ? "0.00" : cgst.toFixed(2);
    const displaySGST = isNaN(sgst) ? "0.00" : sgst.toFixed(2);
    const displayGrandTotal = isNaN(grandTotal) ? "0.00" : grandTotal.toFixed(2);

    desk.innerHTML = `
        <div class="receipt-header">
            <h4 style="font-family:'Playfair Display', serif; font-weight: 800; font-size:1.25rem;">GANESHWARAM</h4>
            <p style="font-size:0.75rem; color:var(--pos-text-secondary); margin-top:0.2rem;">KITCHEN RECEIPT TICKET: ${activeOrder.id}</p>
            <p style="font-size:0.7rem; color:var(--pos-text-secondary);">Table ${posSelectedTableId} | Placed: ${new Date(activeOrder.timestamp).toLocaleTimeString()}</p>
        </div>

        <div style="margin-bottom:1rem;">
            ${(activeOrder.items || []).map(item => {
                const itemPrice = item.price ? (typeof item.price === 'number' ? item.price : parseFloat(item.price || 0)) : 0;
                const displayPrice = isNaN(itemPrice) ? "0.00" : (itemPrice * item.qty).toFixed(2);
                return `
                    <div class="receipt-row">
                        <span>${item.qty}x ${item.name}</span>
                        <span>₹${displayPrice}</span>
                    </div>
                    ${item.customizations && item.customizations.length > 0 ? `<p style="font-size:0.7rem; color:var(--pos-primary); margin-top:-0.25rem; margin-bottom:0.3rem; padding-left:0.5rem;">+ ${item.customizations.join(", ")}</p>` : ''}
                `;
            }).join("")}
        </div>

        <div style="border-top:1px dashed var(--pos-border); padding-top:0.75rem; display:flex; flex-direction:column; gap:0.3rem;">
            <div class="receipt-row">
                <span>Subtotal</span>
                <span>₹${displaySubtotal}</span>
            </div>
            ${totalDiscount > 0 ? `
                <div class="receipt-row" style="color:var(--pos-primary);">
                    <span>Discount (incl. Loyalty/Promos)</span>
                    <span>-₹${displayDiscount}</span>
                </div>
            ` : ''}
            <div class="receipt-row">
                <span>CGST (2.5%)</span>
                <span>₹${displayCGST}</span>
            </div>
            <div class="receipt-row">
                <span>SGST (2.5%)</span>
                <span>₹${displaySGST}</span>
            </div>
            <div class="receipt-row total">
                <span>Grand Total</span>
                <span>₹${displayGrandTotal}</span>
            </div>
        </div>
    `;

    actions.style.display = "block";
}

function createWalkInOrder() {
    // Generate a default instant order for walk-ins in Rupees (Paneer Combo & Chai)
    const sampleDishes = [
        { id: "m2", name: "Artisanal Paneer Tikka Masala Combo", qty: 1, price: 320.00, customizations: ["Extra Roti"] },
        { id: "m6", name: "Authentic Masala Kulhad Chai", qty: 2, price: 40.00, customizations: [] }
    ];

    CoreState.createOrder({
        tableId: posSelectedTableId,
        items: sampleDishes,
        subtotal: 400.00,
        tax: 20.00, // 5% GST
        total: 420.00,
        paymentStatus: "unpaid",
        status: "pending",
        orderType: "Dine-In"
    });

    CoreState.logSecurityEvent(`Walk-in customer seated and order created for Table ${posSelectedTableId}`);
    refreshActiveDashboardView();
}

function applyDiscount(percent) {
    appliedDiscountPercent = percent;
    CoreState.logSecurityEvent(`Applied ${percent}% discount to receipt for Table ${posSelectedTableId}`, "WARNING");
    renderActiveCheckoutTicket();
}

function processTerminalCheckout() {
    const activeOrder = CoreState.getOrders().find(o => o.tableId === posSelectedTableId && o.status !== "completed");
    if (!activeOrder) return;

    // Confirm local settlement
    CoreState.settlePayment(activeOrder.id, "Terminal Cash");
    CoreState.logSecurityEvent(`Table ${posSelectedTableId} checkout settled. Revenue: ₹${activeOrder.total.toFixed(2)}.`);
    
    // Clear selection
    posSelectedTableId = null;
    appliedDiscountPercent = 0;
    
    refreshActiveDashboardView();
}

// 4. KDS Kitchen Monitor Board
function renderKDSKitchenMonitor() {
    const orders = CoreState.getOrders().filter(o => o.status !== "completed");
    const board = document.getElementById("pos-kds-board-grid");
    if (!board) return;

    if (orders.length === 0) {
        board.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🍳</div>
                <p>No cooking orders are in the queue. Restaurant is calm.</p>
            </div>
        `;
        return;
    }

    board.innerHTML = orders.map(order => {
        let statusBadge = "pending";
        let nextActionLabel = "Start Cooking";
        let nextActionStatus = "cooking";
        
        if (order.status === "cooking") {
            statusBadge = "cooking";
            nextActionLabel = "Ready to Serve";
            nextActionStatus = "ready";
        } else if (order.status === "ready") {
            statusBadge = "ready";
            nextActionLabel = "Deliver Order";
            nextActionStatus = "served";
        } else if (order.status === "served") {
            statusBadge = "ready";
            nextActionLabel = "Complete Bill";
            nextActionStatus = "completed";
        }

        return `
            <div class="kds-card">
                <div class="kds-header">
                    <div>
                        <h4 style="font-family:'Playfair Display', serif; font-weight: 700; color:var(--pos-text);">Table ${order.tableId || 'Takeaway'}</h4>
                        <span style="font-size:0.75rem; color:var(--pos-text-secondary);">${order.id}</span>
                    </div>
                    <span class="kds-badge ${statusBadge}">${order.status}</span>
                </div>

                <div class="kds-items">
                    ${order.items.map(i => `
                        <div style="display:flex; justify-content:space-between; font-weight:600;">
                            <span>${i.qty}x ${i.name}</span>
                        </div>
                        ${i.customizations && i.customizations.length > 0 ? `<p style="font-size:0.75rem; color:var(--pos-primary); margin-top:-0.15rem; margin-bottom:0.25rem;">+ ${i.customizations.join(", ")}</p>` : ''}
                    `).join("")}
                </div>

                <div class="kds-btn-grid">
                    ${order.status !== "served" ? `
                        <button class="kds-btn" style="background:var(--pos-primary); color:white;" onclick="updateKDSOrder('${order.id}', '${nextActionStatus}')">
                            ${nextActionLabel}
                        </button>
                    ` : `
                        <button class="kds-btn" style="background:#10b981; color:white;" onclick="updateKDSOrder('${order.id}', 'completed')">
                            Close Docket
                        </button>
                    `}
                    <button class="kds-btn" style="background:var(--pos-bg-alt); color:var(--pos-text-secondary);" onclick="cancelKDSOrder('${order.id}')">
                        Reject Order
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function updateKDSOrder(orderId, nextStatus) {
    if (nextStatus === "completed") {
        CoreState.settlePayment(orderId, "Direct Register");
    } else {
        CoreState.updateOrderStatus(orderId, nextStatus);
    }
    CoreState.logSecurityEvent(`Updated KOT Order Docket ${orderId} status to ${nextStatus}.`);
    refreshActiveDashboardView();
}

function cancelKDSOrder(orderId) {
    const orders = CoreState.getOrders().filter(o => o.id !== orderId);
    CoreState.saveOrders(orders);
    CoreState.logSecurityEvent(`Rejected and voided Order Docket ID: ${orderId}`, "DANGER");
    refreshActiveDashboardView();
}

// 5. Stock Inventory Desk Controller
function renderInventoryManager() {
    const inv = CoreState.getInventory();
    const tableBody = document.getElementById("pos-inventory-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = Object.entries(inv).map(([key, item]) => {
        let statusText = "In Stock";
        let statusClass = "in-stock";
        
        if (item.qty <= 0) {
            statusText = "Out Of Stock";
            statusClass = "out-of-stock";
        } else if (item.qty <= item.min) {
            statusText = "Low Stock Alert";
            statusClass = "low-stock";
        }

        return `
            <tr>
                <td style="font-weight: 700; color:white;">${item.name}</td>
                <td><span style="font-weight:600;">${item.qty.toFixed(1)}</span> ${item.unit}</td>
                <td>${item.min} ${item.unit}</td>
                <td><span class="status-tag ${statusClass}">${statusText}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <input type="number" id="restock-input-${key}" class="stock-input" value="10">
                        <button class="btn-pos-secondary" style="padding: 0.35rem 0.75rem; font-size:0.8rem;" onclick="addStockItem('${key}')">Restock</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function addStockItem(key) {
    const input = document.getElementById(`restock-input-${key}`);
    const addedVal = parseFloat(input.value);
    
    if (isNaN(addedVal) || addedVal <= 0) return;

    const inv = CoreState.getInventory();
    if (inv[key]) {
        inv[key].qty += addedVal;
        CoreState.saveInventory(inv);
        CoreState.logSecurityEvent(`Restocked raw ingredient: ${inv[key].name} by ${addedVal} ${inv[key].unit}.`);
        refreshActiveDashboardView();
    }
}

function resetDefaultStock() {
    localStorage.removeItem("restoflow_inventory");
    CoreState.init();
    CoreState.logSecurityEvent("Refilled all database recipe ingredients to full capacity.", "WARNING");
    refreshActiveDashboardView();
}

// 6. Business Intelligence Graphs (SVG dynamic build)
function renderAnalyticsReports() {
    const orders = CoreState.getOrders();
    const feedback = CoreState.getFeedback();
    const tables = CoreState.getTables();
    const inv = CoreState.getInventory();

    // 1. Stat computations safely
    let grossToday = 0;
    orders.forEach(o => {
        const oTotal = o.total ? (typeof o.total === 'number' ? o.total : parseFloat(o.total || 0)) : 0;
        grossToday += isNaN(oTotal) ? 0 : oTotal;
    });

    const activeTableCount = tables.filter(t => t.status !== "Free").length;
    
    let warningStockCount = 0;
    Object.values(inv).forEach(item => {
        if (item.qty <= item.min) warningStockCount++;
    });

    const avgRating = feedback.length > 0 
        ? (feedback.reduce((sum, f) => sum + (parseFloat(f.rating) || 0), 0) / feedback.length).toFixed(1)
        : "4.8";

    // Inject Stats safely
    document.getElementById("rep-today-sales").innerText = `₹${isNaN(grossToday) ? "0.00" : grossToday.toFixed(2)}`;
    document.getElementById("rep-active-tables").innerText = `${activeTableCount} / 12`;
    document.getElementById("rep-low-stocks").innerText = warningStockCount;
    document.getElementById("rep-satisfaction").innerText = `${avgRating} ★`;

    // 2. SVG Hourly Chart Builder
    const chartDesk = document.getElementById("svg-hourly-sales-chart");
    if (chartDesk) {
        // Let's draw horizontal columns dynamically
        const hourlyData = [
            { hour: "12 PM", val: grossToday * 0.15 },
            { hour: "2 PM", val: grossToday * 0.12 },
            { hour: "4 PM", val: grossToday * 0.08 },
            { hour: "6 PM", val: grossToday * 0.22 },
            { hour: "8 PM", val: grossToday * 0.35 },
            { hour: "10 PM", val: grossToday * 0.08 }
        ];

        const maxVal = Math.max(...hourlyData.map(d => d.val), 50);

        chartDesk.innerHTML = hourlyData.map(d => {
            const pct = (d.val / maxVal) * 100;
            return `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:0.5rem; height:100%; justify-content:flex-end;">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text);">₹${d.val.toFixed(0)}</span>
                    <div style="background:var(--pos-primary); width:100%; height:${Math.max(pct, 5)}%; border-radius:4px; box-shadow:0 0 10px var(--pos-primary-glow); transition:height 0.4s ease;"></div>
                    <span style="font-size:0.7rem; color:var(--pos-text-secondary);">${d.hour}</span>
                </div>
            `;
        }).join("");
    }

    // 3. Category Share Pie Representation (custom clean layout styled inside dashboard)
    const pieDesk = document.getElementById("svg-pie-categories-chart");
    if (pieDesk) {
        pieDesk.innerHTML = `
            <svg width="200" height="200" viewBox="0 0 42 42" class="donut">
                <circle class="donut-hole" cx="21" cy="21" r="15.915" fill="transparent"></circle>
                <circle class="donut-ring" cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--pos-bg-alt)" stroke-width="4"></circle>
                
                <!-- Mains Slice: 45% -->
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--pos-primary)" stroke-width="4" stroke-dasharray="45 55" stroke-dashoffset="25"></circle>
                <!-- Fusion Pizzas Slice: 30% -->
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="4" stroke-dasharray="30 70" stroke-dashoffset="80"></circle>
                <!-- Beverages: 15% -->
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="#eab308" stroke-width="4" stroke-dasharray="15 85" stroke-dashoffset="110"></circle>
                <!-- Desserts: 10% -->
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" stroke-width="4" stroke-dasharray="10 90" stroke-dashoffset="125"></circle>
            </svg>
            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-left:2rem; font-size:0.85rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;"><div style="width:12px; height:12px; background:var(--pos-primary); border-radius:3px;"></div>Mains (45%)</div>
                <div style="display:flex; align-items:center; gap:0.5rem;"><div style="width:12px; height:12px; background:#3b82f6; border-radius:3px;"></div>Fusion Pizzas (30%)</div>
                <div style="display:flex; align-items:center; gap:0.5rem;"><div style="width:12px; height:12px; background:#eab308; border-radius:3px;"></div>Beverages (15%)</div>
                <div style="display:flex; align-items:center; gap:0.5rem;"><div style="width:12px; height:12px; background:#10b981; border-radius:3px;"></div>Desserts (10%)</div>
            </div>
        `;
    }
}

// 7. Security logs terminal console
function renderSecurityAccessConsole() {
    const logs = CoreState.getSecurityLogs();
    const consoleBox = document.getElementById("pos-security-console");
    if (!consoleBox) return;

    if (logs.length === 0) {
        consoleBox.innerHTML = `<div class="log-entry"><span class="log-time">[${new Date().toLocaleTimeString()}]</span> System initialized securely. Audits ready.</div>`;
        return;
    }

    // Render from newest to oldest
    consoleBox.innerHTML = [...logs].reverse().map(log => `
        <div class="log-entry level-${log.level}">
            <span class="log-time">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span style="font-weight:700;">[${log.level}]</span>
            <span>${log.message}</span>
        </div>
    `).join("");
}

// Auto launch checks on load
window.addEventListener("load", () => {
    // Check if there is already an active session to skip login
    const session = CoreState.getCurrentUser();
    if (session) {
        document.getElementById("merchant-login-gate").style.display = "none";
        document.getElementById("merchant-sidebar").style.display = "flex";
        document.getElementById("merchant-main").style.display = "flex";
        
        document.getElementById("merchant-staff-name").innerText = session.name;
        document.getElementById("merchant-staff-role").innerText = session.role;
        
        initDashboardEngine();
    }
});

/* --- POS CUSTOM ORDER ENTRY MODAL CONTROLLERS --- */
let posDraftBasket = [];
let posOrderModalCategory = "All";

function openOrderModal() {
    posDraftBasket = [];
    posOrderModalCategory = "All";
    
    // Set title
    const modalTitle = document.getElementById("pos-order-modal-title");
    if (modalTitle) {
        modalTitle.innerText = `Take Order: Table ${posSelectedTableId}`;
    }

    // Render elements
    renderPOSModalCategories();
    renderPOSModalMenuGrid();
    renderPOSDraftTicket();

    // Show modal
    document.getElementById("pos-order-modal").classList.add("open");
}

function closeOrderModal() {
    document.getElementById("pos-order-modal").classList.remove("open");
}

function renderPOSModalCategories() {
    const menu = CoreState.getMenu();
    const categories = ["All", ...new Set(menu.map(item => item.category))];
    const container = document.getElementById("pos-modal-categories");
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <button class="category-pill ${cat === posOrderModalCategory ? 'active' : ''}" 
                style="padding:0.4rem 1rem; font-size:0.8rem; border-radius:100px;"
                onclick="setPOSModalCategory('${cat}')">
            ${cat}
        </button>
    `).join("");
}

function setPOSModalCategory(cat) {
    posOrderModalCategory = cat;
    renderPOSModalCategories();
    renderPOSModalMenuGrid();
}

function renderPOSModalMenuGrid() {
    const menu = CoreState.getMenu();
    const container = document.getElementById("pos-modal-menu-grid");
    if (!container) return;

    let items = posOrderModalCategory === "All"
        ? menu
        : menu.filter(i => i.category === posOrderModalCategory);

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align:left;">
            ${items.map(item => `
                <div style="background:var(--pos-bg-alt); border:1px solid var(--pos-border); border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="font-size:0.95rem; font-weight:700; color:var(--pos-text);">${item.name}</h4>
                        <span style="font-size:0.8rem; color:var(--pos-primary); font-weight:700;">₹${item.price.toFixed(2)}</span>
                    </div>
                    <button class="btn-pos-secondary" style="padding:0.35rem 0.65rem; font-size:0.75rem;" onclick="addPOSDraftItem('${item.id}')">+ Add</button>
                </div>
            `).join("")}
        </div>
    `;
}

function addPOSDraftItem(itemId) {
    const menu = CoreState.getMenu();
    const item = menu.find(i => i.id === itemId);
    if (!item) return;

    const existing = posDraftBasket.find(i => i.id === itemId);
    if (existing) {
        existing.qty++;
    } else {
        posDraftBasket.push({
            id: item.id,
            name: item.name,
            qty: 1,
            price: item.price,
            customizations: [] // Cashier billing desk orders skip long customizers for speed
        });
    }

    renderPOSDraftTicket();
}

function adjustPOSDraftQty(idx, change) {
    posDraftBasket[idx].qty += change;
    if (posDraftBasket[idx].qty <= 0) {
        posDraftBasket.splice(idx, 1);
    }
    renderPOSDraftTicket();
}

function renderPOSDraftTicket() {
    const list = document.getElementById("pos-modal-draft-list");
    if (!list) return;

    if (posDraftBasket.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 2rem 0;">
                <div class="empty-state-icon" style="font-size:2rem;">🛒</div>
                <p style="font-size:0.85rem; color:var(--pos-text-secondary);">Your order draft is empty.</p>
            </div>
        `;
        document.getElementById("pos-modal-subtotal").innerText = "₹0.00";
        document.getElementById("pos-modal-total").innerText = "₹0.00";
        return;
    }

    list.innerHTML = posDraftBasket.map((item, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding: 0.25rem 0; border-bottom:1px solid var(--pos-border);">
            <div>
                <span style="font-weight:700; color:var(--pos-text);">${item.name}</span>
                <p style="font-size:0.75rem; color:var(--pos-text-secondary);">₹${item.price.toFixed(2)} each</p>
            </div>
            <div style="display:flex; align-items:center; gap:0.6rem; background:var(--pos-bg-alt); padding:0.2rem 0.5rem; border-radius:4px; border:1px solid var(--pos-border);">
                <button class="qty-btn" style="background:transparent; border:none; color:var(--pos-text); font-weight:700; cursor:pointer;" onclick="adjustPOSDraftQty(${idx}, -1)">-</button>
                <span style="font-weight:700; color:var(--pos-text); font-size:0.85rem;">${item.qty}</span>
                <button class="qty-btn" style="background:transparent; border:none; color:var(--pos-text); font-weight:700; cursor:pointer;" onclick="adjustPOSDraftQty(${idx}, 1)">+</button>
            </div>
        </div>
    `).join("");

    // Calculate totals
    let subtotal = 0;
    posDraftBasket.forEach(i => subtotal += (i.price * i.qty));
    const total = subtotal * 1.05; // 5% GST

    document.getElementById("pos-modal-subtotal").innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById("pos-modal-total").innerText = `₹${total.toFixed(2)}`;
}

function submitPOSModalOrder() {
    if (posDraftBasket.length === 0) {
        alert("Your order draft is empty. Please add some dishes first.");
        return;
    }

    let subtotal = 0;
    posDraftBasket.forEach(i => subtotal += (i.price * i.qty));
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + tax;

    // Check if table is occupied (to append) or vacant (to create)
    const existingOrder = CoreState.getOrders().find(o => o.tableId === posSelectedTableId && o.status !== "completed");

    if (existingOrder) {
        // APPEND DRAFT TO EXISTING DOCKET
        posDraftBasket.forEach(draftItem => {
            const existingItem = existingOrder.items.find(i => i.id === draftItem.id && (!i.customizations || i.customizations.length === 0));
            if (existingItem) {
                existingItem.qty += draftItem.qty;
            } else {
                existingOrder.items.push(draftItem);
            }

            // Deplete ingredient stocks immediately
            CoreState.deductStock(draftItem.id, draftItem.qty, []);
        });

        // Recalculate totals
        let newSubtotal = 0;
        existingOrder.items.forEach(i => newSubtotal += (i.price * i.qty));
        existingOrder.subtotal = newSubtotal;
        existingOrder.tax = newSubtotal * 0.05;
        existingOrder.total = newSubtotal * 1.05;

        // Reset cooking status back to pending so kitchen chef sees new items!
        existingOrder.status = "pending";

        // Save order
        const orders = CoreState.getOrders();
        const idx = orders.findIndex(o => o.id === existingOrder.id);
        if (idx !== -1) {
            orders[idx] = existingOrder;
            CoreState.saveOrders(orders);
        }

        CoreState.logSecurityEvent(`Appended ${posDraftBasket.length} custom items to Table ${posSelectedTableId} bill from POS billing counter.`);
    } else {
        // CREATE BRAND NEW WALK-IN ORDER
        CoreState.createOrder({
            tableId: posSelectedTableId,
            items: posDraftBasket,
            subtotal,
            tax,
            total,
            paymentStatus: "unpaid",
            status: "pending",
            orderType: "Dine-In"
        });

        CoreState.logSecurityEvent(`Custom KOT Order created for Table ${posSelectedTableId} from POS billing counter.`);
    }

    // Reset drawer state and close
    posDraftBasket = [];
    closeOrderModal();
    
    // Refresh floor layouts
    refreshActiveDashboardView();
}

/* --- LOYALTY CRM BILLING COUNTER ACTIONS --- */
function lookupPOSLoyalty() {
    const phone = document.getElementById("pos-crm-phone-input").value.trim();
    const details = document.getElementById("pos-crm-status-details");
    if (!details) return;

    if (phone.length !== 10 || isNaN(phone)) {
        details.innerHTML = `<span style="color:var(--status-alert); font-weight:700;">Enter a valid 10-digit number.</span>`;
        details.style.display = "block";
        return;
    }

    const customer = CoreState.getLoyaltyCustomer(phone);
    const activeOrder = CoreState.getOrders().find(o => o.tableId === posSelectedTableId && o.status !== "completed");

    if (customer) {
        details.innerHTML = `
            <div style="color:var(--pos-text);">
                Loyalty Customer: <strong>${customer.name}</strong><br>
                Balance: <strong>${customer.points} Points</strong> (Value: ₹${customer.points})
                ${activeOrder ? `
                    <div style="margin-top: 0.5rem; display:flex; gap:0.4rem; align-items:center;">
                        <input type="number" id="pos-crm-redeem-input" class="stock-input" style="width: 80px;" min="1" max="${customer.points}" placeholder="Points">
                        <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="applyPOSLoyaltyRedeem('${phone}')">Redeem</button>
                    </div>
                ` : ''}
            </div>
        `;
        details.style.display = "block";
    } else {
        details.innerHTML = `
            <div style="color:var(--pos-text);">
                Number not registered in CRM Database.<br>
                <button class="btn-pos-secondary" style="margin-top:0.4rem; font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="registerPOSLoyalty('${phone}')">+ Register Guest</button>
            </div>
        `;
        details.style.display = "block";
    }
}

function registerPOSLoyalty(phone) {
    const newCustomer = CoreState.registerLoyaltyCustomer(phone, "POS Guest Customer");
    lookupPOSLoyalty();
    alert("New loyalty profile registered successfully!");
}

function applyPOSLoyaltyRedeem(phone) {
    const pts = parseInt(document.getElementById("pos-crm-redeem-input").value);
    const customer = CoreState.getLoyaltyCustomer(phone);
    const activeOrder = CoreState.getOrders().find(o => o.tableId === posSelectedTableId && o.status !== "completed");

    if (!customer || !activeOrder || isNaN(pts) || pts <= 0) return;

    if (pts > customer.points) {
        alert("Requested points redemption exceeds customer balance!");
        return;
    }

    // Attach to active order metadata and save!
    activeOrder.phone = phone;
    activeOrder.loyaltyDiscount = pts;
    
    // Recalculate subtotal minus cashier dynamic discount or others
    let subtotal = activeOrder.subtotal || 0;
    let couponDiscount = activeOrder.couponDiscount || 0;
    let net = Math.max(0, subtotal - couponDiscount - pts);
    let tax = (activeOrder.couponCode === "GSTFREE" || activeOrder.appliedCoupon === "GSTFREE") ? 0 : net * 0.05;
    activeOrder.tax = tax;
    activeOrder.total = net + tax;

    const orders = CoreState.getOrders();
    const idx = orders.findIndex(o => o.id === activeOrder.id);
    if (idx !== -1) {
        orders[idx] = activeOrder;
        CoreState.saveOrders(orders);
    }

    CoreState.logSecurityEvent(`Redeemed ₹${pts} from CRM points for Table ${posSelectedTableId} bill.`);
    lookupPOSLoyalty();
    renderActiveCheckoutTicket();
}

/* --- ONLINE DELIVERY AGGREGATOR DESK --- */
function renderOnlineOrdersDesk() {
    const container = document.getElementById("pos-online-aggregator-grid");
    if (!container) return;

    const orders = CoreState.getAggregatorOrders();

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon" style="font-size:3rem;">🟢</div>
                <p style="font-size:1rem; color:var(--pos-text-secondary);">No incoming delivery orders at this moment.</p>
                <span style="font-size:0.8rem; color:var(--status-free);">Listening for Zomato & Swiggy API dockets...</span>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => {
        const logoClass = order.aggregator.toLowerCase();
        
        return `
            <div class="aggregator-card">
                <div class="aggregator-card-header ${logoClass}">
                    <span style="font-size: 1.1rem; font-family:'Playfair Display', serif;">${order.aggregator} API</span>
                    <span class="aggregator-logo-badge">${order.id}</span>
                </div>
                <div class="aggregator-card-body">
                    <div>
                        <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; color:var(--pos-text);">${order.customer}</h4>
                        <span style="font-size:0.75rem; color:var(--pos-text-secondary);">Docket Received: ${new Date(order.timestamp).toLocaleTimeString()}</span>
                        
                        <div class="aggregator-items-list">
                            ${order.items.map(item => `
                                <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; font-weight:600; color:var(--pos-text);">
                                    <span>${item.qty}x ${item.name}</span>
                                    <span>₹${item.price.toFixed(2)}</span>
                                </div>
                                ${item.customizations && item.customizations.length > 0 ? `<p style="font-size:0.7rem; color:var(--pos-primary); margin-top:-0.15rem; margin-bottom:0.25rem;">+ ${item.customizations.join(", ")}</p>` : ''}
                            `).join("")}
                        </div>
                    </div>
                    
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:0.95rem; font-weight:700; border-top:1px dashed var(--pos-border); padding-top:0.6rem; margin-bottom:1rem; color:var(--pos-text);">
                            <span>Total (incl. 5% GST)</span>
                            <span>₹${order.total.toFixed(2)}</span>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn-pos-primary" style="flex:1.2; padding:0.6rem; font-size:0.8rem;" onclick="acceptOnlineOrder('${order.id}')">Accept Order</button>
                            <button class="btn-pos-secondary" style="flex:1; padding:0.6rem; font-size:0.8rem; border-color:var(--status-alert); color:var(--status-alert);" onclick="rejectOnlineOrder('${order.id}')">Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function acceptOnlineOrder(orderId) {
    const order = CoreState.acceptAggregatorOrder(orderId);
    if (order) {
        alert(`Aggregator Order ${orderId} accepted successfully! Transferred to KDS.`);
        refreshActiveDashboardView();
    }
}

function rejectOnlineOrder(orderId) {
    if (confirm(`Are you sure you want to reject Aggregator Docket ${orderId}?`)) {
        CoreState.rejectAggregatorOrder(orderId);
        refreshActiveDashboardView();
    }
}
