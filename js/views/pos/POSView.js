/**
 * RestoFlow Merchant Admin POS View
 * Handles structural templates and DOM rendering of all POS terminal interfaces.
 */

export class POSView {
    constructor(model) {
        this.model = model;
    }

    showToast(message, type = 'success') {
        let toastContainer = document.getElementById("toast-container");
        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = "toast-container";
            toastContainer.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 100005;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        toast.style.cssText = `
            min-width: 300px;
            max-width: 450px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background: rgba(30, 27, 46, 0.95);
            border: 1px solid var(--pos-border);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: var(--pos-text);
            font-family: inherit;
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(100px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: auto;
        `;

        let icon = "✅";
        if (type === "warning") {
            icon = "⚠️";
            toast.style.borderLeft = "4px solid #f59e0b";
        } else if (type === "error" || type === "danger") {
            icon = "❌";
            toast.style.borderLeft = "4px solid #ef4444";
        } else {
            toast.style.borderLeft = "4px solid #b02a5b"; // Match the pos primary theme
        }

        toast.innerHTML = `
            <span style="font-size: 1.2rem;">${icon}</span>
            <div style="flex: 1; line-height: 1.4;">${message}</div>
            <button style="background: transparent; border: none; color: var(--pos-text-secondary); cursor: pointer; font-size: 1.1rem; padding: 0; display: inline-flex; align-items: center; justify-content: center; height: 18px; width: 18px;" onclick="this.parentElement.remove()">&times;</button>
        `;

        toastContainer.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.style.transform = "translateX(0)";
            toast.style.opacity = "1";
        }, 50);

        // Auto remove
        setTimeout(() => {
            toast.style.transform = "translateX(100px)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }, 4000);
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

    renderLoginProfiles(staffList) {
        const select = document.getElementById("login-username-select");
        if (!select) return;
        select.innerHTML = staffList
            .filter(emp => emp.status === "Active")
            .map(emp => `<option value="${emp.username}">${emp.name} (${emp.role})</option>`)
            .join("");
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
                        <div class="receipt-row" style="display:flex; align-items:center; justify-content:space-between;">
                            <div style="display:flex; align-items:center; gap:0.5rem;">
                                <button class="btn-delete-receipt-item" onclick="posCtrl.deleteReceiptItem('${activeOrder.id}', '${item.id}')" style="background:transparent; border:none; color:var(--status-alert); cursor:pointer; font-size:0.95rem; padding:0.15rem 0.35rem; display:flex; align-items:center; justify-content:center; border-radius:4px; transition:var(--transition-pos);" title="Delete Item">❌</button>
                                <span>${item.qty}x ${item.name}</span>
                            </div>
                            <span>₹${displayPrice}</span>
                        </div>
                        ${item.customizations && item.customizations.length > 0 ? `<p style="font-size:0.75rem; color:var(--pos-primary); margin-top:-0.25rem; margin-bottom:0.3rem; padding-left:1.75rem;">+ ${item.customizations.join(", ")}</p>` : ''}
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
        const allOrders = this.model.getOrders();
        // Retrieve dockets currently in active cooking phases (pending, cooking, ready)
        const activeOrders = allOrders.filter(o => o.status === "pending" || o.status === "cooking" || o.status === "ready");
        const board = document.getElementById("pos-kds-board-grid");
        if (!board) return;

        const newOrders = activeOrders.filter(o => o.status === "pending" || !o.status);
        const cookingOrders = activeOrders.filter(o => o.status === "cooking");
        const readyOrders = activeOrders.filter(o => o.status === "ready");

        // Format current digital clock time
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const activeCount = activeOrders.length;

        // Apply dark layout to the KDS View Panel
        const panel = document.getElementById("view-pos-kds");
        if (panel) {
            panel.style.background = "#09090b";
            panel.style.color = "#ffffff";
            panel.style.padding = "1.5rem 2rem 2rem 2rem";
            
            // Inject or update premium KDS header
            let kdsHeader = panel.querySelector(".kds-custom-header");
            if (!kdsHeader) {
                kdsHeader = document.createElement("div");
                kdsHeader.className = "kds-custom-header";
                kdsHeader.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    border-bottom: 1px solid #1f1f23;
                    padding-bottom: 1rem;
                `;
                panel.insertBefore(kdsHeader, board);
            }
            kdsHeader.innerHTML = `
                <h2 style="font-family:'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; color: #ffffff; margin: 0;">Kitchen Display</h2>
                <div style="display: flex; gap: 1.5rem; color: #71717a; font-size: 0.95rem; font-weight: 600; align-items: center;">
                    <span>${activeCount} active</span>
                    <span>•</span>
                    <span>${timeStr}</span>
                </div>
            `;
            
            // Hide the old default light-theme title
            const oldTitle = panel.querySelector(".dashboard-grid-title");
            if (oldTitle) oldTitle.style.display = "none";
        }

        // Apply 3-column layouts inside board grid
        board.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1.5rem;
            background: #09090b;
            min-height: calc(100vh - 12rem);
            align-items: start;
        `;

        board.innerHTML = `
            <!-- Column 1: New Orders -->
            <div class="kds-column" style="background: #09090b; display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 2px solid #e28a2b; margin-bottom: 0.5rem;">
                    <span style="background: rgba(226, 138, 43, 0.15); color: #e28a2b; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(226, 138, 43, 0.25);">New Orders</span>
                    <span style="color: #71717a; font-weight: 700; font-size: 0.9rem; background: #18181b; padding: 0.15rem 0.4rem; border-radius: 4px;">${newOrders.length}</span>
                </div>
                <div class="kds-cards-list" style="display: flex; flex-direction: column; gap: 1rem; max-height: calc(100vh - 17rem); overflow-y: auto; padding-right: 0.25rem;">
                    ${newOrders.length === 0 ? `
                        <div style="padding: 4rem 1rem; text-align: center; color: #3f3f46; font-size: 0.9rem; font-weight: 500; font-style: italic;">
                            No new dockets
                        </div>
                    ` : newOrders.map(order => this.renderKDSSingleCard(order, "Start Cooking", "cooking")).join("")}
                </div>
            </div>

            <!-- Column 2: In Kitchen -->
            <div class="kds-column" style="background: #09090b; display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 2px solid #2563eb; margin-bottom: 0.5rem;">
                    <span style="background: rgba(37, 99, 235, 0.15); color: #3b82f6; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(37, 99, 235, 0.25);">In Kitchen</span>
                    <span style="color: #71717a; font-weight: 700; font-size: 0.9rem; background: #18181b; padding: 0.15rem 0.4rem; border-radius: 4px;">${cookingOrders.length}</span>
                </div>
                <div class="kds-cards-list" style="display: flex; flex-direction: column; gap: 1rem; max-height: calc(100vh - 17rem); overflow-y: auto; padding-right: 0.25rem;">
                    ${cookingOrders.length === 0 ? `
                        <div style="padding: 4rem 1rem; text-align: center; color: #3f3f46; font-size: 0.9rem; font-weight: 500; font-style: italic;">
                            No active cooking
                        </div>
                    ` : cookingOrders.map(order => this.renderKDSSingleCard(order, "Mark Ready", "ready")).join("")}
                </div>
            </div>

            <!-- Column 3: Ready to Serve -->
            <div class="kds-column" style="background: #09090b; display: flex; flex-direction: column; gap: 1rem; height: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 2px solid #10b981; margin-bottom: 0.5rem;">
                    <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(16, 185, 129, 0.25);">Ready to Serve</span>
                    <span style="color: #71717a; font-weight: 700; font-size: 0.9rem; background: #18181b; padding: 0.15rem 0.4rem; border-radius: 4px;">${readyOrders.length}</span>
                </div>
                <div class="kds-cards-list" style="display: flex; flex-direction: column; gap: 1rem; max-height: calc(100vh - 17rem); overflow-y: auto; padding-right: 0.25rem;">
                    ${readyOrders.length === 0 ? `
                        <div style="padding: 4rem 1rem; text-align: center; color: #3f3f46; font-size: 0.9rem; font-weight: 500; font-style: italic;">
                            No pending service
                        </div>
                    ` : readyOrders.map(order => this.renderKDSSingleCard(order, "✓ Served & Dismiss", "served")).join("")}
                </div>
            </div>
        `;
    }

    renderKDSSingleCard(order, buttonText, nextStatus) {
        const elapsedMs = new Date() - new Date(order.timestamp);
        const elapsedMins = Math.max(0, Math.floor(elapsedMs / 60000));
        
        // Critical alerts for dishes waiting over 15 minutes
        const isOverdue = elapsedMins >= 15;
        const timeColor = isOverdue ? "#ef4444" : "#71717a";
        const borderColor = isOverdue ? "#881337" : "#27272a"; // Red alert vs dark border
        const timeIcon = isOverdue ? "⏳" : "🕒";

        // Display short ID (4-digit format)
        const shortId = order.id ? order.id.slice(-4) : "0000";
        // Table indicator e.g. T2 or Takeaway
        const tableLabel = order.tableId ? `T${order.tableId}` : "Takeaway";

        // Generate dish item tags and gold customizations list
        const itemsHtml = (order.items || []).map(item => {
            let html = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.95rem;">
                    <span style="color: #ffffff;">${item.qty}x ${item.name}</span>
                </div>
            `;
            if (item.customizations && item.customizations.length > 0) {
                item.customizations.forEach(cust => {
                    html += `
                        <div style="font-size: 0.75rem; color: #d97706; font-weight: 700; margin-left: 1.25rem; margin-top: -0.2rem; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.3rem;">
                            <span style="color: #f59e0b;">⚠️</span>
                            <span>${cust}</span>
                        </div>
                    `;
                });
            }
            return html;
        }).join("");

        // Build premium full-width action buttons
        let btnStyle = `
            width: 100%;
            padding: 0.7rem;
            background: #27272a;
            border: 1px solid #3f3f46;
            color: #ffffff;
            font-weight: 600;
            font-size: 0.85rem;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            margin-top: 0.4rem;
        `;
        let btnHoverStyle = `this.style.background='#3f3f46'; this.style.borderColor='#52525b';`;
        let btnLeaveStyle = `this.style.background='#27272a'; this.style.borderColor='#3f3f46';`;

        if (nextStatus === "served") {
            btnStyle = `
                width: 100%;
                padding: 0.7rem;
                background: rgba(16, 185, 129, 0.08);
                border: 1px solid rgba(16, 185, 129, 0.25);
                color: #10b981;
                font-weight: 700;
                font-size: 0.85rem;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
                margin-top: 0.4rem;
            `;
            btnHoverStyle = `this.style.background='rgba(16, 185, 129, 0.16)'; this.style.borderColor='rgba(16, 185, 129, 0.4)';`;
            btnLeaveStyle = `this.style.background='rgba(16, 185, 129, 0.08)'; this.style.borderColor='rgba(16, 185, 129, 0.25)';`;
        }

        return `
            <div class="kds-card" style="background: #18181b; border: 1px solid ${borderColor}; border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <!-- Header: Order ID, Table, Timer -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">#${shortId}</span>
                        <span style="background: #27272a; color: #a1a1aa; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${tableLabel}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.35rem; color: ${timeColor}; font-size: 0.8rem; font-weight: 700;">
                        <span>${timeIcon}</span>
                        <span>${elapsedMins}m</span>
                    </div>
                </div>
                
                <!-- Items list -->
                <div style="flex: 1; min-height: 40px;">
                    ${itemsHtml}
                </div>
                
                <!-- Action Button -->
                <button style="${btnStyle}" 
                        onmouseover="${btnHoverStyle}" 
                        onmouseout="${btnLeaveStyle}"
                        onclick="posCtrl.updateKDSOrder('${order.id}', '${nextStatus}')">
                    ${buttonText}
                </button>
            </div>
        `;
    }

    renderInventoryManager(searchQuery = "", categoryFilter = "All", statusFilter = "All") {
        const panel = document.getElementById("view-pos-inventory");
        if (!panel) return;

        const inv = this.model.getInventory();
        let items = Object.entries(inv).map(([key, item]) => ({ key, ...item }));

        // Apply filters
        if (searchQuery) {
            items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (categoryFilter !== "All") {
            items = items.filter(item => item.category === categoryFilter);
        }
        if (statusFilter !== "All") {
            items = items.filter(item => {
                const stockPct = (item.qty / item.max) * 100;
                if (statusFilter === "in_stock") return stockPct > 20 && item.qty > 0;
                if (statusFilter === "low_stock") return stockPct <= 20 && item.qty > 0;
                if (statusFilter === "out_of_stock") return item.qty <= 0;
                return true;
            });
        }

        const categories = ["All", ...new Set(Object.values(inv).map(item => item.category).filter(Boolean))];
        const statusOptions = [
            { value: "All", label: "All Statuses" },
            { value: "in_stock", label: "In Stock" },
            { value: "low_stock", label: "Low Stock" },
            { value: "out_of_stock", label: "Out of Stock" }
        ];

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Inventory Management</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Track live kitchen recipe ingredient stock capacities, unit costs, and suppliers.</p>
                </div>
                <button class="btn-pos-primary" onclick="posCtrl.addInventoryItemPrompt()">+ Add Item</button>
            </div>

            <!-- Control Filter Header -->
            <div style="display:flex; gap:1rem; margin-bottom:1.5rem; align-items:center; background:rgba(0,0,0,0.1); padding:1rem; border-radius:8px; border:1px solid var(--pos-border); width:100%;">
                <input type="text" id="inv-search-box" class="stock-input" style="flex:1.5; text-align:left;" placeholder="Search inventory items by name, supplier..." value="${searchQuery}" oninput="posCtrl.handleInventorySearch(this.value)">
                
                <div style="display:flex; gap:0.5rem; align-items:center; flex:1;">
                    <label style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">CATEGORY</label>
                    <select class="stock-input" style="flex:1;" onchange="posCtrl.handleInventoryFilter('category', this.value)">
                        ${categories.map(cat => `<option value="${cat}" ${cat === categoryFilter ? 'selected' : ''}>${cat}</option>`).join("")}
                    </select>
                </div>

                <div style="display:flex; gap:0.5rem; align-items:center; flex:1;">
                    <label style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">STOCK STATUS</label>
                    <select class="stock-input" style="flex:1;" onchange="posCtrl.handleInventoryFilter('status', this.value)">
                        ${statusOptions.map(opt => `<option value="${opt.value}" ${opt.value === statusFilter ? 'selected' : ''}>${opt.label}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div class="pos-table-card" style="width:100%;">
                <table class="pos-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Stock Level</th>
                            <th>Current Stock</th>
                            <th>Unit</th>
                            <th>Cost</th>
                            <th>Supplier</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => {
                            const pct = Math.min(100, Math.max(0, (item.qty / item.max) * 100));
                            
                            let statusText = "In Stock";
                            let statusClass = "in-stock";
                            
                            if (item.qty <= 0) {
                                statusText = "Out of Stock";
                                statusClass = "out-of-stock";
                            } else if (pct <= 20) {
                                statusText = "Low Stock";
                                statusClass = "low-stock";
                            }

                            // Dynamic Progress Bar Color matching standard elegant modes
                            let barColor = "#10b981"; // green
                            if (statusText === "Low Stock") barColor = "#f59e0b"; // amber
                            if (statusText === "Out of Stock") barColor = "#ef4444"; // red

                            return `
                                <tr>
                                    <td style="font-weight:700; color:var(--pos-text);">${item.name}</td>
                                    <td>${item.category || "Ingredients"}</td>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:0.85rem;">
                                            <div style="width:70px; height:6px; background:var(--pos-bg-alt); border-radius:100px; overflow:hidden;">
                                                <div style="width:${pct}%; height:100%; background:${barColor}; border-radius:100px;"></div>
                                            </div>
                                            <span class="status-tag ${statusClass}" style="font-size:0.7rem; padding:0.2rem 0.5rem;">${statusText}</span>
                                        </div>
                                    </td>
                                    <td style="font-weight:600; color:var(--pos-text);">${item.qty.toFixed(0)} / ${item.max.toFixed(0)}</td>
                                    <td>${item.unit}</td>
                                    <td style="font-weight:700; color:var(--pos-text);">₹${item.cost || 50}</td>
                                    <td>${item.supplier || "Standard Supply"}</td>
                                    <td style="font-size:0.8rem; color:var(--pos-text-secondary);">${item.lastUpdated || "2026-05-30"}</td>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:0.4rem;">
                                            <input type="number" id="restock-input-${item.key}" class="stock-input" style="width:50px; padding:0.25rem 0.4rem; font-size:0.8rem; text-align:center;" value="10">
                                            <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; font-weight:700;" onclick="posCtrl.addStockItem('${item.key}')">+</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderEmployeeManager(searchQuery = "", roleFilter = "All", statusFilter = "All", branchFilter = "All") {
        const panel = document.getElementById("view-pos-employees");
        if (!panel) return;

        const staffList = JSON.parse(localStorage.getItem("restoflow_staff")) || [];
        let employees = staffList;

        // Apply filters
        if (searchQuery) {
            employees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.contact.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (roleFilter !== "All") {
            employees = employees.filter(emp => emp.role === roleFilter);
        }
        if (statusFilter !== "All") {
            employees = employees.filter(emp => emp.status === statusFilter);
        }
        if (branchFilter !== "All") {
            employees = employees.filter(emp => emp.branch === branchFilter);
        }

        const roles = ["All", ...new Set(staffList.map(emp => emp.role).filter(Boolean))];
        const branches = ["All", ...new Set(staffList.map(emp => emp.branch).filter(Boolean))];
        const statuses = ["All", "Active", "Inactive"];

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Employee Management</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Configure staff secure access PINs, restaurant roles, and active branch alignments.</p>
                </div>
                <button class="btn-pos-primary" onclick="posCtrl.addEmployeePrompt()">+ Add Employee</button>
            </div>

            <!-- Control Filter Header -->
            <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem; align-items:center; background:rgba(0,0,0,0.1); padding:1rem; border-radius:8px; border:1px solid var(--pos-border); width:100%;">
                <input type="text" id="emp-search-box" class="stock-input" style="flex:1.5; text-align:left;" placeholder="Search employees by name, ID, contact..." value="${searchQuery}" oninput="posCtrl.handleEmployeeSearch(this.value)">
                
                <div style="display:flex; gap:0.4rem; align-items:center; flex:1;">
                    <label style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">ROLE</label>
                    <select class="stock-input" style="flex:1;" onchange="posCtrl.handleEmployeeFilter('role', this.value)">
                        ${roles.map(r => `<option value="${r}" ${r === roleFilter ? 'selected' : ''}>${r}</option>`).join("")}
                    </select>
                </div>

                <div style="display:flex; gap:0.4rem; align-items:center; flex:1;">
                    <label style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">BRANCH</label>
                    <select class="stock-input" style="flex:1;" onchange="posCtrl.handleEmployeeFilter('branch', this.value)">
                        ${branches.map(b => `<option value="${b}" ${b === branchFilter ? 'selected' : ''}>${b}</option>`).join("")}
                    </select>
                </div>

                <div style="display:flex; gap:0.4rem; align-items:center; flex:1;">
                    <label style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">STATUS</label>
                    <select class="stock-input" style="flex:1;" onchange="posCtrl.handleEmployeeFilter('status', this.value)">
                        ${statuses.map(s => `<option value="${s}" ${s === statusFilter ? 'selected' : ''}>${s}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div class="pos-table-card" style="width:100%;">
                <table class="pos-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Branch</th>
                            <th>Contact</th>
                            <th>Join Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map((emp, idx) => {
                            const empId = `EMP-${1001 + idx}`;
                            const isStatusActive = emp.status === "Active";
                            const statusTagClass = isStatusActive ? "in-stock" : "low-stock"; // green pill vs orange

                            return `
                                <tr>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:0.75rem;">
                                            <div style="width:32px; height:32px; border-radius:50%; background:var(--pos-primary); color:white; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:0.85rem;">
                                                ${emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style="font-weight:700; color:var(--pos-text);">${emp.name}</div>
                                                <span style="font-size:0.7rem; color:var(--pos-text-secondary);">${empId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="font-weight:600; color:var(--pos-text);">${emp.role}</td>
                                    <td>${emp.branch}</td>
                                    <td style="font-size:0.8rem;">${emp.contact}</td>
                                    <td>${emp.joinDate || "2021-03-15"}</td>
                                    <td>
                                        <span class="status-tag ${statusTagClass}" style="font-size:0.7rem; padding:0.2rem 0.5rem; text-transform:uppercase;">
                                            ${emp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="posCtrl.showEmployeePin('${emp.name}', '${emp.pin}')">🔑 PIN</button>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderOnlineOrdersDesk() {
        const container = document.getElementById("pos-online-aggregator-grid");
        const panel = document.getElementById("view-pos-online");
        if (!container || !panel) return;

        const orders = this.model.getAggregatorOrders();
        
        // Check if there is an active incoming order that hasn't been accepted yet
        const hasIncomingBiriyani = orders.some(o => o.id === "SWI-8831" && o.status === "incoming");

        // Clear the panel shell so we can rebuild it with Mockup 1's exact structure
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Online Ordering System</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Accept online aggregator orders, manage active food channels, and track cooking statuses across screens.</p>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <span class="status-tag in-stock" style="padding:0.35rem 0.75rem; font-size:0.75rem; font-weight:700; display:flex; align-items:center; gap:0.35rem;">
                        <span class="pulse-dot" style="margin-right:0;"></span> Live Gateway Link
                    </span>
                </div>
            </div>

            <!-- Image 1's "Order Received" dialog box (Center Banner) -->
            ${hasIncomingBiriyani ? `
            <div class="chart-box" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:1.5rem; box-shadow:0 10px 25px rgba(0,0,0,0.05); position:relative; overflow:hidden; border-left:4px solid var(--pos-primary);">
                <div style="display:flex; align-items:center; gap:1.25rem;">
                    <!-- Ringing alert bell icon -->
                    <div style="width:48px; height:48px; border-radius:50%; background:rgba(37, 99, 235, 0.08); display:flex; align-items:center; justify-content:center; position:relative;">
                        <span style="font-size:1.5rem; animation: bell-bounce 1s infinite alternate;">🔔</span>
                        <span style="position:absolute; top:2px; right:2px; width:10px; height:10px; background:#ef4444; border-radius:50%; border:2px solid white;"></span>
                    </div>
                    <div>
                        <h4 style="color:#10b981; font-weight:800; font-size:1.1rem; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.35rem;">
                            Order Received
                        </h4>
                        <div style="font-weight:700; color:var(--pos-text); font-size:1rem; margin-bottom:0.1rem;">1 x Chicken Biriyani</div>
                        <span style="font-size:0.75rem; color:var(--pos-text-secondary); font-weight:600;">Order ID: 619001662041758</span>
                    </div>
                </div>
                <div style="display:flex; gap:0.75rem; align-items:center; z-index:1;">
                    <!-- Solid Accept Button - burgundy red style from Petpooja/EaseMyRestro image -->
                    <button class="btn-pos-primary" style="background:#b02a5b; color:white; border:none; padding:0.65rem 1.75rem; font-weight:700; font-size:0.85rem;" onclick="posCtrl.acceptOnlineOrder('SWI-8831')">
                        Accept
                    </button>
                    <!-- White Out of stock Button -->
                    <button class="btn-pos-secondary" style="background:#ffffff; color:var(--pos-text); border:1px solid #cbd5e1; padding:0.65rem 1.25rem; font-weight:700; font-size:0.85rem;" onclick="posCtrl.rejectOnlineOrder('SWI-8831')">
                        Mark out of stock
                    </button>
                </div>
            </div>
            ` : ''}

            <!-- KOT View Container -->
            <div class="chart-box" style="width:100%; text-align:left; background:var(--pos-bg-card); padding:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--pos-border); padding-bottom:1rem; margin-bottom:1.5rem;">
                    <h3 style="font-size:1.15rem; font-weight:800; color:var(--pos-text); display:flex; align-items:center; gap:0.4rem;">
                        KOT View
                    </h3>
                    <button class="btn-pos-secondary" style="padding:0.4rem 0.85rem; font-size:0.75rem; background:var(--pos-bg-alt); font-weight:700;">Delivery Status</button>
                </div>

                <!-- Aggregators grid layout -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1.5rem;" id="pos-online-aggregator-grid">
                    <!-- Cards will be populated below by model data or seeded list -->
                    ${orders.map(order => {
                        let badgeClass = "";
                        let statusText = "";
                        let actionHtml = "";
                        
                        if (order.status === "incoming") {
                            badgeClass = "low-stock"; // Amber / Orange pill
                            statusText = "Order Received";
                            actionHtml = `
                                <button class="btn-pos-primary" style="width:100%; padding:0.6rem; font-size:0.8rem; font-weight:700;" onclick="posCtrl.acceptOnlineOrder('${order.id}')">
                                    Accept Order
                                </button>
                            `;
                        } else if (order.status === "cooking") {
                            badgeClass = "in-stock"; // Green pill
                            statusText = "Mark food ready";
                            actionHtml = `
                                <button class="btn-pos-primary" style="width:100%; background:#10b981; border-color:#10b981; color:white; padding:0.6rem; font-size:0.8rem; font-weight:700;" onclick="posCtrl.dispatchOnlineOrder('${order.id}')">
                                    Mark food ready
                                </button>
                            `;
                        } else if (order.status === "served") {
                            badgeClass = "low-stock"; // Orange status badge
                            statusText = "Dispatched";
                            actionHtml = `
                                <div style="width:100%; text-align:center; padding:0.5rem; background:#fef3c7; color:#d97706; border-radius:6px; font-weight:700; font-size:0.8rem;">
                                    Dispatched
                                </div>
                            `;
                        } else {
                            badgeClass = "in-stock";
                            statusText = "Delivered";
                            actionHtml = `
                                <div style="width:100%; text-align:center; padding:0.5rem; background:#e2e8f0; color:#475569; border-radius:6px; font-weight:700; font-size:0.8rem;">
                                    Delivered
                                </div>
                            `;
                        }

                        // Customize background branding color to match Image 1 mockup
                        let brandBg = "rgba(37,99,235,0.04)";
                        let brandColor = "var(--pos-primary)";
                        let brandName = order.aggregator;
                        if (order.aggregator.toLowerCase() === "swiggy") {
                            brandBg = "#ffedd5"; // Swiggy Orange
                            brandColor = "#ea580c";
                        } else if (order.aggregator.toLowerCase() === "zomato") {
                            brandBg = "#ffe4e6"; // Zomato Red
                            brandColor = "#e11d48";
                        } else if (order.aggregator.toLowerCase() === "talabat") {
                            brandBg = "#fff7ed"; // Talabat Light Orange
                            brandColor = "#f97316";
                        }

                        return `
                            <div class="chart-box" style="padding:0; overflow:hidden; border:1px solid var(--pos-border); border-radius:10px; display:flex; flex-direction:column; justify-content:space-between; height: 260px; box-shadow:0 4px 12px rgba(0,0,0,0.015);">
                                <div style="background:${brandBg}; padding:0.85rem 1rem; border-bottom:1px dashed var(--pos-border); display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-weight:800; color:${brandColor}; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.02em;">${brandName}</span>
                                    <span style="font-size:0.7rem; color:var(--pos-text-secondary); font-weight:600;">ID: ${order.id}</span>
                                </div>
                                
                                <div style="padding:1rem; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div style="font-size:0.85rem; color:var(--pos-text-secondary);">
                                        <div style="font-weight:700; color:var(--pos-text); font-size:0.9rem; margin-bottom:0.5rem;">${order.customer.split(" (")[0]}</div>
                                        <div style="display:flex; flex-direction:column; gap:0.35rem; max-height:80px; overflow-y:auto; padding-right:0.25rem;">
                                            ${order.items.map(item => `
                                                <div style="display:flex; justify-content:space-between; font-weight:600; color:var(--pos-text);">
                                                    <span>${item.qty} x ${item.name}</span>
                                                </div>
                                            `).join("")}
                                        </div>
                                    </div>
                                    
                                    <div style="margin-top:0.75rem;">
                                        ${actionHtml}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    renderAnalyticsReports() {
        const panel = document.getElementById("view-pos-reports");
        if (!panel) return;

        let grossSales = 45231;
        let totalOrders = 512;
        let avgOrderVal = 883;
        let foodCostPct = 28.5;

        // Image 2's Real-time reports layout
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Real-time restaurant Reports</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Automated day-end restaurant performance charts, online aggregator sales logs, and cost analyses.</p>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <!-- Filter selectors matching Mockup 2 -->
                    <div style="display:flex; gap:0.4rem; align-items:center;">
                        <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">Outlet:</span>
                        <select class="stock-input" style="padding:0.35rem; font-size:0.75rem; border-radius:6px; font-weight:600; text-align:left;">
                            <option>Main Branch</option>
                            <option>Downtown Branch</option>
                            <option>Uptown Branch</option>
                        </select>
                    </div>
                    <button class="btn-pos-secondary" style="padding:0.4rem 0.85rem; font-size:0.75rem; font-weight:700;" onclick="window.print()">🖨 Export PDF</button>
                </div>
            </div>

            <!-- Statistical Metrics KPI Row -->
            <div class="metrics-row" style="width:100%; margin-bottom:1.5rem;">
                <div class="metric-card">
                    <h5>Total Revenue</h5>
                    <div class="metric-number">₹${grossSales.toLocaleString()}</div>
                    <span style="color:#10b981; font-size:0.8rem; font-weight:700;">↑ +20.1% vs last month</span>
                </div>
                <div class="metric-card">
                    <h5>Total Orders</h5>
                    <div class="metric-number">${totalOrders}</div>
                    <span style="color:#10b981; font-size:0.8rem; font-weight:700;">↑ +12.2% vs last month</span>
                </div>
                <div class="metric-card">
                    <h5>Average Order Value</h5>
                    <div class="metric-number">₹${avgOrderVal}</div>
                    <span style="color:#10b981; font-size:0.8rem; font-weight:700;">↑ +7.1% vs last month</span>
                </div>
                <div class="metric-card">
                    <h5>Food Cost Ratio</h5>
                    <div class="metric-number" style="color:var(--pos-primary);">${foodCostPct}%</div>
                    <span style="color:#10b981; font-size:0.8rem; font-weight:700;">↓ -2.3% vs last month</span>
                </div>
            </div>

            <!-- Charts Row (Image 2 high-fidelity replica) -->
            <div class="charts-row" style="width:100%; display:grid; grid-template-columns: 1.4fr 1fr; gap:1.5rem;">
                <!-- Time slot wise sales Bifurcation Chart (Breakfast, Lunch, Dinner bars + Spline overlay) -->
                <div class="chart-box" style="height:380px; display:flex; flex-direction:column; justify-content:space-between; text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <div>
                            <h4 style="font-family:'Inter', sans-serif; font-weight:800; font-size:1.05rem; color:var(--pos-text);">Time slot wise sales Bifurcation</h4>
                            <span style="font-size:0.75rem; color:var(--pos-text-secondary); font-weight:600;">Daily distribution across meal timeframes</span>
                        </div>
                        <div style="display:flex; gap:0.85rem; font-size:0.75rem; font-weight:700; align-items:center;">
                            <div style="display:flex; align-items:center; gap:0.35rem;"><span style="display:inline-block; width:10px; height:10px; background:#818cf8; border-radius:2px;"></span>Order Value</div>
                            <div style="display:flex; align-items:center; gap:0.35rem;"><span style="display:inline-block; width:10px; height:10px; background:#c7d2fe; border-radius:2px;"></span>Order Count</div>
                        </div>
                    </div>
                    
                    <div style="flex:1; display:flex; align-items:flex-end; justify-content:space-around; padding:1.5rem 1rem 0; border-bottom:1px solid var(--pos-border); position:relative;">
                        <!-- SVG Spline Overlay on top of bars -->
                        <svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:visible;">
                            <path d="M 90 140 Q 230 40 370 65 T 510 180" fill="none" stroke="#2563eb" stroke-width="3" />
                            <circle cx="90" cy="140" r="4.5" fill="#2563eb" stroke="white" stroke-width="2" />
                            <circle cx="230" cy="60" r="4.5" fill="#2563eb" stroke="white" stroke-width="2" />
                            <circle cx="370" cy="72" r="4.5" fill="#2563eb" stroke="white" stroke-width="2" />
                        </svg>

                        <!-- Breakfast Column -->
                        <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; flex:1;">
                            <div style="display:flex; align-items:flex-end; gap:0.3rem; height:180px;">
                                <div style="width:24px; height:80px; background:#c7d2fe; border-radius:4px 4px 0 0;" title="Order Count"></div>
                                <div style="width:24px; height:110px; background:#818cf8; border-radius:4px 4px 0 0;" title="Order Value"></div>
                            </div>
                            <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">Breakfast</span>
                        </div>

                        <!-- Lunch Column -->
                        <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; flex:1;">
                            <div style="display:flex; align-items:flex-end; gap:0.3rem; height:180px;">
                                <div style="width:24px; height:130px; background:#c7d2fe; border-radius:4px 4px 0 0;" title="Order Count"></div>
                                <div style="width:24px; height:160px; background:#818cf8; border-radius:4px 4px 0 0;" title="Order Value"></div>
                            </div>
                            <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">Lunch</span>
                        </div>

                        <!-- Dinner Column -->
                        <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; flex:1;">
                            <div style="display:flex; align-items:flex-end; gap:0.3rem; height:180px;">
                                <div style="width:24px; height:70px; background:#c7d2fe; border-radius:4px 4px 0 0;" title="Order Count"></div>
                                <div style="width:24px; height:90px; background:#818cf8; border-radius:4px 4px 0 0;" title="Order Value"></div>
                            </div>
                            <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">Dinner</span>
                        </div>
                    </div>
                </div>

                <!-- Beautiful Donut Chart representing channels distribution (Mockup 2) -->
                <div class="chart-box" style="height:380px; display:flex; flex-direction:column; justify-content:space-between; text-align:left;">
                    <div>
                        <h4 style="font-family:'Inter', sans-serif; font-weight:800; font-size:1.05rem; color:var(--pos-text);">Order Distribution</h4>
                        <span style="font-size:0.75rem; color:var(--pos-text-secondary); font-weight:600;">Dine-in accounts for 76.6% of traffic</span>
                    </div>

                    <div style="display:flex; align-items:center; justify-content:center; position:relative; height:160px; margin-top:0.5rem;">
                        <svg width="140" height="140" viewBox="0 0 42 42" class="donut">
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" stroke-width="4.5"></circle>
                            <!-- Dine-in (red-burgundy): 76.6% -->
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#b02a5b" stroke-width="4.5" stroke-dasharray="76.6 23.4" stroke-dashoffset="25"></circle>
                            <!-- Take Away (gold): 10% -->
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" stroke-width="4.5" stroke-dasharray="10 90" stroke-dashoffset="101.6"></circle>
                            <!-- Online (light green): 8% -->
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" stroke-width="4.5" stroke-dasharray="8 92" stroke-dashoffset="111.6"></circle>
                            <!-- Home Delivery (light blue): 5.4% -->
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="4.5" stroke-dasharray="5.4 94.6" stroke-dashoffset="117"></circle>
                        </svg>
                        
                        <!-- Center text overlay -->
                        <div style="position:absolute; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                            <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">Dine-in</span>
                            <span style="font-size:1.15rem; font-weight:800; color:var(--pos-text); margin-top:-0.1rem;">76.6%</span>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.45rem; font-size:0.75rem; padding:0 0.5rem; margin-top:0.75rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:700; color:var(--pos-text);"><div style="width:10px; height:10px; background:#b02a5b; border-radius:50%;"></div>Dine-in</div>
                            <span style="color:var(--pos-text-secondary); font-weight:700;">76.6% (46,829 Orders)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:700; color:var(--pos-text);"><div style="width:10px; height:10px; background:#f59e0b; border-radius:50%;"></div>Take Away</div>
                            <span style="color:var(--pos-text-secondary); font-weight:700;">10.0%</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:700; color:var(--pos-text);"><div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div>Online</div>
                            <span style="color:var(--pos-text-secondary); font-weight:700;">8.0%</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:700; color:var(--pos-text);"><div style="width:10px; height:10px; background:#3b82f6; border-radius:50%;"></div>Home Delivery</div>
                            <span style="color:var(--pos-text-secondary); font-weight:700;">5.4%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Helper Auxiliary Tab Views ---
    renderPOSDashboard() {
        const panel = document.getElementById("view-pos-dashboard");
        if (!panel) return;

        const tables = this.model.getTables();
        const orders = this.model.getOrders();
        
        const activeTablesCount = tables.filter(t => t.status !== "Free").length;
        const totalPendingOrders = orders.filter(o => o.status !== "completed" && o.status !== "served").length;

        panel.innerHTML = `
            <h2 class="dashboard-grid-title">Dashboard Overview</h2>
            
            <div class="metrics-row" style="width:100%; margin-bottom:1.5rem;">
                <div class="metric-card">
                    <h5>Terminal Connectivity</h5>
                    <div class="metric-number" style="color:#10b981;">Online</div>
                    <span style="color:var(--pos-text-secondary); font-size:0.8rem;">Cloud Gateway Sync Active</span>
                </div>
                <div class="metric-card">
                    <h5>Live Dining Occupancy</h5>
                    <div class="metric-number">${activeTablesCount} / 12</div>
                    <span style="color:var(--pos-text-secondary); font-size:0.8rem;">Active floor occupancy</span>
                </div>
                <div class="metric-card">
                    <h5>Kitchen Queue Load</h5>
                    <div class="metric-number">${totalPendingOrders} orders</div>
                    <span style="color:var(--pos-text-secondary); font-size:0.8rem;">Cooking and pending dockets</span>
                </div>
            </div>

            <div class="charts-row" style="width:100%; display:grid; grid-template-columns:1.2fr 1fr; gap:1.5rem;">
                <div class="chart-box" style="height:300px; text-align:left;">
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; margin-bottom:1rem;">Quick Actions</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                        <button class="btn-pos-primary" onclick="posCtrl.switchDashboardTab('pos')" style="padding:1rem;">💳 Launch Billing POS</button>
                        <button class="btn-pos-secondary" onclick="posCtrl.switchDashboardTab('online')" style="padding:1rem;">📱 Open Online Desk</button>
                        <button class="btn-pos-secondary" onclick="posCtrl.switchDashboardTab('kds')" style="padding:1rem;">🍳 Launch Kitchen Display</button>
                        <button class="btn-pos-secondary" onclick="posCtrl.switchDashboardTab('employees')" style="padding:1rem;">👤 Staff Management</button>
                    </div>
                </div>
                <div class="chart-box" style="height:300px; text-align:left; overflow:hidden;">
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; margin-bottom:0.75rem;">Recent Security Audits</h4>
                    <div style="overflow-y:auto; height:200px; display:flex; flex-direction:column; gap:0.5rem;" id="dashboard-recent-audits-list">
                        ${this.model.getSecurityLogs().slice(-5).reverse().map(log => `
                            <div style="font-size:0.8rem; border-bottom:1px solid var(--pos-border); padding-bottom:0.4rem;">
                                <span style="color:var(--pos-primary); font-weight:700;">[${log.level}]</span> ${log.message}
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    renderCustomersManager() {
        const panel = document.getElementById("view-pos-customers");
        if (!panel) return;

        const db = this.model.getLoyaltyDatabase();

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Customers Directory (CRM)</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Track customer accounts profiles, contact directories, and active loyalty reward points.</p>
                </div>
            </div>

            <div class="pos-table-card" style="width:100%;">
                <table class="pos-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Phone Number</th>
                            <th>Accumulated Points Balance</th>
                            <th>Cashback Valuation</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(db).map(([phone, cust]) => `
                            <tr>
                                <td style="font-weight:700; color:var(--pos-text);">${cust.name}</td>
                                <td style="font-weight:600;">+91 ${phone}</td>
                                <td>${cust.points} Points</td>
                                <td style="color:#10b981; font-weight:700;">₹${cust.points.toFixed(2)}</td>
                                <td><button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="posCtrl.viewCustomerActivity('${cust.name}')">View Activity</button></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderBranches() {
        const panel = document.getElementById("view-pos-branches");
        if (!panel) return;

        panel.innerHTML = `
            <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Branches Configurations</h2>
            <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin-bottom:1.5rem;">Configure multi-unit restaurant branches, geo-locations, and custom layout setups.</p>
            
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1.5rem; width:100%; text-align:left;">
                <div class="chart-box" style="border:1.5px solid var(--pos-primary); box-shadow:0 8px 24px rgba(212, 175, 55, 0.08);">
                    <span style="font-size:2rem; margin-bottom:0.5rem;">🏢</span>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--pos-text);">Main Branch</h4>
                    <p style="font-size:0.8rem; color:var(--pos-text-secondary); margin-top:0.25rem;">Connaught Place, New Delhi</p>
                    <span class="status-tag in-stock" style="display:inline-block; font-size:0.7rem; padding:0.2rem 0.5rem; margin-top:1rem; text-transform:uppercase;">ACTIVE HEADQUARTERS</span>
                </div>
                <div class="chart-box">
                    <span style="font-size:2rem; margin-bottom:0.5rem;">📍</span>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--pos-text);">Downtown Branch</h4>
                    <p style="font-size:0.8rem; color:var(--pos-text-secondary); margin-top:0.25rem;">Indiranagar, Bengaluru</p>
                    <span class="status-tag in-stock" style="display:inline-block; font-size:0.7rem; padding:0.2rem 0.5rem; margin-top:1rem; text-transform:uppercase;">ACTIVE</span>
                </div>
                <div class="chart-box">
                    <span style="font-size:2rem; margin-bottom:0.5rem;">📍</span>
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--pos-text);">Uptown Branch</h4>
                    <p style="font-size:0.8rem; color:var(--pos-text-secondary); margin-top:0.25rem;">Bandra West, Mumbai</p>
                    <span class="status-tag in-stock" style="display:inline-block; font-size:0.7rem; padding:0.2rem 0.5rem; margin-top:1rem; text-transform:uppercase;">ACTIVE</span>
                </div>
            </div>
        `;
    }

    renderIntegrations() {
        const panel = document.getElementById("view-pos-integrations");
        if (!panel) return;

        // Displays Zomato, Swiggy, Talabat, Peppo, DotPe, Magicpin, Eazydiner, Thrive, uEngage (from image 5)
        const aggregators = [
            { name: "Zomato", icon: "🔴", desc: "Automated real-time webhook docket insertion and syncs." },
            { name: "Swiggy", icon: "🟠", desc: "Direct order dispatch KOT connection and menu state syncs." },
            { name: "Talabat", icon: "🍊", desc: "Premium Middle-East delivery channel integrations." },
            { name: "Peppo", icon: "🟢", desc: "Direct consumer ordering web services sync." },
            { name: "DotPe", icon: "⚫", desc: "Multi-channel QR checkout aggregations." },
            { name: "Magicpin", icon: "🔵", desc: "Hyperlocal food aggregator marketplace hookups." },
            { name: "Eazydiner", icon: "⭐", desc: "Table reservations and offline dining voucher links." },
            { name: "THRIVE", icon: "🟣", desc: "Direct restaurant delivery checkout networks." },
            { name: "uEngage", icon: "🟩", desc: "Brand loyalty and dispatch aggregations." }
        ];

        // Displays Google Pay, Paytm, Razorpay, UPI, Invoice Bazaar (from image 4)
        const gateways = [
            { name: "Google Pay", icon: "💳", desc: "GPay QR payments settlement API link." },
            { name: "Paytm", icon: "📱", desc: "Direct instant wallet checkout portal." },
            { name: "Razorpay", icon: "🚀", desc: "Credit/Debit card merchant settlements gateway." },
            { name: "BHIM UPI", icon: "⚡", desc: "Unified Payments Interface instant bank transfers." },
            { name: "Invoice Bazaar", icon: "📈", desc: "B2B vendor invoice settlement API." }
        ];

        panel.innerHTML = `
            <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Platform API Integrations</h2>
            <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin-bottom:1.5rem;">Manage secure API gateway connections to food delivery aggregators and payment networks.</p>
            
            <!-- Food Delivery Aggregators section (Image 5 replica) -->
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:1rem; color:var(--pos-text);">Manage all food aggregators from a single dashboard</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1.25rem; width:100%; text-align:left; margin-bottom:2.5rem;">
                ${aggregators.map(agg => `
                    <div class="chart-box" style="display:flex; flex-direction:column; justify-content:space-between; padding:1.25rem; border-radius:10px; border:1px solid var(--pos-border); height:160px; box-shadow:0 4px 12px rgba(0,0,0,0.015);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:1.75rem;">${agg.icon}</span>
                            <span style="font-weight:800; color:var(--pos-text); font-size:0.95rem; font-family:'Inter', sans-serif;">${agg.name}</span>
                        </div>
                        <p style="font-size:0.75rem; color:var(--pos-text-secondary); line-height:1.4; margin:0.5rem 0;">${agg.desc}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--pos-border); padding-top:0.5rem; margin-top:0.25rem;">
                            <span style="font-size:0.7rem; font-weight:700; color:#10b981;">CONNECTED</span>
                            <!-- Modern Toggle Switch -->
                            <label style="position:relative; display:inline-block; width:34px; height:18px; cursor:pointer;">
                                <input type="checkbox" checked style="opacity:0; width:0; height:0;">
                                <span style="position:absolute; top:0; left:0; right:0; bottom:0; background-color:#2563eb; border-radius:34px; transition:0.3s; display:block;">
                                    <span style="position:absolute; height:14px; width:14px; left:2px; bottom:2px; background-color:white; border-radius:50%; transition:0.3s; transform:translateX(16px);"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Payment Gateways section (Image 4 replica) -->
            <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:1rem; color:var(--pos-text);">Multiple UPI Integrations for quick payment</h3>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1.25rem; width:100%; text-align:left;">
                ${gateways.map(gate => `
                    <div class="chart-box" style="display:flex; flex-direction:column; justify-content:space-between; padding:1.25rem; border-radius:10px; border:1px solid var(--pos-border); height:160px; box-shadow:0 4px 12px rgba(0,0,0,0.015);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:1.75rem;">${gate.icon}</span>
                            <span style="font-weight:800; color:var(--pos-text); font-size:0.95rem; font-family:'Inter', sans-serif;">${gate.name}</span>
                        </div>
                        <p style="font-size:0.75rem; color:var(--pos-text-secondary); line-height:1.4; margin:0.5rem 0;">${gate.desc}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--pos-border); padding-top:0.5rem; margin-top:0.25rem;">
                            <span style="font-size:0.7rem; font-weight:700; color:#10b981;">CONNECTED</span>
                            <!-- Toggle switch -->
                            <label style="position:relative; display:inline-block; width:34px; height:18px; cursor:pointer;">
                                <input type="checkbox" checked style="opacity:0; width:0; height:0;">
                                <span style="position:absolute; top:0; left:0; right:0; bottom:0; background-color:#2563eb; border-radius:34px; transition:0.3s; display:block;">
                                    <span style="position:absolute; height:14px; width:14px; left:2px; bottom:2px; background-color:white; border-radius:50%; transition:0.3s; transform:translateX(16px);"></span>
                                </span>
                            </label>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderPermissions() {
        const panel = document.getElementById("view-pos-permissions");
        if (!panel) return;

        panel.innerHTML = `
            <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Staff Access Roles & Permissions</h2>
            <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin-bottom:1.5rem;">Configure secure view restrictions and execution capabilities mapped to staff roles.</p>
            
            <div class="pos-table-card" style="width:100%;">
                <table class="pos-table" style="text-align:center;">
                    <thead>
                        <tr>
                            <th style="text-align:left;">Functional Category / Action</th>
                            <th>Admin Role</th>
                            <th>Manager Role</th>
                            <th>Chef Role</th>
                            <th>Waiter Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align:left; font-weight:700; color:white;">Dine-In Billing Counter (Settle Ticket)</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                        </tr>
                        <tr>
                            <td style="text-align:left; font-weight:700; color:white;">Zomato/Swiggy Online Desk (Accept Order)</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                        </tr>
                        <tr>
                            <td style="text-align:left; font-weight:700; color:white;">Staff Registrations & CRM Directory</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                        </tr>
                        <tr>
                            <td style="text-align:left; font-weight:700; color:white;">Warehouse Inventory Stock Modification</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                        </tr>
                        <tr>
                            <td style="text-align:left; font-weight:700; color:white;">Business Intelligence Sales Analytics</td>
                            <td style="color:#10b981;">✔ Allowed</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                            <td style="color:var(--pos-primary);">✖ Restricted</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    renderBilling() {
        const panel = document.getElementById("view-pos-billing-sub");
        if (!panel) return;

        panel.innerHTML = `
            <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">SaaS Subscription Billing</h2>
            <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin-bottom:1.5rem;">Review active subscription plans, cycles, invoices, and payment card details.</p>
            
            <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.5rem; width:100%; text-align:left;">
                <div class="chart-box">
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; color:var(--pos-text);">Current Active Plan Details</h4>
                    <p style="font-size:0.85rem; color:var(--pos-text-secondary); margin-top:0.25rem;">RestoFlow All-Inclusive Suite Subscription Plan</p>
                    
                    <div style="border-top:1px dashed var(--pos-border); padding-top:1rem; margin-top:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                            <span>Subscription Tier:</span>
                            <span style="font-weight:700; color:white;">All-Inclusive Suite</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                            <span>Billing Cycle:</span>
                            <span>Billed Annually (₹3,999/mo)</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                            <span>Next Billing Date:</span>
                            <span style="font-weight:700; color:white;">2027-05-30</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                            <span>Amount Due:</span>
                            <span style="font-weight:700; color:var(--pos-primary);">₹47,988.00 / year</span>
                        </div>
                    </div>
                </div>
                <div class="chart-box">
                    <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; color:var(--pos-text);">Payment Method Registered</h4>
                    <p style="font-size:0.85rem; color:var(--pos-text-secondary); margin-top:0.25rem;">Auto-renew is active.</p>
                    
                    <div style="border:1px solid var(--pos-border); border-radius:6px; padding:0.85rem; margin-top:1.5rem; display:flex; align-items:center; gap:0.75rem; background:rgba(0,0,0,0.1);">
                        <span style="font-size:1.5rem;">💳</span>
                        <div>
                            <div style="font-weight:700; color:white; font-size:0.9rem;">HDFC Platinum Credit Card</div>
                            <span style="font-size:0.75rem; color:var(--pos-text-secondary);">Expires: 11 / 2030 (Ending: **** 8812)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettings() {
        const panel = document.getElementById("view-pos-settings");
        if (!panel) return;

        panel.innerHTML = `
            <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">General Configurations Settings</h2>
            <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin-bottom:1.5rem;">Configure restaurant brand descriptors, print layout rules, and terminal session parameters.</p>
            
            <div class="chart-box" style="text-align:left; width:100%;">
                <h4 style="font-family:'Playfair Display', serif; font-size:1.15rem; color:var(--pos-text); margin-bottom:1.5rem;">Restaurant Metadata settings</h4>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
                    <div class="form-group" style="display:flex; flex-direction:column; gap:0.4rem;">
                        <label style="font-size:0.8rem; font-weight:700; color:var(--pos-text-secondary);">RESTAURANT BRAND NAME</label>
                        <input type="text" class="stock-input" style="text-align:left;" value="Ganeshwaram Signature" readonly>
                    </div>
                    <div class="form-group" style="display:flex; flex-direction:column; gap:0.4rem;">
                        <label style="font-size:0.8rem; font-weight:700; color:var(--pos-text-secondary);">PRIMARY PHONE CONTACT</label>
                        <input type="text" class="stock-input" style="text-align:left;" value="+91 98765 43210" readonly>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
                    <div class="form-group" style="display:flex; flex-direction:column; gap:0.4rem;">
                        <label style="font-size:0.8rem; font-weight:700; color:var(--pos-text-secondary);">SUPPORT CONTACT EMAIL</label>
                        <input type="text" class="stock-input" style="text-align:left;" value="support@ganeshwaram.com" readonly>
                    </div>
                    <div class="form-group" style="display:flex; flex-direction:column; gap:0.4rem;">
                        <label style="font-size:0.8rem; font-weight:700; color:var(--pos-text-secondary);">GST IDENTIFICATION NUMBER (GSTIN)</label>
                        <input type="text" class="stock-input" style="text-align:left;" value="07AAAAA1111A1Z1" readonly>
                    </div>
                </div>
            </div>
        `;
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

    renderOrdersManager(searchQuery = "", sourceFilter = "All", statusFilter = "All") {
        const panel = document.getElementById("view-pos-orders");
        if (!panel) return;

        let orders = this.model.getOrders();

        // Apply filters
        if (searchQuery) {
            orders = orders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || (o.phone && o.phone.includes(searchQuery)));
        }
        if (sourceFilter !== "All") {
            orders = orders.filter(o => o.orderType === sourceFilter || (sourceFilter === "Delivery" && (o.id.startsWith("ZOM") || o.id.startsWith("SWI") || o.id.startsWith("TAL"))));
        }
        if (statusFilter !== "All") {
            orders = orders.filter(o => o.status === statusFilter);
        }

        const orderTypes = ["All", "Dine-In", "Takeaway", "Delivery"];
        const statusOptions = ["All", "pending", "cooking", "ready", "served", "completed", "cancelled"];

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Orders Management</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Audit historical checkout logs, dine-in table checks, and incoming delivery receipts.</p>
                </div>
            </div>

            <!-- Control Filter Header -->
            <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem; align-items:center; background:rgba(37,99,235,0.02); padding:1rem; border-radius:8px; border:1px solid var(--pos-border); width:100%;">
                <input type="text" id="order-search-box" class="stock-input" style="flex:1.5; text-align:left;" placeholder="Search by Order ID, Phone number..." value="${searchQuery}" oninput="posCtrl.handleOrderSearch(this.value)">
                
                <div style="display:flex; gap:0.4rem; align-items:center; flex:1;">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">CHANNEL</span>
                    <select class="stock-input" style="flex:1; text-align:left;" onchange="posCtrl.handleOrderFilter('channel', this.value)">
                        ${orderTypes.map(c => `<option value="${c}" ${c === sourceFilter ? 'selected' : ''}>${c}</option>`).join("")}
                    </select>
                </div>

                <div style="display:flex; gap:0.4rem; align-items:center; flex:1;">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">STATUS</span>
                    <select class="stock-input" style="flex:1; text-align:left;" onchange="posCtrl.handleOrderFilter('status', this.value)">
                        ${statusOptions.map(s => `<option value="${s}" ${s === statusFilter ? 'selected' : ''}>${s.toUpperCase()}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div class="pos-table-card" style="width:100%;">
                <table class="pos-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Items Summary</th>
                            <th>Grand Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.length === 0 ? `
                            <tr>
                                <td colspan="8" style="text-align:center; padding:3rem; color:var(--pos-text-secondary);">No orders found matching filters.</td>
                            </tr>
                        ` : orders.reverse().map(o => {
                            const isPaid = o.paymentStatus === "paid";
                            const payClass = isPaid ? "in-stock" : "out-of-stock";
                            const isCompleted = o.status === "completed";
                            const statusClass = isCompleted ? "in-stock" : (o.status === "cancelled" ? "out-of-stock" : "low-stock");
                            
                            const itemsDesc = o.items.map(i => `${i.qty}x ${i.name}`).join(", ");
                            const formattedTime = new Date(o.timestamp).toLocaleString();

                            return `
                                <tr>
                                    <td style="font-weight:700; color:var(--pos-text);">${o.id}</td>
                                    <td style="font-size:0.8rem;">${formattedTime}</td>
                                    <td style="font-weight:600;">${o.orderType}</td>
                                    <td style="font-size:0.8rem; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemsDesc}">${itemsDesc}</td>
                                    <td style="font-weight:700; color:var(--pos-text);">₹${o.total.toFixed(2)}</td>
                                    <td>
                                        <span class="status-tag ${payClass}" style="font-size:0.7rem; padding:0.2rem 0.5rem;">
                                            ${o.paymentStatus.toUpperCase()} ${o.paymentMethod ? `(${o.paymentMethod})` : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-tag ${statusClass}" style="font-size:0.7rem; padding:0.2rem 0.5rem; text-transform:uppercase;">
                                            ${o.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="posCtrl.printReceipt('${o.id}')">🖨 Receipt</button>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderMenuEditor(searchQuery = "", categoryFilter = "All", statusFilter = "All") {
        const panel = document.getElementById("view-pos-menu");
        if (!panel) return;

        const menu = this.model.getMenu();
        let items = menu;

        // Apply filters
        if (searchQuery) {
            items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (categoryFilter !== "All") {
            items = items.filter(item => item.category === categoryFilter);
        }

        const categories = ["All", ...new Set(menu.map(item => item.category))];

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; width:100%;">
                <div>
                    <h2 class="dashboard-grid-title" style="margin-bottom:0.25rem;">Menu Catalog Configurations</h2>
                    <p style="color:var(--pos-text-secondary); font-size:0.8rem; margin:0;">Configure dish descriptions, category headers, active pricing, and ingredients depletion ratios.</p>
                </div>
                <button class="btn-pos-primary" onclick="posCtrl.addMenuItemPrompt()">+ Add Menu Item</button>
            </div>

            <!-- Control Filter Header -->
            <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem; align-items:center; background:rgba(37,99,235,0.02); padding:1rem; border-radius:8px; border:1px solid var(--pos-border); width:100%;">
                <input type="text" id="menu-search-box" class="stock-input" style="flex:1.5; text-align:left;" placeholder="Search menu dishes by name, description..." value="${searchQuery}" oninput="posCtrl.handleMenuSearch(this.value)">
                
                <div style="display:flex; gap:0.4rem; align-items:center; flex:1;">
                    <span style="font-size:0.75rem; font-weight:700; color:var(--pos-text-secondary);">CATEGORY</span>
                    <select class="stock-input" style="flex:1; text-align:left;" onchange="posCtrl.handleMenuFilter('category', this.value)">
                        ${categories.map(c => `<option value="${c}" ${c === categoryFilter ? 'selected' : ''}>${c}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div class="pos-table-card" style="width:100%;">
                <table class="pos-table">
                    <thead>
                        <tr>
                            <th>Dish Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => {
                            const isAvailable = item.status !== "Inactive";
                            const statusClass = isAvailable ? "in-stock" : "out-of-stock";
                            const statusText = isAvailable ? "Active" : "Inactive";

                            return `
                                <tr>
                                    <td style="font-weight:700; color:var(--pos-text);">${item.name}</td>
                                    <td style="font-weight:600;">${item.category}</td>
                                    <td style="font-weight:700; color:var(--pos-primary);">₹${item.price.toFixed(2)}</td>
                                    <td style="font-size:0.8rem; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.description}">${item.description}</td>
                                    <td>
                                        <span class="status-tag ${statusClass}" style="font-size:0.7rem; padding:0.2rem 0.5rem; cursor:pointer;" onclick="posCtrl.toggleMenuItemAvailability('${item.id}')">
                                            ${statusText}
                                        </span>
                                    </td>
                                    <td>
                                        <div style="display:flex; gap:0.4rem; align-items:center;">
                                            <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="posCtrl.openEditMenuModal('${item.id}')">✏ Edit</button>
                                            <button class="btn-pos-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:rgba(239,68,68,0.1); color:#ef4444; border-color:rgba(239,68,68,0.2);" onclick="posCtrl.deleteMenuItem('${item.id}')">❌ Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    showFeedbackModal(feedbackList) {
        const modal = document.getElementById("pos-feedback-modal");
        const container = document.getElementById("pos-feedback-list-container");
        if (!container) return;

        if (feedbackList.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 2rem 0;">
                    <div class="empty-state-icon" style="font-size:2.5rem; margin-bottom:0.5rem;">💬</div>
                    <p style="font-size:0.85rem; color:var(--pos-text-secondary);">No customer reviews received yet.</p>
                </div>
            `;
        } else {
            container.innerHTML = feedbackList.map(fb => {
                const stars = "★".repeat(fb.rating) + "☆".repeat(5 - fb.rating);
                return `
                    <div style="background:var(--pos-bg-alt); border:1px solid var(--pos-border); border-radius:12px; padding:1rem; text-align:left;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                            <span style="font-weight:700; color:var(--pos-text); font-size:0.9rem;">${fb.customer || 'Anonymous Guest'}</span>
                            <span style="color:#eab308; font-weight:700; font-size:0.85rem;">${stars}</span>
                        </div>
                        <p style="font-size:0.8rem; color:var(--pos-text); line-height:1.4; margin-bottom:0.4rem;">"${fb.comment}"</p>
                        <span style="font-size:0.7rem; color:var(--pos-text-secondary);">${new Date(fb.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                `;
            }).join("");
        }

        if (modal) modal.classList.add("open");
    }

    hideFeedbackModal() {
        const modal = document.getElementById("pos-feedback-modal");
        if (modal) modal.classList.remove("open");
    }
}

