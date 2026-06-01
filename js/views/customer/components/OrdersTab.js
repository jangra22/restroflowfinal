/**
 * OrdersTab Component for Ganeshwaram Signature Customer Portal
 */

export class OrdersTab {
    constructor(model) {
        this.model = model;
    }

    render(currentTableId) {
        const orders = this.model.getOrders().filter(o => 
            o.tableId === currentTableId && 
            o.status !== "completed"
        );

        if (orders.length === 0) {
            return `
                <div style="padding: 0 1rem; margin-top: 1rem;">
                    <h3 class="menu-section-title" style="text-align:left;">Active Orders Status</h3>
                    <div class="empty-state">
                        <div class="empty-state-icon">⏱</div>
                        <p style="font-weight:600; color:var(--ios-text-secondary);">No active orders are being cooked for Table ${currentTableId}.</p>
                        <button class="btn-basket-action" onclick="custCtrl.switchMobileView('menu')" style="margin-top: 1rem;">Order Fresh Food</button>
                    </div>
                </div>
            `;
        }

        return `
            <div style="padding: 0 1rem; margin-top: 1rem;">
                <h3 class="menu-section-title" style="text-align:left;">Live Cooking Tracker</h3>
                
                ${orders.map(order => {
                    const statuses = ["pending", "cooking", "ready", "served"];
                    const currentIndex = statuses.indexOf(order.status);
                    
                    let statusBadgeClass = "cooking";
                    if (order.status === "ready") statusBadgeClass = "ready";
                    if (order.status === "served") statusBadgeClass = "served";

                    return `
                        <div class="tracking-container">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:700; color:var(--ios-text); font-size:1.05rem;">ID: ${order.id}</span>
                                <span class="tracking-badge ${statusBadgeClass}">${order.status}</span>
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
                                `).join("")}
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
                }).join("")}
            </div>
        `;
    }
}
