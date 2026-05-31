/**
 * RestoFlow Customer QR Mobile Portal Controller
 */

let currentTableId = 3;
let currentCategory = "All";
let selectedCustomizeItem = null;
let customerBasket = [];
let selectedPayment = "UPI"; // Localized UPI-First Default
let selectedUPIBrand = "GPay"; // Default UPI App GPay
let selectedRating = 5;

// CRM & Coupon Local State
let linkedLoyaltyPhone = null;
let linkedLoyaltyCustomer = null;
let redeemedPoints = 0;
let appliedCoupon = null;

// Initializer
function initCustomerPortal() {
    // 1. Extract table parameters from address bar query e.g. customer.html?table=5
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get("table");
    if (tableId) {
        currentTableId = parseInt(tableId);
    }
    document.getElementById("table-number-badge").innerText = `Table ${currentTableId}`;

    // 2. Render initial menus and sliders
    renderCategorySlider();
    renderMenuItems();

    // 3. Load tracking and update counts
    updateBasketBadge();
    updateTrackingBadge();

    // 4. Register cross-window real-time listener
    window.addEventListener("restoflowStateChange", (e) => {
        if (e.detail.key === "restoflow_orders") {
            renderTrackingView();
            updateTrackingBadge();
        }
        if (e.detail.key === "restoflow_menu") {
            renderMenuItems();
        }
        if (e.detail.key === "restoflow_loyalty" && linkedLoyaltyPhone) {
            // Hot reload loyalty points if updated elsewhere
            const db = CoreState.getLoyaltyDatabase();
            if (db[linkedLoyaltyPhone]) {
                linkedLoyaltyCustomer = db[linkedLoyaltyPhone];
                updateLoyaltyWidgetUI();
            }
        }
    });
}

// 1. Categories & Menu Renderers
function renderCategorySlider() {
    const menu = CoreState.getMenu();
    const categories = ["All", ...new Set(menu.map(item => item.category))];
    
    const slider = document.getElementById("categories-tabs-slider");
    slider.innerHTML = categories.map(cat => `
        <button class="category-pill ${cat === currentCategory ? 'active' : ''}" 
                id="cat-pill-${cat.toLowerCase()}" 
                onclick="setCategoryFilter('${cat}')">
            ${cat}
        </button>
    `).join("");
}

function setCategoryFilter(category) {
    currentCategory = category;
    renderCategorySlider();
    renderMenuItems();
}

function renderMenuItems(filterQuery = "") {
    const menu = CoreState.getMenu();
    const container = document.getElementById("menu-items-sections-container");
    container.innerHTML = "";

    // Group items by category if currentCategory is "All", else show single category
    const categoriesToRender = currentCategory === "All" 
        ? [...new Set(menu.map(item => item.category))]
        : [currentCategory];

    categoriesToRender.forEach(cat => {
        let items = menu.filter(item => item.category === cat);
        
        // Apply search query filter if typing
        if (filterQuery) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(filterQuery.toLowerCase())
            );
        }

        if (items.length === 0) return;

        const section = document.createElement("div");
        section.className = "menu-section";
        section.innerHTML = `
            <h3 class="menu-section-title">${cat}</h3>
            <div class="menu-grid">
                ${items.map(item => `
                    <div class="menu-card" id="menu-card-${item.id}">
                        <div class="menu-card-details">
                            <div>
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                            </div>
                            <div class="menu-card-price">₹${item.price.toFixed(2)}</div>
                        </div>
                        <button class="menu-card-add" onclick="handleItemAddClick('${item.id}')">+</button>
                    </div>
                `).join("")}
            </div>
        `;
        container.appendChild(section);
    });

    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽</div>
                <p>No dishes matching your description found.</p>
            </div>
        `;
    }
}

function handleMenuSearch() {
    const val = document.getElementById("menu-search-input").value;
    renderMenuItems(val);
}

// 2. Customizations Bottom Sheet Handlers
function handleItemAddClick(itemId) {
    const menu = CoreState.getMenu();
    const item = menu.find(i => i.id === itemId);
    if (!item) return;

    if (item.customizations && item.customizations.length > 0) {
        // Open customizer sliding drawer
        selectedCustomizeItem = { ...item, checkedCustoms: [] };
        
        document.getElementById("cust-item-title").innerText = `Customize ${item.name}`;
        document.getElementById("cust-item-desc").innerText = item.description;
        
        const optsList = document.getElementById("cust-options-list");
        optsList.innerHTML = item.customizations.map((cust, idx) => `
            <div class="customization-option" onclick="toggleCustomOption(${idx})">
                <div>
                    <span style="font-weight:600; color:var(--ios-text);">${cust.name}</span>
                    ${cust.price > 0 ? `<span style="color:var(--ios-accent); font-size:0.85rem; margin-left:0.5rem;">+₹${cust.price.toFixed(2)}</span>` : ''}
                </div>
                <input type="checkbox" id="cust-checkbox-${idx}" onchange="event.stopPropagation(); toggleCustomOption(${idx})">
            </div>
        `).join("");

        updateCustomizerPrice();
        document.getElementById("customizer-sheet").classList.add("open");
    } else {
        // Add directly to basket without modal
        addItemToBasketDirect(item);
    }
}

function toggleCustomOption(idx) {
    const checkbox = document.getElementById(`cust-checkbox-${idx}`);
    if (!checkbox) return;
    
    // Toggle check state
    checkbox.checked = !checkbox.checked;
    
    const custOption = selectedCustomizeItem.customizations[idx];
    
    if (checkbox.checked) {
        selectedCustomizeItem.checkedCustoms.push(custOption);
    } else {
        selectedCustomizeItem.checkedCustoms = selectedCustomizeItem.checkedCustoms.filter(o => o.name !== custOption.name);
    }

    updateCustomizerPrice();
}

function updateCustomizerPrice() {
    let price = selectedCustomizeItem.price;
    selectedCustomizeItem.checkedCustoms.forEach(c => price += c.price);
    document.getElementById("cust-add-price").innerText = `₹${price.toFixed(2)}`;
}

function closeCustomizerSheet(e) {
    document.getElementById("customizer-sheet").classList.remove("open");
    selectedCustomizeItem = null;
}

function addCustomizedItemToBasket() {
    const customsSummary = selectedCustomizeItem.checkedCustoms.map(c => c.name);
    const addedPrice = selectedCustomizeItem.checkedCustoms.reduce((acc, curr) => acc + curr.price, 0);

    const basketItem = {
        id: selectedCustomizeItem.id,
        name: selectedCustomizeItem.name,
        qty: 1,
        basePrice: selectedCustomizeItem.price,
        customizations: customsSummary,
        customizationsPrice: addedPrice,
        price: selectedCustomizeItem.price + addedPrice
    };

    // Check if identical customization is already in basket to increment instead
    const existing = customerBasket.find(i => 
        i.id === basketItem.id && 
        JSON.stringify(i.customizations.sort()) === JSON.stringify(basketItem.customizations.sort())
    );

    if (existing) {
        existing.qty++;
    } else {
        customerBasket.push(basketItem);
    }

    updateBasketBadge();
    closeCustomizerSheet();
    showMobileNotice("Added to Basket!");
}

function addItemToBasketDirect(item) {
    const basketItem = {
        id: item.id,
        name: item.name,
        qty: 1,
        basePrice: item.price,
        customizations: [],
        customizationsPrice: 0,
        price: item.price
    };

    const existing = customerBasket.find(i => i.id === basketItem.id && i.customizations.length === 0);
    if (existing) {
        existing.qty++;
    } else {
        customerBasket.push(basketItem);
    }

    updateBasketBadge();
    showMobileNotice("Added to Basket!");
}

// 3. Basket / Cart Management Views
function renderBasketView() {
    const listContainer = document.getElementById("basket-items-list");
    listContainer.innerHTML = "";

    if (customerBasket.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>Your basket is currently empty.</p>
                <button class="btn-basket-action" onclick="switchMobileView('menu')" style="margin-top: 1rem;">View Dishes Menu</button>
            </div>
        `;
        document.getElementById("basket-pricing-card").style.display = "none";
        document.getElementById("customer-loyalty-widget").style.display = "none";
        document.getElementById("coupon-code-widget").style.display = "none";
        document.getElementById("payment-gateways-container").style.display = "none";
        return;
    }

    // Toggle loyalty/coupon widgets
    document.getElementById("customer-loyalty-widget").style.display = "block";
    document.getElementById("coupon-code-widget").style.display = "block";

    // Render items list
    listContainer.innerHTML = customerBasket.map((item, idx) => `
        <div class="basket-item">
            <div>
                <span style="font-weight: 700; color: var(--ios-text);">${item.name}</span>
                ${item.customizations.length > 0 ? `<p style="font-size: 0.75rem; color: var(--ios-accent); margin-top: 0.2rem;">${item.customizations.join(", ")}</p>` : ''}
                <div style="font-weight: 600; margin-top: 0.4rem; color: var(--ios-text-secondary); font-size: 0.85rem;">
                    ₹${item.price.toFixed(2)} each
                </div>
            </div>
            
            <div class="quantity-controller">
                <button class="qty-btn" onclick="adjustBasketItemQty(${idx}, -1)">-</button>
                <span class="qty-count">${item.qty}</span>
                <button class="qty-btn" onclick="adjustBasketItemQty(${idx}, 1)">+</button>
            </div>
        </div>
    `).join("");

    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    customerBasket.forEach(i => subtotal += (i.price * i.qty));

    // 1. Coupon Discount Calculation
    let couponDiscount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === "flat") {
            couponDiscount = appliedCoupon.value;
        } else if (appliedCoupon.type === "percent") {
            couponDiscount = subtotal * (appliedCoupon.value / 100);
        }
        couponDiscount = Math.min(couponDiscount, subtotal);
    }

    // 2. Loyalty Points Redemption Calculation
    let maxPointsRedeemable = linkedLoyaltyCustomer ? linkedLoyaltyCustomer.points : 0;
    let loyaltyDiscountCap = Math.max(0, subtotal - couponDiscount);
    let activeLoyaltyDiscount = Math.min(redeemedPoints, maxPointsRedeemable, loyaltyDiscountCap);
    
    // Auto-adjust state
    redeemedPoints = activeLoyaltyDiscount;

    let netBase = Math.max(0, subtotal - couponDiscount - activeLoyaltyDiscount);

    // 3. Indian GST (5% split into 2.5% CGST + 2.5% SGST)
    let isGSTFree = appliedCoupon && appliedCoupon.type === "gstfree";
    let tax = isGSTFree ? 0 : netBase * 0.05;
    let cgst = tax / 2;
    let sgst = tax / 2;

    let grandTotal = netBase + tax;

    // Display subtotals
    document.getElementById("summary-subtotal").innerText = `₹${subtotal.toFixed(2)}`;
    
    // Toggle coupon row
    const couponRow = document.getElementById("discount-coupon-row");
    if (couponDiscount > 0) {
        document.getElementById("summary-coupon-discount").innerText = `-₹${couponDiscount.toFixed(2)}`;
        couponRow.style.display = "flex";
    } else {
        couponRow.style.display = "none";
    }

    // Toggle loyalty row
    const loyaltyRow = document.getElementById("discount-loyalty-row");
    if (activeLoyaltyDiscount > 0) {
        document.getElementById("summary-loyalty-discount").innerText = `-₹${activeLoyaltyDiscount.toFixed(2)}`;
        loyaltyRow.style.display = "flex";
    } else {
        loyaltyRow.style.display = "none";
    }

    // Taxes & Totals
    document.getElementById("summary-cgst").innerText = `₹${cgst.toFixed(2)}`;
    document.getElementById("summary-sgst").innerText = `₹${sgst.toFixed(2)}`;
    document.getElementById("summary-total").innerText = `₹${grandTotal.toFixed(2)}`;

    document.getElementById("basket-pricing-card").style.display = "flex";
    document.getElementById("payment-gateways-container").style.display = "block";
}

function adjustBasketItemQty(idx, change) {
    customerBasket[idx].qty += change;
    if (customerBasket[idx].qty <= 0) {
        customerBasket.splice(idx, 1);
    }
    updateBasketBadge();
    renderBasketView();
}

function selectPaymentMethod(mode) {
    selectedPayment = mode;
    document.getElementById("pay-opt-card").classList.remove("selected");
    document.getElementById("pay-opt-upi").classList.remove("selected");
    
    const upiBrands = document.getElementById("upi-brands-container");

    if (mode === "Card") {
        document.getElementById("pay-opt-card").classList.add("selected");
        if (upiBrands) upiBrands.style.display = "none";
    } else {
        document.getElementById("pay-opt-upi").classList.add("selected");
        if (upiBrands) upiBrands.style.display = "block";
    }
}

function selectUPIBrand(brand) {
    selectedUPIBrand = brand;
    document.getElementById("upi-brand-gpay").classList.remove("selected");
    document.getElementById("upi-brand-paytm").classList.remove("selected");
    document.getElementById("upi-brand-phonepe").classList.remove("selected");
    
    document.getElementById(`upi-brand-${brand.toLowerCase()}`).classList.add("selected");
}

function submitCustomerOrder() {
    const btn = document.getElementById("btn-place-order");
    btn.disabled = true;
    btn.innerText = "Processing UPI Secure Gate...";

    // Recalculate totals
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
    let grandTotal = netBase + tax;

    setTimeout(() => {
        // Deduct loyalty points from main CRM DB
        if (linkedLoyaltyPhone && activeLoyaltyDiscount > 0) {
            CoreState.redeemLoyaltyPoints(linkedLoyaltyPhone, activeLoyaltyDiscount);
        }

        // Call core-state to register new order
        CoreState.createOrder({
            tableId: currentTableId,
            items: customerBasket,
            subtotal,
            couponDiscount,
            loyaltyDiscount: activeLoyaltyDiscount,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            phone: linkedLoyaltyPhone,
            tax,
            total: grandTotal,
            paymentMethod: selectedPayment === "UPI" ? `UPI (${selectedUPIBrand})` : "Credit Card",
            paymentStatus: "paid", // Instantly simulated as paid upon secure transaction checkout
            orderType: "Dine-In"
        });

        // Clean cart and reset loyalty states
        customerBasket = [];
        linkedLoyaltyPhone = null;
        linkedLoyaltyCustomer = null;
        redeemedPoints = 0;
        appliedCoupon = null;

        // Reset form inputs
        document.getElementById("loyalty-phone-input").value = "";
        document.getElementById("loyalty-status-details").style.display = "none";
        document.getElementById("coupon-code-input").value = "";
        document.getElementById("coupon-status-details").style.display = "none";

        updateBasketBadge();
        updateTrackingBadge();
        
        btn.disabled = false;
        btn.innerText = "Confirm & Send Order to Kitchen";

        showMobileNotice("Order placed securely! Sending to kitchen.");
        switchMobileView("tracking");
    }, 1500);
}

// 4. Live Tracking Status View
function renderTrackingView() {
    const container = document.getElementById("active-tracking-cards");
    container.innerHTML = "";

    const orders = CoreState.getOrders().filter(o => 
        o.tableId === currentTableId && 
        o.status !== "completed"
    );

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏱</div>
                <p>No active orders are being cooked for Table ${currentTableId}.</p>
                <button class="btn-basket-action" onclick="switchMobileView('menu')" style="margin-top: 1rem;">Order Fresh Food</button>
            </div>
        `;
        return;
    }

    // Loop through each active order and build status timelines
    container.innerHTML = orders.map(order => {
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
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:0.75rem; text-align:left; margin-bottom:1.5rem;">
                    ${order.items.map(i => `
                        <div style="font-size:0.85rem; display:flex; justify-content:space-between; margin-bottom:0.25rem;">
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
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--ios-text-secondary); margin-top:0.5rem; padding:0 0.5rem;">
                    <span>Received</span>
                    <span>Cooking</span>
                    <span>Ready</span>
                    <span>Served</span>
                </div>
            </div>
        `;
    }).join("");
}

// 5. Ratings & Feedback Views
function selectFeedbackFace(rating) {
    selectedRating = rating;
    document.querySelectorAll(".rating-face").forEach(f => f.classList.remove("active"));
    document.getElementById(`face-${rating}`).classList.add("active");
}

function submitCustomerFeedback() {
    const comments = document.getElementById("feedback-comments").value;
    
    CoreState.addFeedback({
        rating: selectedRating,
        comments,
        tableId: currentTableId
    });

    // Reset feedback
    document.getElementById("feedback-comments").value = "";
    selectFeedbackFace(5);

    showMobileNotice("Thank you for your rating!");
    switchMobileView("menu");
}

// UI Toggles & Tab Navigation Helpers
function switchMobileView(viewName) {
    // 1. Hide all views
    document.querySelectorAll(".mobile-view").forEach(view => {
        view.style.display = "none";
    });

    // 2. Remove active state from nav buttons
    document.querySelectorAll(".tab-item").forEach(btn => {
        btn.classList.remove("active");
    });

    // 3. Display current view and set button active
    if (viewName === 'menu') {
        document.getElementById("view-menu").style.display = "block";
        document.getElementById("tab-nav-menu").classList.add("active");
        renderMenuItems();
    } else if (viewName === 'basket') {
        document.getElementById("view-basket").style.display = "block";
        document.getElementById("tab-nav-basket").classList.add("active");
        renderBasketView();
    } else if (viewName === 'tracking') {
        document.getElementById("view-tracking").style.display = "block";
        document.getElementById("tab-nav-tracking").classList.add("active");
        renderTrackingView();
    } else if (viewName === 'feedback') {
        document.getElementById("view-feedback").style.display = "block";
        document.getElementById("tab-nav-feedback").classList.add("active");
    }
}

function updateBasketBadge() {
    const totalQty = customerBasket.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById("basket-badge-count");
    if (totalQty > 0) {
        badge.innerText = totalQty;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function updateTrackingBadge() {
    const activeOrders = CoreState.getOrders().filter(o => 
        o.tableId === currentTableId && 
        o.status !== "completed"
    );
    const badge = document.getElementById("tracking-badge-count");
    if (activeOrders.length > 0) {
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

// Floating Mobile Action Notice Pop-up (toast equivalent)
function showMobileNotice(message) {
    const notice = document.createElement("div");
    notice.style.cssText = `
        position: fixed;
        bottom: 90px;
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

/* --- LOYALTY CRM & promo COUPONS UTILITY --- */
function updateLoyaltyWidgetUI() {
    const details = document.getElementById("loyalty-status-details");
    if (!details) return;
    
    if (linkedLoyaltyCustomer) {
        details.innerHTML = `
            <div style="color: var(--ios-text);">
                <strong>Loyalty Account Linked!</strong><br>
                Customer: <strong>${linkedLoyaltyCustomer.name}</strong><br>
                Points Balance: <strong>${linkedLoyaltyCustomer.points} Points</strong> (Value: ₹${linkedLoyaltyCustomer.points})
                <div style="margin-top: 0.6rem; display: flex; gap: 0.5rem; align-items: center;">
                    <input type="number" id="redeem-points-input" class="crm-input" style="padding: 0.35rem 0.5rem; width: 90px;" min="1" max="${linkedLoyaltyCustomer.points}" placeholder="Points" value="${redeemedPoints || ''}">
                    <button class="btn-crm-action" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="applyPointsRedemption()">Redeem</button>
                </div>
            </div>
        `;
        details.style.display = "block";
    }
}

function checkLoyaltyAccount() {
    const phoneInput = document.getElementById("loyalty-phone-input").value.trim();
    const details = document.getElementById("loyalty-status-details");
    
    if (phoneInput.length !== 10 || isNaN(phoneInput)) {
        details.innerHTML = `<span style="color: var(--ios-accent); font-weight:700;">Please enter a valid 10-digit mobile number.</span>`;
        details.style.display = "block";
        return;
    }
    
    const customer = CoreState.getLoyaltyCustomer(phoneInput);
    
    if (customer) {
        linkedLoyaltyPhone = phoneInput;
        linkedLoyaltyCustomer = customer;
        updateLoyaltyWidgetUI();
        calculateTotals();
    } else {
        // Offer quick registration
        linkedLoyaltyPhone = phoneInput;
        linkedLoyaltyCustomer = null;
        details.innerHTML = `
            <div style="color: var(--ios-text);">
                <strong>Mobile number ${phoneInput} not registered.</strong><br>
                <button class="btn-crm-action" style="margin-top: 0.6rem; font-size: 0.75rem; padding: 0.4rem 0.8rem;" onclick="registerNewCustomerLoyalty('${phoneInput}')">Quick Sign Up (Free)</button>
            </div>
        `;
        details.style.display = "block";
    }
}

function registerNewCustomerLoyalty(phone) {
    // Standard quick registration under guest
    const newCustomer = CoreState.registerLoyaltyCustomer(phone, "Guest Customer");
    linkedLoyaltyPhone = phone;
    linkedLoyaltyCustomer = newCustomer;
    
    updateLoyaltyWidgetUI();
    calculateTotals();
    showMobileNotice("Loyalty profile created! Links active.");
}

function applyPointsRedemption() {
    const pointsVal = parseInt(document.getElementById("redeem-points-input").value);
    
    if (isNaN(pointsVal) || pointsVal <= 0) {
        redeemedPoints = 0;
        calculateTotals();
        return;
    }
    
    if (linkedLoyaltyCustomer && pointsVal > linkedLoyaltyCustomer.points) {
        alert(`You only have ${linkedLoyaltyCustomer.points} points. Cap applied.`);
        redeemedPoints = linkedLoyaltyCustomer.points;
    } else {
        redeemedPoints = pointsVal;
    }
    
    calculateTotals();
    showMobileNotice(`Redeemed ₹${redeemedPoints} from points!`);
}

function applyCouponCode() {
    const code = document.getElementById("coupon-code-input").value.trim().toUpperCase();
    const details = document.getElementById("coupon-status-details");
    
    if (!code) {
        appliedCoupon = null;
        details.style.display = "none";
        calculateTotals();
        return;
    }
    
    let subtotal = 0;
    customerBasket.forEach(i => subtotal += (i.price * i.qty));
    
    const coupon = CoreState.verifyCoupon(code, subtotal);
    
    if (coupon) {
        appliedCoupon = coupon;
        details.innerText = `Promo ${coupon.code} Applied! - ${coupon.desc}`;
        details.style.color = "var(--ios-green)";
        details.style.display = "block";
        showMobileNotice(`Coupon ${code} applied successfully!`);
    } else {
        appliedCoupon = null;
        details.innerText = "Invalid coupon code or minimum order amount not met.";
        details.style.color = "var(--ios-accent)";
        details.style.display = "block";
    }
    
    calculateTotals();
}

// Onload launcher
window.addEventListener("load", () => {
    initCustomerPortal();
});
