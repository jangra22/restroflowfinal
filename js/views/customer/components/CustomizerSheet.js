/**
 * CustomizerSheet Component for Ganeshwaram Signature Customer Portal
 */

export class CustomizerSheet {
    render(selectedCustomizeItem) {
        if (!selectedCustomizeItem) return "";

        let price = selectedCustomizeItem.price;
        selectedCustomizeItem.checkedCustoms.forEach(c => price += c.price);

        return `
            <div class="ios-sheet-content" onclick="event.stopPropagation()">
                <div class="ios-sheet-handle"></div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h4 class="ios-sheet-title" style="margin-bottom:0;" id="cust-item-title">Customize ${selectedCustomizeItem.name}</h4>
                    <button style="background:transparent; border:none; font-size:1.5rem; cursor:pointer; color:var(--ios-text-secondary);" onclick="custCtrl.closeCustomizerSheet()">&times;</button>
                </div>
                <p class="ios-sheet-desc" id="cust-item-desc">${selectedCustomizeItem.description}</p>
                
                <div class="custom-section-title">Add-ons & Variations</div>
                <div id="cust-options-list">
                    ${selectedCustomizeItem.customizations.map((cust, idx) => {
                        const isChecked = selectedCustomizeItem.checkedCustoms.some(c => c.name === cust.name);
                        return `
                            <div class="customization-option" onclick="custCtrl.toggleCustomOption(${idx})">
                                <div>
                                    <span style="font-weight:600; color:var(--ios-text);">${cust.name}</span>
                                    ${cust.price > 0 ? `<span style="color:var(--ios-accent); font-size:0.85rem; margin-left:0.5rem;">+₹${cust.price.toFixed(2)}</span>` : ''}
                                </div>
                                <input type="checkbox" id="cust-checkbox-${idx}" ${isChecked ? 'checked' : ''} onchange="event.stopPropagation(); custCtrl.toggleCustomOption(${idx})">
                            </div>
                        `;
                    }).join("")}
                </div>

                <button class="btn-basket-action" id="btn-add-customized-basket" onclick="custCtrl.addCustomizedItemToBasket()">
                    Add to Basket - <span id="cust-add-price">₹${price.toFixed(2)}</span>
                </button>
            </div>
        `;
    }
}
