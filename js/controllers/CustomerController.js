/**
 * RestoFlow Customer QR Mobile Portal Controller (Orchestrator Class)
 * Coordinates user transactions, custom dialogs, and slide-up cart drawers.
 */

export class CustomerController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Controller Local States
        this.currentTableId = 3;
        this.activeTab = "menu";
        this.selectedCustomizeItem = null;
        this.customerBasket = [];
        this.selectedPayment = "UPI";
        this.selectedUPIBrand = "GPay";
        
        this.linkedLoyaltyPhone = null;
        this.linkedLoyaltyCustomer = null;
        this.redeemedPoints = 0;
        this.appliedCoupon = null;

        // Listen for database changes to sync screens
        this.model.addEventListener("stateChange", (e) => {
            this.refreshActiveDashboardView();
        });
    }

    init() {
        // Extract table ID parameters from address bar query e.g. customer.html?table=5
        const urlParams = new URLSearchParams(window.location.search);
        const tableId = urlParams.get("table");
        if (tableId) {
            this.currentTableId = parseInt(tableId);
        }

        // Render basic shells
        this.view.renderHeader();
        this.view.renderActiveTabContent(this.activeTab, this);

        // Update floating cart bar overlay
        this.view.updateFloatingCartBar(this.customerBasket);
    }

    refreshActiveDashboardView() {
        this.view.renderHeader();
        this.view.renderActiveTabContent(this.activeTab, this);
        this.view.updateFloatingCartBar(this.customerBasket);
        
        // If checkout cart sheet is open, update details
        const cartDrawer = document.getElementById("cart-drawer-root");
        if (cartDrawer && cartDrawer.classList.contains("open")) {
            this.view.renderCartDrawer(this);
        }
    }

    // 1. Menu and Categories Filters
    setCategoryFilter(category) {
        this.currentCategory = category;
        this.view.renderCategorySlider(category);
        this.view.renderMenuItems(category);
    }

    handleMenuSearch() {
        const input = document.getElementById("menu-search-input");
        const val = input ? input.value : "";
        this.view.renderMenuItems(this.currentCategory || "All", val);
    }

    // 2. Customizations Sheet Drawers
    handleItemAddClick(itemId) {
        const menu = this.model.getMenu();
        const item = menu.find(i => i.id === itemId);
        if (!item) return;

        if (item.customizations && item.customizations.length > 0) {
            this.selectedCustomizeItem = { ...item, checkedCustoms: [] };
            this.view.showCustomizerSheet(this.selectedCustomizeItem);
        } else {
            this.addItemToBasketDirect(item);
        }
    }

    toggleCustomOption(idx) {
        if (!this.selectedCustomizeItem) return;
        const checkbox = document.getElementById(`cust-checkbox-${idx}`);
        if (!checkbox) return;
        
        checkbox.checked = !checkbox.checked;
        const custOption = this.selectedCustomizeItem.customizations[idx];
        
        if (checkbox.checked) {
            this.selectedCustomizeItem.checkedCustoms.push(custOption);
        } else {
            this.selectedCustomizeItem.checkedCustoms = this.selectedCustomizeItem.checkedCustoms.filter(o => o.name !== custOption.name);
        }

        this.view.updateCustomizerPrice(this.selectedCustomizeItem);
    }

    closeCustomizerSheet() {
        this.view.hideCustomizerSheet();
        this.selectedCustomizeItem = null;
    }

    addCustomizedItemToBasket() {
        if (!this.selectedCustomizeItem) return;
        const customsSummary = this.selectedCustomizeItem.checkedCustoms.map(c => c.name);
        const addedPrice = this.selectedCustomizeItem.checkedCustoms.reduce((acc, curr) => acc + curr.price, 0);

        const basketItem = {
            id: this.selectedCustomizeItem.id,
            name: this.selectedCustomizeItem.name,
            qty: 1,
            basePrice: this.selectedCustomizeItem.price,
            customizations: customsSummary,
            customizationsPrice: addedPrice,
            price: this.selectedCustomizeItem.price + addedPrice
        };

        const existing = this.customerBasket.find(i => 
            i.id === basketItem.id && 
            JSON.stringify(i.customizations.sort()) === JSON.stringify(basketItem.customizations.sort())
        );

        if (existing) {
            existing.qty++;
        } else {
            this.customerBasket.push(basketItem);
        }

        this.view.updateFloatingCartBar(this.customerBasket);
        this.closeCustomizerSheet();
        this.view.showMobileNotice("Added to Basket!");
    }

    addItemToBasketDirect(item) {
        const basketItem = {
            id: item.id,
            name: item.name,
            qty: 1,
            basePrice: item.price,
            customizations: [],
            customizationsPrice: 0,
            price: item.price
        };

        const existing = this.customerBasket.find(i => i.id === basketItem.id && i.customizations.length === 0);
        if (existing) {
            existing.qty++;
        } else {
            this.customerBasket.push(basketItem);
        }

        this.view.updateFloatingCartBar(this.customerBasket);
        this.view.showMobileNotice("Added to Basket!");
    }

    toggleFavorite(itemId, e) {
        this.view.toggleFavorite(itemId, e);
    }

    // 3. Slide-up Cart Drawer Actions
    openCartDrawer() {
        this.view.openCartDrawer(this);
    }

    closeCartDrawer() {
        this.view.closeCartDrawer();
    }

    adjustBasketItemQty(idx, change) {
        this.customerBasket[idx].qty += change;
        if (this.customerBasket[idx].qty <= 0) {
            this.customerBasket.splice(idx, 1);
        }
        this.view.updateFloatingCartBar(this.customerBasket);
        this.view.renderCartDrawer(this);
    }

    selectPaymentMethod(mode) {
        this.selectedPayment = mode;
        this.view.selectPaymentMethod(mode);
    }

    selectUPIBrand(brand) {
        this.selectedUPIBrand = brand;
        this.view.selectUPIBrand(brand);
    }

    submitCustomerOrder() {
        const btn = document.getElementById("btn-place-order");
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Processing UPI Secure Gate...";
        }

        let subtotal = 0;
        this.customerBasket.forEach(i => subtotal += (i.price * i.qty));

        let couponDiscount = 0;
        if (this.appliedCoupon) {
            if (this.appliedCoupon.type === "flat") {
                couponDiscount = this.appliedCoupon.value;
            } else if (this.appliedCoupon.type === "percent") {
                couponDiscount = subtotal * (this.appliedCoupon.value / 100);
            }
            couponDiscount = Math.min(couponDiscount, subtotal);
        }

        let maxPointsRedeemable = this.linkedLoyaltyCustomer ? this.linkedLoyaltyCustomer.points : 0;
        let loyaltyDiscountCap = Math.max(0, subtotal - couponDiscount);
        let activeLoyaltyDiscount = Math.min(this.redeemedPoints, maxPointsRedeemable, loyaltyDiscountCap);
        
        let netBase = Math.max(0, subtotal - couponDiscount - activeLoyaltyDiscount);
        let isGSTFree = this.appliedCoupon && this.appliedCoupon.type === "gstfree";
        let tax = isGSTFree ? 0 : netBase * 0.05;
        let grandTotal = netBase + tax;

        setTimeout(() => {
            if (this.linkedLoyaltyPhone && activeLoyaltyDiscount > 0) {
                this.model.redeemLoyaltyPoints(this.linkedLoyaltyPhone, activeLoyaltyDiscount);
            }

            this.model.createOrder({
                tableId: this.currentTableId,
                items: this.customerBasket,
                subtotal,
                couponDiscount,
                loyaltyDiscount: activeLoyaltyDiscount,
                couponCode: this.appliedCoupon ? this.appliedCoupon.code : null,
                phone: this.linkedLoyaltyPhone,
                tax,
                total: grandTotal,
                paymentMethod: this.selectedPayment === "UPI" ? `UPI (${this.selectedUPIBrand})` : "Credit Card",
                paymentStatus: "paid",
                orderType: "Dine-In"
            });

            this.customerBasket = [];
            this.linkedLoyaltyPhone = null;
            this.linkedLoyaltyCustomer = null;
            this.redeemedPoints = 0;
            this.appliedCoupon = null;

            this.closeCartDrawer();
            this.view.updateFloatingCartBar(this.customerBasket);
            
            if (btn) {
                btn.disabled = false;
                btn.innerText = "Confirm & Send Order to Kitchen";
            }

            this.view.showMobileNotice("Order placed securely! Sending to kitchen.");
            this.switchMobileView("orders");
        }, 1500);
    }

    // 4. CRM Customer Loyalty Operations
    checkLoyaltyAccount() {
        const input = document.getElementById("loyalty-phone-input");
        const phoneInput = input ? input.value.trim() : "";
        
        if (phoneInput.length !== 10 || isNaN(phoneInput)) {
            this.view.showLoyaltyLookupError("Please enter a valid 10-digit mobile number.");
            return;
        }
        
        const customer = this.model.getLoyaltyCustomer(phoneInput);
        
        if (customer) {
            this.linkedLoyaltyPhone = phoneInput;
            this.linkedLoyaltyCustomer = customer;
            this.view.updateLoyaltyWidgetUI(this.linkedLoyaltyCustomer, this.redeemedPoints);
            this.view.renderCartDrawer(this);
        } else {
            this.linkedLoyaltyPhone = phoneInput;
            this.linkedLoyaltyCustomer = null;
            this.view.renderLoyaltyLookupNotLinked(phoneInput);
        }
    }

    registerNewCustomerLoyalty(phone) {
        const newCustomer = this.model.registerLoyaltyCustomer(phone, "Guest Customer");
        this.linkedLoyaltyPhone = phone;
        this.linkedLoyaltyCustomer = newCustomer;
        
        this.view.updateLoyaltyWidgetUI(this.linkedLoyaltyCustomer, this.redeemedPoints);
        this.view.renderCartDrawer(this);
        this.view.showMobileNotice("Loyalty profile created! Links active.");
    }

    applyPointsRedemption() {
        const input = document.getElementById("redeem-points-input");
        const pointsVal = input ? parseInt(input.value) : 0;
        
        if (isNaN(pointsVal) || pointsVal <= 0) {
            this.redeemedPoints = 0;
            this.view.renderCartDrawer(this);
            return;
        }
        
        if (this.linkedLoyaltyCustomer && pointsVal > this.linkedLoyaltyCustomer.points) {
            alert(`You only have ${this.linkedLoyaltyCustomer.points} points. Cap applied.`);
            this.redeemedPoints = this.linkedLoyaltyCustomer.points;
        } else {
            this.redeemedPoints = pointsVal;
        }
        
        this.view.renderCartDrawer(this);
        this.view.showMobileNotice(`Redeemed ₹${this.redeemedPoints} from points!`);
    }

    applyCouponCode() {
        const input = document.getElementById("coupon-code-input");
        const code = input ? input.value.trim().toUpperCase() : "";
        
        if (!code) {
            this.appliedCoupon = null;
            this.view.hideCouponMessage();
            this.view.renderCartDrawer(this);
            return;
        }
        
        let subtotal = 0;
        this.customerBasket.forEach(i => subtotal += (i.price * i.qty));
        
        const coupon = this.model.verifyCoupon(code, subtotal);
        
        if (coupon) {
            this.appliedCoupon = coupon;
            this.view.renderCouponMessage(coupon, `Promo ${coupon.code} Applied! - ${coupon.desc}`, true);
            this.view.showMobileNotice(`Coupon ${code} applied successfully!`);
        } else {
            this.appliedCoupon = null;
            this.view.renderCouponMessage(null, "Invalid coupon code or minimum order amount not met.", false);
        }
        
        this.view.renderCartDrawer(this);
    }

    // 5. VIP Profile Sub-sections Controls
    setProfileSection(sec) {
        this.view.profileTabComponent.setSection(sec);
    }

    editPersonalProfile() {
        const newName = prompt("Enter your Full Name:", this.view.profileTabComponent.fullName);
        if (newName && newName.trim()) {
            this.view.profileTabComponent.fullName = newName.trim();
            
            const newEmail = prompt("Enter your Email Address:", this.view.profileTabComponent.email);
            if (newEmail && newEmail.trim()) {
                this.view.profileTabComponent.email = newEmail.trim();
            }
            
            const newDOB = prompt("Enter your Date of Birth:", this.view.profileTabComponent.dob);
            if (newDOB && newDOB.trim()) {
                this.view.profileTabComponent.dob = newDOB.trim();
            }

            this.refreshActiveDashboardView();
            this.view.showMobileNotice("Profile bio updated successfully!");
        }
    }

    // 6. Navigation Router Tab Switching
    switchMobileView(viewName) {
        this.activeTab = viewName;
        this.view.switchTabActiveHighlight(viewName);
        this.view.renderActiveTabContent(viewName, this);
    }
}
