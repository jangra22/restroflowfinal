/**
 * CartDrawer Component for Ganeshwaram Signature Customer Portal
 */

export class CartDrawer {
    constructor(model) {
        this.model = model;
    }

    render(customerBasket, linkedLoyaltyCustomer, redeemedPoints, appliedCoupon, selectedPayment, selectedUPIBrand) {
        if (customerBasket.length === 0) {
            return `
                <div class="ios-sheet-handle"></div>
                <h4 class="ios-sheet-title" style="text-align:center;">Your Order Basket</h4>
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <p style="font-weight:600; color:var(--ios-text-secondary);">Your basket is currently empty.</p>
                    <button class="btn-basket-action" onclick="custCtrl.closeCartDrawer()" style="margin-top: 1rem; background:var(--ios-text-secondary); box-shadow:none;">Close Cart</button>
                </div>
            `;
        }

        // Calculations
        let subtotal = 0;
        customerBasket.forEach(i => subtotal += (i.price * i.qty));

        let couponDiscount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === "flat") {
                couponDiscount = appliedCoupon.value;
            } else if (appliedCoupon.type === "percent") {
                couponDiscount = subtotal * (appliedCoupon.value / 100);
            }
            couponDiscount = Math.min(couponDiscount, subtotal);
        }

        let maxPointsRedeemable = linkedLoyaltyCustomer ? linkedLoyaltyCustomer.points : 0;
        let loyaltyDiscountCap = Math.max(0, subtotal - couponDiscount);
        let activeLoyaltyDiscount = Math.min(redeemedPoints, maxPointsRedeemable, loyaltyDiscountCap);
        
        let netBase = Math.max(0, subtotal - couponDiscount - activeLoyaltyDiscount);
        let isGSTFree = appliedCoupon && appliedCoupon.type === "gstfree";
        let tax = isGSTFree ? 0 : netBase * 0.05;
        let cgst = tax / 2;
        let sgst = tax / 2;
        let grandTotal = netBase + tax;

        return `
            <div class="ios-sheet-handle"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <h4 class="ios-sheet-title" style="margin-bottom:0;">Checkout Terminal</h4>
                <button style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; color:var(--ios-text-secondary);" onclick="custCtrl.closeCartDrawer()">&times;</button>
            </div>

            <!-- Items Lists -->
            <div class="basket-list" style="max-height:240px; overflow-y:auto; padding-right:4px;">
                ${customerBasket.map((item, idx) => `
                    <div class="basket-item">
                        <div>
                            <span style="font-weight: 700; color: var(--ios-text); font-size:0.95rem;">${item.name}</span>
                            ${item.customizations.length > 0 ? `<p style="font-size: 0.75rem; color: var(--ios-accent); margin-top: 0.2rem;">${item.customizations.join(", ")}</p>` : ''}
                            <div style="font-weight: 700; margin-top: 0.3rem; color: #735c00; font-size: 0.85rem;">
                                ₹${item.price.toFixed(2)} each
                            </div>
                        </div>
                        
                        <div class="quantity-controller">
                            <button class="qty-btn" onclick="custCtrl.adjustBasketItemQty(${idx}, -1)">-</button>
                            <span class="qty-count">${item.qty}</span>
                            <button class="qty-btn" onclick="custCtrl.adjustBasketItemQty(${idx}, 1)">+</button>
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- CRM LOYALTY WIDGET CARD -->
            <div id="customer-loyalty-widget" class="loyalty-widget-card" style="margin-top:1rem;">
                <div class="custom-section-title">Ganeshwaram Loyalty Rewards</div>
                <p style="font-size: 0.75rem; color: var(--ios-text-secondary); margin-bottom: 0.5rem;">Enter mobile to redeem points balances immediately.</p>
                <div class="crm-input-group">
                    <input type="tel" id="loyalty-phone-input" class="crm-input" placeholder="Enter 10-digit Mobile No." maxlength="10">
                    <button class="btn-crm-action" onclick="custCtrl.checkLoyaltyAccount()">Link Account</button>
                </div>
                <div id="loyalty-status-details" class="loyalty-status-box" style="display: none;"></div>
            </div>

            <!-- PROMO CODE WIDGET CARD -->
            <div id="coupon-code-widget" class="coupon-widget-card">
                <div class="custom-section-title">Apply Promo Coupon</div>
                <div class="crm-input-group">
                    <input type="text" id="coupon-code-input" class="crm-input" placeholder="Promo Code (e.g. WELCOME50)">
                    <button class="btn-crm-action" onclick="custCtrl.applyCouponCode()">Apply</button>
                </div>
                <div id="coupon-status-details" style="font-size: 0.8rem; margin-top: 0.5rem; display: none; font-weight: 700;"></div>
            </div>

            <!-- PRICING SUMMARY CARD -->
            <div id="basket-pricing-card" class="summary-card">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                ${couponDiscount > 0 ? `
                    <div class="summary-row" style="color: var(--ios-accent);">
                        <span>Promo Coupon Discount</span>
                        <span>-₹${couponDiscount.toFixed(2)}</span>
                    </div>
                ` : ''}
                ${activeLoyaltyDiscount > 0 ? `
                    <div class="summary-row" style="color: var(--ios-accent);">
                        <span>Loyalty Points Redeemed</span>
                        <span>-₹${activeLoyaltyDiscount.toFixed(2)}</span>
                    </div>
                ` : ''}
                <div class="summary-row">
                    <span>CGST (2.5%)</span>
                    <span>₹${cgst.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>SGST (2.5%)</span>
                    <span>₹${sgst.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Grand Total</span>
                    <span>₹${grandTotal.toFixed(2)}</span>
                </div>
            </div>

            <!-- PAYMENT CHECKOUT SELECTION PANEL -->
            <div id="payment-gateways-container">
                <div class="custom-section-title">Secure Billing Checkout</div>
                
                <div class="payment-selector">
                    <div class="payment-option ${selectedPayment === 'UPI' ? 'selected' : ''}" id="pay-opt-upi" onclick="custCtrl.selectPaymentMethod('UPI')">
                        📱 Instant UPI
                    </div>
                    <div class="payment-option ${selectedPayment === 'Card' ? 'selected' : ''}" id="pay-opt-card" onclick="custCtrl.selectPaymentMethod('Card')">
                        💳 Credit Card
                    </div>
                    <div class="payment-option ${selectedPayment === 'Counter' ? 'selected' : ''}" id="pay-opt-counter" onclick="custCtrl.selectPaymentMethod('Counter')">
                        💵 Pay at Counter
                    </div>
                </div>

                <!-- UPI Apps Grid Selector -->
                <div id="upi-brands-container" style="display: ${selectedPayment === 'UPI' ? 'block' : 'none'}; margin-bottom: 1.5rem;">
                    <div class="custom-section-title" style="font-size:0.75rem; margin-bottom: 0.4rem;">Select UPI Payment App</div>
                    <div class="upi-brands-grid">
                        <div class="upi-brand-pill ${selectedUPIBrand === 'GPay' ? 'selected' : ''}" id="upi-brand-gpay" onclick="custCtrl.selectUPIBrand('GPay')">Google Pay</div>
                        <div class="upi-brand-pill ${selectedUPIBrand === 'Paytm' ? 'selected' : ''}" id="upi-brand-paytm" onclick="custCtrl.selectUPIBrand('Paytm')">Paytm</div>
                        <div class="upi-brand-pill ${selectedUPIBrand === 'PhonePe' ? 'selected' : ''}" id="upi-brand-phonepe" onclick="custCtrl.selectUPIBrand('PhonePe')">PhonePe</div>
                    </div>
                </div>

                <button class="btn-basket-action" id="btn-place-order" onclick="custCtrl.submitCustomerOrder()">
                    Confirm & Send Order to Kitchen
                </button>
            </div>
        `;
    }
}
