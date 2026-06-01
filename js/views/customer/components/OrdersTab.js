/**
 * OrdersTab Component for Ganeshwaram Signature Customer Portal
 */

export class OrdersTab {
    constructor(model) {
        this.model = model;
    }

    render(currentTableId) {
        const allOrders = this.model.getOrders().filter(o => o.tableId === currentTableId);
        const activeOrders = allOrders.filter(o => o.status !== "completed");
        const previousOrders = allOrders.filter(o => o.status === "completed");

        let html = `<div style="padding: 0 1rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 2rem;">`;

        // 1. ACTIVE ORDERS SECTION
        html += `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 class="menu-section-title" style="text-align:left; margin:0;">Active Orders (${activeOrders.length})</h3>
                </div>
        `;

        if (activeOrders.length === 0) {
            html += `
                <div class="empty-state" style="padding: 2rem 1rem;">
                    <div class="empty-state-icon" style="font-size:2.5rem; margin-bottom:0.5rem;">⏱</div>
                    <p style="font-weight:600; color:var(--ios-text-secondary); font-size:0.9rem; margin:0;">No active recipes are cooking for Table ${currentTableId}.</p>
                    <button class="btn-basket-action" onclick="custCtrl.switchMobileView('menu')" style="margin-top: 1rem; padding:0.5rem 1.2rem; font-size:0.8rem; height:auto; width:auto; border-radius:8px;">Order Delicacies</button>
                </div>
            `;
        } else {
            html += activeOrders.map(order => {
                const statuses = ["pending", "cooking", "ready", "served"];
                const currentIndex = statuses.indexOf(order.status);
                
                let statusBadgeClass = "cooking";
                if (order.status === "ready") statusBadgeClass = "ready";
                if (order.status === "served") statusBadgeClass = "served";

                // If unpaid at counter, highlight that payment is outstanding
                const payBadge = order.paymentStatus === "unpaid" 
                    ? `<span style="font-size:0.7rem; font-weight:700; color:var(--ios-accent); background:rgba(176,42,91,0.08); padding:0.2rem 0.5rem; border-radius:4px; margin-right:0.25rem;">UNPAID (Pay at Counter)</span>` 
                    : ``;

                return `
                    <div class="tracking-container" style="margin-bottom:1rem; padding: 1.25rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.25rem;">
                            <span style="font-weight:700; color:var(--ios-text); font-size:1.05rem;">Docket: ${order.id}</span>
                            <div style="display:flex; gap:0.25rem; align-items:center;">
                                ${payBadge}
                                <span class="tracking-badge ${statusBadgeClass}">${order.status}</span>
                            </div>
                        </div>
                        <p style="font-size:0.8rem; color:var(--ios-text-secondary); text-align:left; margin-bottom:1rem;">
                            Placed: ${new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>

                        <!-- Order items summary -->
                        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:12px; padding:0.75rem; text-align:left; margin-bottom:1.5rem;">
                            ${order.items.map(i => `
                                <div style="font-size:0.85rem; display:flex; justify-content:space-between; margin-bottom:0.25rem; font-weight:600; color:var(--ios-text);">
                                    <span>${i.qty}x ${i.name}</span>
                                    <span style="color:var(--ios-text-secondary);">₹${(i.price * i.qty).toFixed(2)}</span>
                                </div>
                                ${i.customizations && i.customizations.length > 0 ? `<p style="font-size:0.75rem; color:var(--ios-accent); margin-top:-0.15rem; margin-bottom:0.3rem; padding-left:0.5rem;">+ ${i.customizations.join(", ")}</p>` : ''}
                            `).join("")}
                            <div style="border-top:1px dashed var(--ios-border); margin-top:0.5rem; padding-top:0.5rem; display:flex; justify-content:space-between; font-weight:700; font-size:0.9rem; color:var(--ios-text);">
                                <span>Grand Total</span>
                                <span style="color:#735c00;">₹${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="timeline-tracker">
                            <div class="timeline-dot ${currentIndex >= 0 ? 'active' : ''}">📥</div>
                            <div class="timeline-dot ${currentIndex >= 1 ? 'active' : ''}">🍳</div>
                            <div class="timeline-dot ${currentIndex >= 2 ? 'active' : ''}">🔔</div>
                            <div class="timeline-dot ${currentIndex >= 3 ? 'active' : ''}">🍽</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--ios-text-secondary); margin-top:0.5rem; padding:0 0.5rem; font-weight:600;">
                            <span>Received</span>
                            <span>Cooking</span>
                            <span>Ready</span>
                            <span>Served</span>
                        </div>
                    </div>
                `;
            }).join("");
        }
        html += `</div>`;

        // 2. PREVIOUS ORDERS SECTION
        html += `
            <div style="margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 class="menu-section-title" style="text-align:left; margin:0;">Previous Orders (${previousOrders.length})</h3>
                </div>
        `;

        if (previousOrders.length === 0) {
            html += `
                <div class="empty-state" style="padding: 2rem 1rem;">
                    <div class="empty-state-icon" style="font-size:2.5rem; margin-bottom:0.5rem;">📜</div>
                    <p style="font-weight:600; color:var(--ios-text-secondary); font-size:0.9rem; margin:0;">No past completed orders recorded for this session.</p>
                </div>
            `;
        } else {
            html += `<div class="invoice-history-list" style="margin-top:0;">`;
            html += previousOrders.map(order => {
                const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(", ");
                const formattedTime = new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const formattedDate = new Date(order.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'});

                return `
                    <div class="invoice-card" style="display:flex; justify-content:space-between; align-items:center; padding:1.25rem;">
                        <div class="invoice-details" style="text-align:left;">
                            <span class="order-num" style="font-weight:700; color:var(--ios-accent); font-size:0.85rem; letter-spacing:0.5px;">${order.id}</span>
                            <h5 style="margin: 0.35rem 0; font-size:0.95rem; font-weight:600; color:var(--ios-text); line-height:1.4;">${itemsSummary}</h5>
                            <p class="meta" style="font-size:0.75rem; color:var(--ios-text-secondary); margin:0;">
                                ${formattedDate} • ${formattedTime} • Paid via ${order.paymentMethod}
                            </p>
                        </div>
                        <div class="invoice-card-right" style="text-align:right; min-width:80px; display:flex; flex-direction:column; align-items:flex-end;">
                            <span class="invoice-card-price" style="font-size:1.05rem; font-weight:700; color:var(--ios-text);">₹${order.total.toFixed(2)}</span>
                            <span class="invoice-status-badge delivered" style="margin-top:0.4rem; padding: 0.2rem 0.5rem; font-size: 0.65rem; border-radius:4px; font-weight:700; background:rgba(16,185,129,0.1); color:#10b981; text-transform:uppercase;">COMPLETED</span>
                        </div>
                    </div>
                `;
            }).join("");
            html += `</div>`;
        }
        html += `</div>`;

        html += `</div>`; // End of main wrapper
        return html;
    }
}
