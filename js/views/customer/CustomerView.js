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
}
