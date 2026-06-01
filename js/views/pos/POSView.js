/**
 * RestoFlow Merchant Admin POS View
 * Handles structural templates and DOM rendering of all POS terminal interfaces.
 */

export class POSView {
    constructor(model) {
        this.model = model;
    }

    updatePinDisplay(enteredPin) {
        const display = document.getElementById("pin-secure-display");
        if (display) {
            display.innerText = "•".repeat(enteredPin.length);
        }
    }

    showLoginGate(show) {
        const loginGate = document.getElementById("merchant-login-gate");
        const sidebar = document.getElementById("merchant-sidebar");
        const main = document.getElementById("merchant-main");
        const errorMsg = document.getElementById("login-error-msg");

        if (show) {
            if (loginGate) loginGate.style.display = "flex";
            if (sidebar) sidebar.style.display = "none";
            if (main) main.style.display = "none";
            if (errorMsg) errorMsg.style.display = "none";
        } else {
            if (loginGate) loginGate.style.display = "none";
            if (sidebar) sidebar.style.display = "flex";
            if (main) main.style.display = "flex";
        }
    }

    setStaffIndicator(name, role) {
        const staffName = document.getElementById("merchant-staff-name");
        const staffRole = document.getElementById("merchant-staff-role");
        if (staffName) staffName.innerText = name;
        if (staffRole) staffRole.innerText = role;
    }

    showLoginError(message) {
        const errorMsg = document.getElementById("login-error-msg");
        if (errorMsg) {
            errorMsg.innerText = message;
            errorMsg.style.display = "block";
        }
    }

    switchTab(tabId) {
        // Toggle active link highlights
        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.remove("active");
        });
        const activeLink = document.getElementById(`tab-nav-${tabId}`);
        if (activeLink) activeLink.classList.add("active");

        // Hide all view panels
        document.querySelectorAll(".pos-view-panel").forEach(panel => {
            panel.style.display = "none";
        });
        
        // Display current tab panel
        const currentPanel = document.getElementById(`view-pos-${tabId}`);
        if (currentPanel) currentPanel.style.display = "flex";
    }

    renderPOSFloorLayout(posSelectedTableId) {
        const tables = this.model.getTables();
        const container = document.getElementById("pos-tables-floor-grid");
        if (!container) return;

        container.innerHTML = tables.map(table => {
            let statusClass = "free";
            if (table.status === "Dining") statusClass = "dining";
            if (table.status === "Billing") statusClass = "billing";

            const isSelected = table.id === posSelectedTableId ? "selected" : "";

            // Check if there is an active order sum to display
            const activeOrder = this.model.getOrders().find(o => o.tableId === table.id && o.status !== "completed");
            
            let orderSummary = `${table.seats} Seats`;
            if (activeOrder) {
                const displayPrice = (typeof activeOrder.total === 'number') ? activeOrder.total : parseFloat(activeOrder.total || 0);
                orderSummary = isNaN(displayPrice) ? "₹0.00" : `₹${displayPrice.toFixed(2)}`;
            }

            return `
                <div class="table-node ${statusClass} ${isSelected}" onclick="posCtrl.selectPOSTable(${table.id})">
                    <div class="table-status-pill"></div>
                    <h4>${table.name}</h4>
                    <span>${orderSummary}</span>
                </div>
            `;
        }).join("");
    }

    renderActiveCheckoutTicket(posSelectedTableId, appliedDiscountPercent) {
        const desk = document.getElementById("terminal-active-ticket-desk");
        const actions = document.getElementById("terminal-action-buttons-desk");
        const addItemsBtn = document.getElementById("btn-terminal-add-items");
        const crmWidget = document.getElementById("terminal-crm-widget");
        const titleLabel = document.getElementById("terminal-selected-title");
        if (!desk) return;

        if (!posSelectedTableId) {
            desk.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No table selected. Click on a table layout block to print active billing ticket details.</p>
                </div>
            `;
            if (actions) actions.style.display = "none";
            if (crmWidget) crmWidget.style.display = "none";
            if (addItemsBtn) addItemsBtn.style.display = "none";
            if (titleLabel) titleLabel.innerText = "Receipt Terminal: Table --";
            return;
        }

        if (titleLabel) titleLabel.innerText = `Receipt Terminal: Table ${posSelectedTableId}`;

        const activeOrder = this.model.getOrders().find(o => o.tableId === posSelectedTableId && o.status !== "completed");

        if (!activeOrder) {
            desk.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <p>Table ${posSelectedTableId} is currently vacant.</p>
                    <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%; margin-top:1.25rem;">
                        <button class="btn-pos-secondary" onclick="posCtrl.createWalkInOrder()">Seat Standard Walk-In</button>
                        <button class="btn-pos-primary" onclick="posCtrl.openOrderModal()" style="font-size:0.85rem; padding:0.6rem;">+ Take Custom Order</button>
                    </div>
                </div>
            `;
            if (actions) actions.style.display = "none";
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

        if (actions) actions.style.display = "block";
    }

    renderPOSLoyaltyLookupResult(phone, customer, activeOrder) {
        const details = document.getElementById("pos-crm-status-details");
        if (!details) return;

        if (customer) {
            details.innerHTML = `
                <div style="color:var(--pos-text);">
                    Loyalty Customer: <strong>${customer.name}</strong><br>
                    Balance: <strong>${customer.points} Points</strong> (Value: ₹${customer.points})
                    ${activeOrder ? `
                        <div style="margin-top: 0.5rem; display:flex; gap:0.4rem; align-items:center;">
                            <input type="number" id="pos-crm-redeem-input" class="stock-input" style="width: 80px;" min="1" max="${customer.points}" placeholder="Points">
                            <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="posCtrl.applyPOSLoyaltyRedeem('${phone}')">Redeem</button>
                        </div>
                    ` : ''}
                </div>
            `;
            details.style.display = "block";
        } else {
            details.innerHTML = `
                <div style="color:var(--pos-text);">
                    Number not registered in CRM Database.<br>
                    <button class="btn-pos-secondary" style="margin-top:0.4rem; font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="posCtrl.registerPOSLoyalty('${phone}')">+ Register Guest</button>
                </div>
            `;
            details.style.display = "block";
        }
    }

    hidePOSLoyaltyDetails() {
        const details = document.getElementById("pos-crm-status-details");
        if (details) details.style.display = "none";
        const crmInput = document.getElementById("pos-crm-phone-input");
        if (crmInput) crmInput.value = "";
    }

    renderKDSKitchenMonitor() {
        const orders = this.model.getOrders().filter(o => o.status !== "completed");
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
                            <button class="kds-btn" style="background:var(--pos-primary); color:white;" onclick="posCtrl.updateKDSOrder('${order.id}', '${nextActionStatus}')">
                                ${nextActionLabel}
                            </button>
                        ` : `
                            <button class="kds-btn" style="background:#10b981; color:white;" onclick="posCtrl.updateKDSOrder('${order.id}', 'completed')">
                                Close Docket
                            </button>
                        `}
                        <button class="kds-btn" style="background:var(--pos-bg-alt); color:var(--pos-text-secondary);" onclick="posCtrl.cancelKDSOrder('${order.id}')">
                            Reject Order
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    renderInventoryManager() {
        const inv = this.model.getInventory();
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
                            <button class="btn-pos-secondary" style="padding: 0.35rem 0.75rem; font-size:0.8rem;" onclick="posCtrl.addStockItem('${key}')">Restock</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    renderOnlineOrdersDesk() {
        const container = document.getElementById("pos-online-aggregator-grid");
        if (!container) return;

        const orders = this.model.getAggregatorOrders();

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
                                <button class="btn-pos-primary" style="flex:1.2; padding:0.6rem; font-size:0.8rem;" onclick="posCtrl.acceptOnlineOrder('${order.id}')">Accept Order</button>
                                <button class="btn-pos-secondary" style="flex:1; padding:0.6rem; font-size:0.8rem; border-color:var(--status-alert); color:var(--status-alert);" onclick="posCtrl.rejectOnlineOrder('${order.id}')">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    renderAnalyticsReports() {
        const orders = this.model.getOrders();
        const feedback = this.model.getFeedback();
        const tables = this.model.getTables();
        const inv = this.model.getInventory();

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
        const salesLabel = document.getElementById("rep-today-sales");
        const tablesLabel = document.getElementById("rep-active-tables");
        const stockLabel = document.getElementById("rep-low-stocks");
        const satisfLabel = document.getElementById("rep-satisfaction");

        if (salesLabel) salesLabel.innerText = `₹${isNaN(grossToday) ? "0.00" : grossToday.toFixed(2)}`;
        if (tablesLabel) tablesLabel.innerText = `${activeTableCount} / 12`;
        if (stockLabel) stockLabel.innerText = warningStockCount;
        if (satisfLabel) satisfLabel.innerText = `${avgRating} ★`;

        // 2. SVG Hourly Chart Builder
        const chartDesk = document.getElementById("svg-hourly-sales-chart");
        if (chartDesk) {
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

        // 3. Category Share Pie Representation
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

    renderSecurityAccessConsole() {
        const logs = this.model.getSecurityLogs();
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

    // Modal Draft Ordering View Controls
    showOrderModal(posSelectedTableId, posOrderModalCategory, posDraftBasket) {
        const modal = document.getElementById("pos-order-modal");
        const modalTitle = document.getElementById("pos-order-modal-title");
        if (modalTitle) {
            modalTitle.innerText = `Take Order: Table ${posSelectedTableId}`;
        }

        this.renderPOSModalCategories(posOrderModalCategory);
        this.renderPOSModalMenuGrid(posOrderModalCategory);
        this.renderPOSDraftTicket(posDraftBasket);

        if (modal) modal.classList.add("open");
    }

    hideOrderModal() {
        const modal = document.getElementById("pos-order-modal");
        if (modal) modal.classList.remove("open");
    }

    renderPOSModalCategories(posOrderModalCategory) {
        const menu = this.model.getMenu();
        const categories = ["All", ...new Set(menu.map(item => item.category))];
        const container = document.getElementById("pos-modal-categories");
        if (!container) return;

        container.innerHTML = categories.map(cat => `
            <button class="category-pill ${cat === posOrderModalCategory ? 'active' : ''}" 
                    style="padding:0.4rem 1rem; font-size:0.8rem; border-radius:100px;"
                    onclick="posCtrl.setPOSModalCategory('${cat}')">
                ${cat}
            </button>
        `).join("");
    }

    renderPOSModalMenuGrid(posOrderModalCategory) {
        const menu = this.model.getMenu();
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
                        <button class="btn-pos-secondary" style="padding:0.35rem 0.65rem; font-size:0.75rem;" onclick="posCtrl.addPOSDraftItem('${item.id}')">+ Add</button>
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderPOSDraftTicket(posDraftBasket) {
        const list = document.getElementById("pos-modal-draft-list");
        const subtotalLabel = document.getElementById("pos-modal-subtotal");
        const totalLabel = document.getElementById("pos-modal-total");
        if (!list) return;

        if (posDraftBasket.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 2rem 0;">
                    <div class="empty-state-icon" style="font-size:2rem;">🛒</div>
                    <p style="font-size:0.85rem; color:var(--pos-text-secondary);">Your order draft is empty.</p>
                </div>
            `;
            if (subtotalLabel) subtotalLabel.innerText = "₹0.00";
            if (totalLabel) totalLabel.innerText = "₹0.00";
            return;
        }

        list.innerHTML = posDraftBasket.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding: 0.25rem 0; border-bottom:1px solid var(--pos-border);">
                <div>
                    <span style="font-weight:700; color:var(--pos-text);">${item.name}</span>
                    <p style="font-size:0.75rem; color:var(--pos-text-secondary);">₹${item.price.toFixed(2)} each</p>
                </div>
                <div style="display:flex; align-items:center; gap:0.6rem; background:var(--pos-bg-alt); padding:0.2rem 0.5rem; border-radius:4px; border:1px solid var(--pos-border);">
                    <button class="qty-btn" style="background:transparent; border:none; color:var(--pos-text); font-weight:700; cursor:pointer;" onclick="posCtrl.adjustPOSDraftQty(${idx}, -1)">-</button>
                    <span style="font-weight:700; color:var(--pos-text); font-size:0.85rem;">${item.qty}</span>
                    <button class="qty-btn" style="background:transparent; border:none; color:var(--pos-text); font-weight:700; cursor:pointer;" onclick="posCtrl.adjustPOSDraftQty(${idx}, 1)">+</button>
                </div>
            </div>
        `).join("");

        // Calculate totals
        let subtotal = 0;
        posDraftBasket.forEach(i => subtotal += (i.price * i.qty));
        const total = subtotal * 1.05; // 5% GST

        if (subtotalLabel) subtotalLabel.innerText = `₹${subtotal.toFixed(2)}`;
        if (totalLabel) totalLabel.innerText = `₹${total.toFixed(2)}`;
    }
}
