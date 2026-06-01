/**
 * MenuSection Component for Ganeshwaram Signature Customer Portal
 */

const FOOD_IMAGES = {
    "m1": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600",
    "m2": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=600",
    "m3": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    "m4": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600",
    "m5": "https://images.unsplash.com/photo-1571006682887-f13c63968600?auto=format&fit=crop&q=80&w=600",
    "m6": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600",
    "m7": "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600"
};

// Map items to standard badges matching screens
const ITEM_BADGES = {
    "m1": { class: "recommended", label: "Recommended" },
    "m2": { class: "popular", label: "Popular" },
    "m3": { class: "popular", label: "Popular" },
    "m4": { class: "recommended", label: "Recommended" }
};

export class MenuSection {
    constructor(model) {
        this.model = model;
        this.favorites = JSON.parse(localStorage.getItem("customer_favorites")) || [];
    }

    toggleFavorite(itemId, e) {
        if (e) e.stopPropagation();
        
        const idx = this.favorites.indexOf(itemId);
        if (idx !== -1) {
            this.favorites.splice(idx, 1);
        } else {
            this.favorites.push(itemId);
        }
        localStorage.setItem("customer_favorites", JSON.stringify(this.favorites));
        
        // Redraw menu items to update heart icon immediately
        const heart = document.getElementById(`heart-icon-${itemId}`);
        const btn = document.getElementById(`fav-btn-${itemId}`);
        if (heart && btn) {
            const isFav = this.favorites.includes(itemId);
            heart.innerText = isFav ? "♥" : "♡";
            if (isFav) {
                btn.classList.add("active");
                btn.style.color = "var(--ios-accent)";
                btn.style.borderColor = "rgba(176,42,91,0.3)";
            } else {
                btn.classList.remove("active");
                btn.style.color = "";
                btn.style.borderColor = "";
            }
        }
    }

    render(currentCategory, filterQuery = "") {
        const menu = this.model.getMenu();
        
        const categoriesToRender = currentCategory === "All" 
            ? [...new Set(menu.map(item => item.category))]
            : [currentCategory];

        let html = `
            <!-- Top title row matching reference images -->
            <div class="chef-sig-title-row">
                <div class="chef-sig-header">
                    <h3>Chef's Signature Selection</h3>
                    <p>Handcrafted luxury on a plate</p>
                </div>
                <a href="#" class="view-all-link" onclick="event.preventDefault(); custCtrl.setCategoryFilter('All')">
                    View All <span style="font-size: 1rem;">➔</span>
                </a>
            </div>
            
            <div style="padding: 0 1rem;">
        `;

        let totalItemsRendered = 0;

        categoriesToRender.forEach(cat => {
            let items = menu.filter(item => item.category === cat);
            
            // Search filters
            if (filterQuery) {
                items = items.filter(item => 
                    item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    item.description.toLowerCase().includes(filterQuery.toLowerCase())
                );
            }

            items.forEach(item => {
                totalItemsRendered++;
                const imgUrl = item.image || FOOD_IMAGES[item.id] || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600";
                
                // Badges
                const badgeInfo = ITEM_BADGES[item.id];
                const badgeHtml = badgeInfo 
                    ? `<span class="food-badge ${badgeInfo.class}">${badgeInfo.label}</span>` 
                    : ``;

                // Favorites check
                const isFav = this.favorites.includes(item.id);
                const favClass = isFav ? "active" : "";
                const favStyle = isFav 
                    ? `color:var(--ios-accent); border-color:rgba(176,42,91,0.3); background:rgba(176,42,91,0.05);`
                    : ``;

                // Convert Price to Dollars / Rupees dynamically ($1 = ₹80 mock representation)
                const priceDollars = (item.price / 30).toFixed(2);

                html += `
                    <!-- Premium Luxury Food Card -->
                    <div class="premium-food-card" id="menu-card-${item.id}">
                        <div class="card-img-container">
                            <img src="${imgUrl}" alt="${item.name}">
                            <div class="card-badges-row">
                                <span class="food-badge veg">Veg</span>
                                ${badgeHtml}
                            </div>
                        </div>
                        <div class="card-info">
                            <div class="card-title-price">
                                <h4>${item.name}</h4>
                                <span class="price-tag">₹${item.price.toFixed(2)}</span>
                            </div>
                            <p class="card-desc">${item.description}</p>
                            <div class="card-actions-row">
                                <button class="btn-card-add" onclick="custCtrl.handleItemAddClick('${item.id}')">
                                    Add to Cart
                                </button>
                                <button class="fav-btn ${favClass}" id="fav-btn-${item.id}" style="${favStyle}" onclick="custCtrl.toggleFavorite('${item.id}', event)">
                                    <span id="heart-icon-${item.id}">${isFav ? '♥' : '♡'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        });

        html += `</div>`;

        if (totalItemsRendered === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🍽</div>
                    <p>No premium delicacies matching your criteria found.</p>
                </div>
            `;
        }

        return html;
    }
}
