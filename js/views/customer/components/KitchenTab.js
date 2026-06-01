/**
 * KitchenTab Component for Ganeshwaram Signature Customer Portal
 */

export class KitchenTab {
    constructor(model) {
        this.model = model;
    }

    render(currentTableId) {
        const activeOrders = this.model.getOrders().filter(o => 
            o.tableId === currentTableId && 
            (o.status === "pending" || o.status === "cooking" || o.status === "ready")
        );

        let activeItemsHtml = "";
        if (activeOrders.length > 0) {
            const allItems = [];
            activeOrders.forEach(o => allItems.push(...o.items));
            
            activeItemsHtml = `
                <div style="margin-top:1.5rem; text-align:left;">
                    <div class="custom-section-title">Culinary Staging Queue</div>
                    <div style="display:flex; flex-direction:column; gap:0.6rem;">
                        ${allItems.map(i => `
                            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:0.6rem 0.85rem; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:700; font-size:0.85rem; color:var(--ios-text);">${i.qty}x ${i.name}</span>
                                <span style="font-size:0.75rem; font-weight:700; color:var(--ios-accent); background:rgba(176,42,91,0.06); padding:0.2rem 0.5rem; border-radius:4px; text-transform:uppercase;">In Skillet</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        } else {
            activeItemsHtml = `
                <div style="margin-top:1.5rem; color:var(--ios-text-secondary); font-size:0.8rem;">
                    No active recipes in skillet. Order a premium delicacy to see live pan cooking dynamics!
                </div>
            `;
        }

        return `
            <div style="padding: 0 1rem; margin-top: 1rem;">
                <h3 class="menu-section-title" style="text-align:left;">Live Kitchen Display</h3>
                
                <div class="live-kitchen-card">
                    <div style="display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--ios-text); font-size:0.95rem;">
                        <span class="kitchen-sizzle-dot"></span> Live Kitchen Dispatch Active
                    </div>
                    
                    <div class="kitchen-visuals-area">
                        <span class="steam-cloud steam-1">💨</span>
                        <span class="steam-cloud steam-2">💨</span>
                        <span class="steam-cloud steam-3">💨</span>
                        <div class="cooking-pan-graphic">🍳</div>
                    </div>
                    
                    <p style="font-size:0.85rem; color:var(--ios-text-secondary); line-height:1.4;">
                        Our culinary team at Ganeshwaram is preparing delicacies at 180°C under strict premium sanitation protocols.
                    </p>

                    ${activeItemsHtml}
                </div>
            </div>
        `;
    }
}
