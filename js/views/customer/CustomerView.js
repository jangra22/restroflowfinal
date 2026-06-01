/**
 * RestoFlow Customer QR Mobile Portal View (Orchestrator Class)
 * Directs dynamic rendering of modular sub-components.
 */

import { Header } from './components/Header.js?v=2.0.1';
import { CategorySlider } from './components/CategorySlider.js?v=2.0.1';
import { MenuSection } from './components/MenuSection.js?v=2.0.1';
import { CartDrawer } from './components/CartDrawer.js?v=2.0.1';
import { ProfileTab } from './components/ProfileTab.js?v=2.0.1';
import { OrdersTab } from './components/OrdersTab.js?v=2.0.1';
import { KitchenTab } from './components/KitchenTab.js?v=2.0.1';
import { EventsTab } from './components/EventsTab.js?v=2.0.1';
import { CustomizerSheet } from './components/CustomizerSheet.js?v=2.0.1';

export class CustomerView {
    constructor(model) {
        this.model = model;

        // Instantiate components
        this.headerComponent = new Header();
        this.categorySliderComponent = new CategorySlider(model);
        this.menuSectionComponent = new MenuSection(model);
        this.cartDrawerComponent = new CartDrawer(model);
        this.ordersTabComponent = new OrdersTab(model);
        this.kitchenTabComponent = new KitchenTab(model);
        this.customizerSheetComponent = new CustomizerSheet();
    }

    renderHeader() {
        const root = document.getElementById("header-root");
        if (root) {
            root.innerHTML = this.headerComponent.render();
        }
    }

    renderCategorySlider(currentCategory) {
        const root = document.getElementById("categories-tabs-slider");
        if (root) {
            root.innerHTML = this.categorySliderComponent.render(currentCategory);
        }
    }

    renderMenuItems(currentCategory, filterQuery = "") {
        const root = document.getElementById("menu-items-sections-container");
        if (root) {
            root.innerHTML = this.menuSectionComponent.render(currentCategory, filterQuery);
        }
    }

    // Main structural tab rendering router
    renderActiveTabContent(activeTab, controllerState) {
        const root = document.getElementById("tab-content-root");
        if (!root) return;

        if (activeTab === 'menu') {
            root.innerHTML = `
                <!-- Search bar matching ref screenshot -->
                <div style="padding: 0 1rem; margin-bottom: 0.5rem;">
                    <div class="search-box" style="border-radius:14px; border:1px solid rgba(224,224,224,0.6); padding:0.65rem 1rem; background:white;">
                        <span style="font-size:0.95rem; color:var(--ios-text-secondary); margin-right:0.25rem;">🔍</span>
                        <input type="text" id="menu-search-input" placeholder="Search for premium delicacies..." style="font-weight:500;" oninput="custCtrl.handleMenuSearch()">
                    </div>
                </div>

                <!-- Categories Swipe Slider tab -->
                <div class="categories-slider" id="categories-tabs-slider" style="padding-top:0.75rem;">
                    <!-- Injected Categories -->
                </div>

                <!-- Premium Menu Section -->
                <div id="menu-items-sections-container">
                    <!-- Injected Menu Cards -->
                </div>
            `;
            this.renderCategorySlider(controllerState.currentCategory);
            this.renderMenuItems(controllerState.currentCategory);
        } else if (activeTab === 'orders') {
            root.innerHTML = this.ordersTabComponent.render(controllerState.currentTableId);
        } else if (activeTab === 'kitchen') {
            root.innerHTML = this.kitchenTabComponent.render(controllerState.currentTableId);
        }
    }

    toggleFavorite(itemId, e) {
        this.menuSectionComponent.toggleFavorite(itemId, e);
    }

    showCustomizerSheet(selectedCustomizeItem) {
        const root = document.getElementById("customizer-sheet");
        if (root) {
            root.innerHTML = this.customizerSheetComponent.render(selectedCustomizeItem);
            root.classList.add("open");
        }
    }

    hideCustomizerSheet() {
        const root = document.getElementById("customizer-sheet");
        if (root) {
            root.classList.remove("open");
        }
    }

    updateCustomizerPrice(selectedCustomizeItem) {
        this.customizerSheetComponent.render(selectedCustomizeItem);
        const addPrice = document.getElementById("cust-add-price");
        if (addPrice && selectedCustomizeItem) {
            let price = selectedCustomizeItem.price;
            selectedCustomizeItem.checkedCustoms.forEach(c => price += c.price);
            addPrice.innerText = `₹${price.toFixed(2)}`;
        }
    }

    // Slide-up Checkout Drawer Views
    renderCartDrawer(controllerState) {
        const root = document.getElementById("cart-drawer-content");
        if (root) {
            root.innerHTML = this.cartDrawerComponent.render(
                controllerState.customerBasket,
                controllerState.linkedLoyaltyCustomer,
                controllerState.redeemedPoints,
                controllerState.appliedCoupon,
                controllerState.selectedPayment,
                controllerState.selectedUPIBrand
            );
        }
    }

    openCartDrawer(controllerState) {
        this.renderCartDrawer(controllerState);
        const root = document.getElementById("cart-drawer-root");
        if (root) root.classList.add("open");
    }

    closeCartDrawer() {
        const root = document.getElementById("cart-drawer-root");
        if (root) root.classList.remove("open");
    }

    // Dynamic sticky floating cart bar overlays
    updateFloatingCartBar(customerBasket) {
        const banner = document.getElementById("floating-cart-banner");
        const countBadge = document.getElementById("floating-cart-badge-count");
        const priceLabel = document.getElementById("floating-cart-grand-total");
        if (!banner) return;

        const totalQty = customerBasket.reduce((sum, item) => sum + item.qty, 0);

        if (totalQty > 0) {
            let subtotal = 0;
            customerBasket.forEach(i => subtotal += (i.price * i.qty));
            
            // Grand Total (approx with 5% GST for fast floating rendering)
            const totalWithTax = subtotal * 1.05;

            if (countBadge) countBadge.innerText = totalQty;
            if (priceLabel) priceLabel.innerText = `₹${totalWithTax.toFixed(2)}`;
            banner.style.display = "flex";
        } else {
            banner.style.display = "none";
        }
    }

    updateLoyaltyWidgetUI(linkedLoyaltyCustomer, redeemedPoints) {
        const details = document.getElementById("loyalty-status-details");
        if (!details) return;
        
        if (linkedLoyaltyCustomer) {
            details.innerHTML = `
                <div style="color: var(--ios-text); text-align:left; font-size:0.85rem; line-height:1.45;">
                    <strong>Loyalty Account Linked!</strong><br>
                    Customer: <strong>${linkedLoyaltyCustomer.name}</strong><br>
                    Points Balance: <strong>${linkedLoyaltyCustomer.points} Points</strong> (Value: ₹${linkedLoyaltyCustomer.points})
                    <div style="margin-top: 0.6rem; display: flex; gap: 0.5rem; align-items: center;">
                        <input type="number" id="redeem-points-input" class="crm-input" style="padding: 0.35rem 0.5rem; width: 90px;" min="1" max="${linkedLoyaltyCustomer.points}" placeholder="Points" value="${redeemedPoints || ''}">
                        <button class="btn-crm-action" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="custCtrl.applyPointsRedemption()">Redeem</button>
                    </div>
                </div>
            `;
            details.style.display = "block";
        }
    }

    renderLoyaltyLookupNotLinked(phoneInput) {
        const details = document.getElementById("loyalty-status-details");
        if (!details) return;

        details.innerHTML = `
            <div style="color: var(--ios-text); text-align:left; font-size:0.85rem;">
                <strong>Mobile number ${phoneInput} not registered.</strong><br>
                <button class="btn-crm-action" style="margin-top: 0.6rem; font-size: 0.75rem; padding: 0.4rem 0.8rem;" onclick="custCtrl.registerNewCustomerLoyalty('${phoneInput}')">Quick Sign Up (Free)</button>
            </div>
        `;
        details.style.display = "block";
    }

    showLoyaltyLookupError(message) {
        const details = document.getElementById("loyalty-status-details");
        if (details) {
            details.innerHTML = `<span style="color: var(--ios-accent); font-weight:700; font-size:0.8rem;">${message}</span>`;
            details.style.display = "block";
        }
    }

    renderCouponMessage(coupon, message, success = true) {
        const details = document.getElementById("coupon-status-details");
        if (!details) return;

        details.innerText = message;
        details.style.color = success ? "var(--ios-green)" : "var(--ios-accent)";
        details.style.display = "block";
    }

    hideCouponMessage() {
        const details = document.getElementById("coupon-status-details");
        if (details) details.style.display = "none";
    }

    showMobileNotice(message) {
        const notice = document.createElement("div");
        notice.style.cssText = `
            position: fixed;
            bottom: calc(75px + var(--safe-bottom) + 65px);
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: rgba(255, 255, 255, 0.95);
            border: 1.5px solid var(--ios-accent);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            padding: 0.6rem 1.5rem;
            border-radius: 100px;
            color: var(--ios-text);
            z-index: 100000;
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        document.body.appendChild(notice);
        notice.innerText = message;

        // Trigger sliding animation
        setTimeout(() => {
            notice.style.opacity = "1";
            notice.style.transform = "translateX(-50%) translateY(0)";
        }, 50);

        setTimeout(() => {
            notice.style.opacity = "0";
            notice.style.transform = "translateX(-50%) translateY(-20px)";
            setTimeout(() => notice.remove(), 300);
        }, 2500);
    }

    selectPaymentMethod(mode) {
        const cardOpt = document.getElementById("pay-opt-card");
        const upiOpt = document.getElementById("pay-opt-upi");
        const counterOpt = document.getElementById("pay-opt-counter");
        const upiBrands = document.getElementById("upi-brands-container");

        if (cardOpt) cardOpt.classList.remove("selected");
        if (upiOpt) upiOpt.classList.remove("selected");
        if (counterOpt) counterOpt.classList.remove("selected");

        if (mode === "Card") {
            if (cardOpt) cardOpt.classList.add("selected");
            if (upiBrands) upiBrands.style.display = "none";
        } else if (mode === "UPI") {
            if (upiOpt) upiOpt.classList.add("selected");
            if (upiBrands) upiBrands.style.display = "block";
        } else if (mode === "Counter") {
            if (counterOpt) counterOpt.classList.add("selected");
            if (upiBrands) upiBrands.style.display = "none";
        }
    }

    selectUPIBrand(brand) {
        const gpay = document.getElementById("upi-brand-gpay");
        const paytm = document.getElementById("upi-brand-paytm");
        const phonepe = document.getElementById("upi-brand-phonepe");

        if (gpay) gpay.classList.remove("selected");
        if (paytm) paytm.classList.remove("selected");
        if (phonepe) phonepe.classList.remove("selected");
        
        const activeBrand = document.getElementById(`upi-brand-${brand.toLowerCase()}`);
        if (activeBrand) activeBrand.classList.add("selected");
    }

    switchTabActiveHighlight(activeTab) {
        document.querySelectorAll(".tab-item").forEach(btn => {
            btn.classList.remove("active");
        });
        const activeBtn = document.getElementById(`tab-nav-${activeTab}`);
        if (activeBtn) activeBtn.classList.add("active");
    }

    showUPIPaymentModal(grandTotal, upiUrl, onConfirm, onCancel) {
        // Remove existing if any
        const existing = document.getElementById("upi-payment-modal-root");
        if (existing) existing.remove();

        // Inject custom keyframes style for spinner if not present
        if (!document.getElementById("upi-modal-spinner-styles")) {
            const style = document.createElement("style");
            style.id = "upi-modal-spinner-styles";
            style.innerHTML = `
                @keyframes upi-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        const modal = document.createElement("div");
        modal.id = "upi-payment-modal-root";
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200000;
            padding: 1.5rem;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif;
        `;

        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

        modal.innerHTML = `
            <div id="upi-modal-card" style="
                background: #fff;
                border-radius: 20px;
                width: 100%;
                max-width: 380px;
                padding: 2rem;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                transform: scale(0.9);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-sizing: border-box;
            ">
                <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">⚡</div>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.3rem; font-weight: 700; color: #111;">Scan to Pay</h3>
                <p style="margin: 0 0 1.5rem 0; font-size: 0.85rem; color: #666; line-height: 1.4;">
                    Please scan the QR code below using GPay, PhonePe, or Paytm. The system will auto-verify once completed.
                </p>

                <!-- QR Code Box -->
                <div style="
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 15px;
                    display: inline-block;
                    margin-bottom: 1.25rem;
                    border: 1px dashed #ddd;
                ">
                    <img src="${qrCodeUrl}" alt="UPI QR Code" style="
                        width: 180px;
                        height: 180px;
                        display: block;
                    "/>
                </div>

                <div style="margin-bottom: 1.25rem;">
                    <span style="font-size: 0.8rem; color: #666; display: block; margin-bottom: 0.25rem;">Total Amount</span>
                    <span style="font-size: 2rem; font-weight: 800; color: var(--ios-accent, #d91b43);">₹${grandTotal.toFixed(2)}</span>
                </div>

                <!-- REAL-TIME STATUS AUTO-VERIFIER CARD -->
                <div id="upi-status-indicator" style="
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    color: #92400e;
                    padding: 0.85rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.6rem;
                    margin-bottom: 1.25rem;
                    transition: all 0.3s ease;
                ">
                    <span id="upi-status-spinner" style="
                        border: 2px solid #92400e;
                        border-top: 2px solid transparent;
                        border-radius: 50%;
                        width: 14px;
                        height: 14px;
                        display: inline-block;
                        animation: upi-spin 0.8s linear infinite;
                    "></span>
                    <span id="upi-status-text">Awaiting secure payment...</span>
                </div>

                <!-- Cancel Button -->
                <button id="upi-cancel-payment-btn" style="
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0.5rem;
                    transition: color 0.2s;
                ">Cancel & Go Back</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate open
        setTimeout(() => {
            modal.style.opacity = "1";
            const card = document.getElementById("upi-modal-card");
            if (card) card.style.transform = "scale(1)";
        }, 50);

        // Set up the auto-verification simulation timers
        let statusStage = 0;
        
        // Timer 1: Transition status text to show polling activity
        const pollingTimer = setTimeout(() => {
            const statusText = document.getElementById("upi-status-text");
            if (statusText) {
                statusText.innerText = "Verifying transaction with bank...";
            }
        }, 3000);

        // Timer 2: Perform the successful auto-verification
        const verificationTimer = setTimeout(() => {
            const indicator = document.getElementById("upi-status-indicator");
            const spinner = document.getElementById("upi-status-spinner");
            const statusText = document.getElementById("upi-status-text");

            if (indicator && statusText) {
                // Remove spinner and change to verified green tag
                if (spinner) spinner.remove();
                indicator.style.background = "#dcfce7";
                indicator.style.borderColor = "#bbf7d0";
                indicator.style.color = "#15803d";
                
                // Add green check emoji
                const check = document.createElement("span");
                check.innerText = "✅";
                indicator.insertBefore(check, statusText);

                statusText.innerText = "Payment verified! Redirecting...";
            }

            // Redirect automatically 1.5 seconds after verification success
            setTimeout(() => {
                modal.style.opacity = "0";
                const card = document.getElementById("upi-modal-card");
                if (card) card.style.transform = "scale(0.9)";
                setTimeout(() => {
                    modal.remove();
                    onConfirm();
                }, 300);
            }, 1500);

        }, 6000);

        // Abort handlers to clear all background loops if cancelled
        const clearTimers = () => {
            clearTimeout(pollingTimer);
            clearTimeout(verificationTimer);
        };

        document.getElementById("upi-cancel-payment-btn").onclick = () => {
            clearTimers();
            modal.style.opacity = "0";
            const card = document.getElementById("upi-modal-card");
            if (card) card.style.transform = "scale(0.9)";
            setTimeout(() => {
                modal.remove();
                onCancel();
            }, 300);
        };
    }
}
