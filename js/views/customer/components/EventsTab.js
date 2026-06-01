/**
 * EventsTab Component for Ganeshwaram Signature Customer Portal
 */

export class EventsTab {
    render() {
        return `
            <div style="padding: 0 1rem; margin-top: 1rem;">
                <h3 class="menu-section-title" style="text-align:left;">Exclusive VIP Events</h3>
                
                <p style="font-size:0.85rem; color:var(--ios-text-secondary); margin-bottom:1.5rem; line-height:1.4; text-align:left;">
                    Access rare culinary experiences, private dining dockets, and wine pairing invitations curated exclusively for Ganeshwaram Gold diners.
                </p>

                <!-- Event card 1 -->
                <div class="premium-food-card" style="margin-bottom:1.25rem;">
                    <div class="card-img-container" style="aspect-ratio: 18 / 10;">
                        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600" alt="Chef Table">
                        <div class="card-badges-row">
                            <span class="food-badge recommended" style="background:#ffe088; color:#554300;">Private Dining</span>
                        </div>
                    </div>
                    <div class="card-info" style="text-align:left;">
                        <div class="card-title-price">
                            <h4 style="font-family:'Playfair Display', serif;">Chef's Table: Banquet Maharaja</h4>
                            <span class="price-tag" style="font-size:1.15rem; color:#735c00;">₹4,500<span style="font-size:0.75rem; color:var(--ios-text-secondary); font-weight:normal;">/seat</span></span>
                        </div>
                        <p class="card-desc">7-course artisanal Indian pairing menu curated by our Corporate Chef, featuring grilled malai paneer and slow-roasted cardamoms desserts.</p>
                        <button class="btn-card-add" style="background:#735c00; box-shadow:0 4px 12px rgba(115,92,0,0.2);" onclick="alert('Maharaja Chef Table booking request submitted securely. Verification pending!')">
                            Reserve VIP Seat
                        </button>
                    </div>
                </div>

                <!-- Event card 2 -->
                <div class="premium-food-card" style="margin-bottom:2rem;">
                    <div class="card-img-container" style="aspect-ratio: 18 / 10;">
                        <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600" alt="Tea pairing">
                        <div class="card-badges-row">
                            <span class="food-badge recommended" style="background:#ffe088; color:#554300;">Masterclass</span>
                        </div>
                    </div>
                    <div class="card-info" style="text-align:left;">
                        <div class="card-title-price">
                            <h4 style="font-family:'Playfair Display', serif;">Chai & Saffron Pairing Pairing</h4>
                            <span class="price-tag" style="font-size:1.15rem; color:#735c00;">₹1,200<span style="font-size:0.75rem; color:var(--ios-text-secondary); font-weight:normal;">/seat</span></span>
                        </div>
                        <p class="card-desc">Master slow-brewing Authentic Masala Kulhad Chai and discover pairing recipes with saffron desserts, pistachio biscuits, and local truffles.</p>
                        <button class="btn-card-add" style="background:#735c00; box-shadow:0 4px 12px rgba(115,92,0,0.2);" onclick="alert('Chai masterclass booking reservation registered!')">
                            Reserve VIP Seat
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}
