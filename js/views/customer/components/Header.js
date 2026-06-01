/**
 * Header Component for Ganeshwaram Signature Customer Portal
 */

export class Header {
    render() {
        return `
            <div class="header-top" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <button class="nav-hamburger-btn" style="background:transparent; border:none; font-size:1.35rem; color:var(--ios-text); cursor:pointer;" onclick="custCtrl.switchMobileView('profile')">
                    ☰
                </button>
                <div class="brand-label" style="font-family:'Playfair Display', serif; font-size:1.6rem; font-weight:700; color:var(--ios-text); letter-spacing:-0.01em;">
                    Ganeshwaram
                </div>
                <div class="avatar-profile-header" style="cursor:pointer;" onclick="custCtrl.switchMobileView('profile')">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Avatar" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:2.5px solid var(--ios-card); box-shadow:0 2px 8px rgba(115,92,0,0.15);">
                </div>
            </div>
        `;
    }
}
