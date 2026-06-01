/**
 * CategorySlider Component for Ganeshwaram Signature Customer Portal
 */

const CATEGORY_ICONS = {
    "All": "🍽 Menu",
    "Mains": "🍛 Mains",
    "Fusion Pizzas": "🍕 Pizzas",
    "Beverages": "🍹 Drinks",
    "Desserts": "🍮 Desserts"
};

export class CategorySlider {
    constructor(model) {
        this.model = model;
    }

    render(currentCategory) {
        const menu = this.model.getMenu();
        const categories = ["All", ...new Set(menu.map(item => item.category))];

        return categories.map(cat => {
            const iconLabel = CATEGORY_ICONS[cat] || `🍛 ${cat}`;
            const isActive = cat === currentCategory;
            
            // Custom premium inline overrides for active category matching screenshots
            const activeStyle = isActive 
                ? `background:#735c00; color:white; border-color:#735c00; box-shadow:0 4px 10px rgba(115,92,0,0.2);` 
                : `background:var(--ios-card); color:var(--ios-text-secondary);`;

            return `
                <button class="category-pill ${isActive ? 'active' : ''}" 
                        style="${activeStyle} font-family:'Inter', sans-serif;"
                        onclick="custCtrl.setCategoryFilter('${cat}')">
                    ${iconLabel}
                </button>
            `;
        }).join("");
    }
}
