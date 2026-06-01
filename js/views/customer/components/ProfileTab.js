/**
 * ProfileTab Component for Ganeshwaram Signature Customer Portal
 */

export class ProfileTab {
    constructor(model) {
        this.model = model;
        
        // Local form state mockups
        this.fullName = "Arjun Raghavan";
        this.email = "arjun.r@premiumdiner.com";
        this.phone = "+91 98765 43210";
        this.dob = "October 24, 1985";
        
        this.activeSection = "personal"; // personal, payment, address, history
    }

    setSection(sec) {
        this.activeSection = sec;
        custCtrl.refreshActiveDashboardView();
    }

    render() {
        return `
            <div style="padding: 0 1rem; margin-top: 1rem;">
                
                <!-- VIP Profile Card -->
                <div class="vip-profile-card">
                    <div class="avatar-container">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Arjun Raghavan" class="avatar-circle">
                        <div class="avatar-edit-overlay">✎</div>
                    </div>
                    <h3 style="font-family:'Playfair Display', serif; font-size:1.6rem; font-weight:700; color:var(--ios-text);">${this.fullName}</h3>
                    <div class="profile-vip-tier">👑 Ganeshwaram Gold</div>
                    <p class="profile-subtext">Platinum Diner since 2021</p>
                    
                    <div class="points-metrics-grid">
                        <div class="point-metric-box">
                            <h6>Loyalty Balance</h6>
                            <div>12,450 pts</div>
                        </div>
                        <div class="point-metric-box">
                            <h6>Next Reward</h6>
                            <div>550 pts left</div>
                        </div>
                    </div>
                </div>

                <!-- Upgrade to Diamond Metallic Banner -->
                <div class="upgrade-banner-card">
                    <h4>Upgrade to Diamond</h4>
                    <p>Unlock priority reservations and exclusive chef's table invites.</p>
                    <button class="btn-upgrade-action" onclick="alert('Congratulations! Request submitted for VIP Diamond upgrade.')">
                        View Benefits
                    </button>
                </div>

                <!-- Profile Menu list selectors -->
                <div class="profile-menu-group">
                    <div class="profile-menu-item ${this.activeSection === 'personal' ? 'active' : ''}" onclick="custCtrl.setProfileSection('personal')">
                        <div class="profile-menu-left">
                            <span class="icon">👤</span> Personal Information
                        </div>
                        <span class="profile-menu-right">➔</span>
                    </div>
                    <div class="profile-menu-item ${this.activeSection === 'payment' ? 'active' : ''}" onclick="custCtrl.setProfileSection('payment')">
                        <div class="profile-menu-left">
                            <span class="icon">💳</span> Payment Methods
                        </div>
                        <span class="profile-menu-right">➔</span>
                    </div>
                    <div class="profile-menu-item ${this.activeSection === 'address' ? 'active' : ''}" onclick="custCtrl.setProfileSection('address')">
                        <div class="profile-menu-left">
                            <span class="icon">📍</span> Address Book
                        </div>
                        <span class="profile-menu-right">➔</span>
                    </div>
                    <div class="profile-menu-item ${this.activeSection === 'history' ? 'active' : ''}" onclick="custCtrl.setProfileSection('history')">
                        <div class="profile-menu-left">
                            <span class="icon">📜</span> Order History
                        </div>
                        <span class="profile-menu-right">➔</span>
                    </div>
                    <div class="profile-menu-item" style="border-top: 1px solid var(--ios-border);" onclick="alert('Successfully signed out Arjun Raghavan profile.')">
                        <div class="profile-menu-left" style="color:var(--ios-accent);">
                            <span class="icon" style="color:var(--ios-accent);">🚪</span> Sign Out
                        </div>
                        <span class="profile-menu-right"></span>
                    </div>
                </div>

                <!-- Dynamic Forms / Inner Sections based on activeSection -->
                ${this.renderActiveSectionContent()}

            </div>
        `;
    }

    renderActiveSectionContent() {
        if (this.activeSection === 'personal') {
            return `
                <!-- Personal Info Card -->
                <div class="summary-card" style="margin-bottom:2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--ios-border); padding-bottom:0.5rem;">
                        <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--ios-text);">Personal Information</h4>
                        <button style="background:transparent; border:none; color:var(--ios-accent); font-weight:700; font-size:0.85rem; cursor:pointer;" onclick="custCtrl.editPersonalProfile()">Edit</button>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.85rem; text-align:left; font-size:0.85rem;">
                        <div>
                            <div style="font-weight:700; color:var(--ios-text-secondary); font-size:0.7rem; text-transform:uppercase; margin-bottom:0.15rem;">Full Name</div>
                            <div style="font-weight:600; color:var(--ios-text);">${this.fullName}</div>
                        </div>
                        <div>
                            <div style="font-weight:700; color:var(--ios-text-secondary); font-size:0.7rem; text-transform:uppercase; margin-bottom:0.15rem;">Email Address</div>
                            <div style="font-weight:600; color:var(--ios-text);">${this.email}</div>
                        </div>
                        <div>
                            <div style="font-weight:700; color:var(--ios-text-secondary); font-size:0.7rem; text-transform:uppercase; margin-bottom:0.15rem;">Phone Number</div>
                            <div style="font-weight:600; color:var(--ios-text);">${this.phone}</div>
                        </div>
                        <div>
                            <div style="font-weight:700; color:var(--ios-text-secondary); font-size:0.7rem; text-transform:uppercase; margin-bottom:0.15rem;">Date of Birth</div>
                            <div style="font-weight:600; color:var(--ios-text);">${this.dob}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (this.activeSection === 'payment') {
            return `
                <!-- Payment Methods Card -->
                <div class="summary-card" style="margin-bottom:2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--ios-border); padding-bottom:0.5rem;">
                        <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--ios-text);">Payment Methods</h4>
                        <button style="background:var(--ios-accent); border:none; color:white; font-weight:700; font-size:0.75rem; padding:0.35rem 0.75rem; border-radius:6px; cursor:pointer;" onclick="alert('Adding credit card setup...')">+ Add New</button>
                    </div>
                    
                    <!-- VISA mockup credit card -->
                    <div class="visa-mockup-box">
                        <div class="visa-row-top">
                            <div class="visa-chip"></div>
                            <div class="visa-logo">VISA</div>
                        </div>
                        <div class="visa-row-bottom">
                            <div class="visa-numbers">•••• •••• •••• 4242</div>
                            <div class="visa-expiry">Expires 09/28</div>
                        </div>
                    </div>

                    <!-- UPI Mock Link button -->
                    <button class="upi-link-btn" onclick="alert('Link UPI profile...')">
                        <span style="font-size:1.1rem; font-weight:700;">+</span> Link UPI ID
                    </button>
                </div>
            `;
        }

        if (this.activeSection === 'address') {
            return `
                <!-- Address Book -->
                <div class="summary-card" style="margin-bottom:2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--ios-border); padding-bottom:0.5rem;">
                        <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--ios-text);">Address Book</h4>
                        <button style="background:var(--ios-accent); border:none; color:white; font-weight:700; font-size:0.75rem; padding:0.35rem 0.75rem; border-radius:6px; cursor:pointer;" onclick="alert('Add address overlay...')">+ Add New</button>
                    </div>
                    <div style="font-size:0.85rem; text-align:left; line-height:1.5;">
                        <div style="font-weight:700; color:var(--ios-text);">🏠 Primary Home</div>
                        <p style="color:var(--ios-text-secondary); margin-top:0.25rem;">Flat 402, Signature Elite Tower B, Bandra West, Mumbai, MH - 400050</p>
                    </div>
                </div>
            `;
        }

        if (this.activeSection === 'history') {
            return `
                <!-- Recent Order History -->
                <div class="summary-card" style="margin-bottom:2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; border-bottom:1px solid var(--ios-border); padding-bottom:0.5rem;">
                        <h4 style="font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:var(--ios-text);">Recent Order History</h4>
                        <a href="#" style="color:#735c00; font-weight:700; font-size:0.8rem; text-decoration:none;" onclick="event.preventDefault(); alert('Loading order archives...')">View All</a>
                    </div>
                    
                    <div class="invoice-history-list">
                        <!-- Invoice item 1 -->
                        <div class="invoice-card">
                            <img src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=200" alt="Tandoori Platter" class="invoice-card-img">
                            <div class="invoice-details">
                                <span class="order-num">#ORD-998231</span>
                                <h5>Tandoori Platter & Saffron Rice</h5>
                                <p class="meta">May 12, 2024 • 2 items</p>
                            </div>
                            <div class="invoice-card-right">
                                <span class="invoice-card-price">₹1,850</span>
                                <span class="invoice-status-badge delivered">Delivered</span>
                            </div>
                        </div>

                        <!-- Invoice item 2 -->
                        <div class="invoice-card">
                            <img src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200" alt="Royal Thali" class="invoice-card-img">
                            <div class="invoice-details">
                                <span class="order-num">#ORD-997544</span>
                                <h5>Ganeshwaram Royal Thali</h5>
                                <p class="meta">April 28, 2024 • 1 item</p>
                            </div>
                            <div class="invoice-card-right">
                                <span class="invoice-card-price">₹1,200</span>
                                <span class="invoice-status-badge delivered">Delivered</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return ``;
    }
}
