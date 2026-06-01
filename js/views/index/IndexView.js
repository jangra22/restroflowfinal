/**
 * RestoFlow Landing Page View
 * Manages responsive design animations, mockups switcher display, demo modals, and custom elegant toasts.
 */

const MOCKUP_DATA = {
    customer: {
        title: "Mobile Customer QR App View",
        desc: "Simulate scanning a table QR code. Access a rich digital menu, customize burger layers or pizza toppings, view prices, place dine-in/takeaway orders, and complete checkouts. Works seamlessly on iOS & Android browsers.",
        btnText: "Launch Customer Mobile Portal",
        url: "customer.html"
    },
    pos: {
        title: "Merchant Admin & Billing POS",
        desc: "Experience a fully-secured restaurant management terminal. Process orders, view real-time table statuses, dispatch cooking stages on the Kitchen KOT monitor, manage raw inventory logs, and view detailed SVG sales reports.",
        btnText: "Launch Merchant POS Dashboard",
        url: "pos.html"
    }
};

export class IndexView {
    constructor() {
        this.addToastKeyframeStyle();
        this.bindNavLinks();
    }

    bindNavLinks() {
        document.querySelectorAll("#main-navigation a").forEach(link => {
            link.addEventListener("click", () => {
                this.closeMobileMenu();
            });
        });
    }

    toggleMobileMenu() {
        const nav = document.getElementById("main-navigation");
        const btn = document.getElementById("mobile-menu-btn");
        if (nav && btn) {
            nav.classList.toggle("mobile-open");
            btn.classList.toggle("active");
            
            if (nav.classList.contains("mobile-open")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        }
    }

    closeMobileMenu() {
        const nav = document.getElementById("main-navigation");
        const btn = document.getElementById("mobile-menu-btn");
        if (nav && btn && nav.classList.contains("mobile-open")) {
            nav.classList.remove("mobile-open");
            btn.classList.remove("active");
            document.body.style.overflow = "";
        }
    }

    switchMockup(portal) {
        // Update active tab buttons
        document.querySelectorAll(".mockup-tab").forEach(tab => {
            tab.classList.remove("active");
        });
        
        const custBtn = document.getElementById("tab-btn-customer");
        const posBtn = document.getElementById("tab-btn-pos");
        if (portal === 'customer') {
            if (custBtn) custBtn.classList.add("active");
        } else {
            if (posBtn) posBtn.classList.add("active");
        }

        // Apply fade transition to mockup container
        const screen = document.getElementById("mockup-screen");
        if (!screen) return;
        
        screen.style.opacity = "0";
        screen.style.transform = "scale(0.98)";
        
        setTimeout(() => {
            const data = MOCKUP_DATA[portal];
            
            // Render updated content
            screen.innerHTML = `
                <div class="mockup-iframe-overlay" style="animation: fadeIn 0.4s ease-out forwards;">
                    <h3>${data.title}</h3>
                    <p>${data.desc}</p>
                    <a href="${data.url}" target="_blank" class="btn btn-primary" id="btn-mockup-action">${data.btnText}</a>
                </div>
            `;
            
            screen.style.opacity = "1";
            screen.style.transform = "scale(1)";
        }, 250);
    }

    setBillingFrequencyUI(freq, targetPrice, savingsText, savingsColor) {
        document.getElementById("btn-freq-monthly").classList.remove("active");
        document.getElementById("btn-freq-annually").classList.remove("active");
        
        document.getElementById(`btn-freq-${freq}`).classList.add("active");
        
        const savingsLabel = document.getElementById("unified-price-savings");
        if (savingsLabel) {
            savingsLabel.innerText = savingsText;
            savingsLabel.style.color = savingsColor;
        }
    }

    animatePriceValue(start, end, suffix) {
        const obj = document.getElementById("unified-price-label");
        if (!obj) return;
        
        let current = start;
        const duration = 200; // ms
        const stepTime = 15;
        const steps = duration / stepTime;
        const increment = (end - start) / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;
            
            if (step >= steps) {
                clearInterval(timer);
                obj.innerHTML = `₹${end}<span>${suffix}</span>`;
            } else {
                obj.innerHTML = `₹${Math.round(current)}<span>${suffix}</span>`;
            }
        }, stepTime);
    }

    showDemoModal(planName) {
        const modal = document.getElementById("demo-modal");
        const planSelect = document.getElementById("demo-plan");
        if (planSelect) {
            planSelect.value = planName;
        }
        if (modal) modal.classList.add("open");
    }

    hideDemoModal() {
        const modal = document.getElementById("demo-modal");
        if (modal) modal.classList.remove("open");
    }

    setConsultationSubmitState(btn, submitting) {
        if (!btn) return;
        if (submitting) {
            btn.disabled = true;
            btn.innerHTML = "Securely Submitting...";
        } else {
            btn.disabled = false;
        }
    }

    setConsultationSuccessState(btn, originalText) {
        if (!btn) return;
        btn.innerHTML = "Success! Slot Booked";
        btn.style.background = "#10b981"; // Success green

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.style.background = "";
            this.hideDemoModal();
        }, 1500);
    }

    showToast(message) {
        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(18, 18, 20, 0.95);
            border: 1px solid #ff2d55;
            box-shadow: 0 10px 30px rgba(217, 27, 67, 0.4);
            padding: 1.25rem 2rem;
            border-radius: 12px;
            color: white;
            z-index: 100000;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            line-height: 1.4;
            animation: slideInToast 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        `;
        
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "slideInToast 0.5s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards";
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 6000);
    }

    addToastKeyframeStyle() {
        if (document.getElementById("toast-keyframe-style")) return;
        const styleSheet = document.createElement("style");
        styleSheet.id = "toast-keyframe-style";
        styleSheet.innerText = `
            @keyframes slideInToast {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}
