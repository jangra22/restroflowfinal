/**
 * RestoFlow Landing Page Interaction Suite
 */

// Dynamic Billing Frequency State
let billingFrequency = "monthly";

// Mockup Data for Switcher
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

// Mockup Switcher Function
function switchMockup(portal) {
    // Update active tab buttons
    document.querySelectorAll(".mockup-tab").forEach(tab => {
        tab.classList.remove("active");
    });
    
    if (portal === 'customer') {
        document.getElementById("tab-btn-customer").classList.add("active");
    } else {
        document.getElementById("tab-btn-pos").classList.add("active");
    }

    // Apply fade transition to mockup container
    const screen = document.getElementById("mockup-screen");
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

// Set billing frequency toggle
function setBillingFrequency(freq) {
    if (billingFrequency === freq) return;
    
    billingFrequency = freq;
    
    // Toggle active tabs
    document.getElementById("btn-freq-monthly").classList.remove("active");
    document.getElementById("btn-freq-annually").classList.remove("active");
    
    document.getElementById(`btn-freq-${freq}`).classList.add("active");
    
    const targetPrice = freq === "monthly" ? 4999 : 3999;
    const currentPrice = freq === "monthly" ? 3999 : 4999;
    
    animateValue("unified-price-label", currentPrice, targetPrice, "/mo");
    
    const savingsLabel = document.getElementById("unified-price-savings");
    if (freq === "annually") {
        savingsLabel.innerText = "Saves ₹12,000 billed annually! (₹47,988 total)";
        savingsLabel.style.color = "#10b981";
    } else {
        savingsLabel.innerText = "No contracts. Cancel or pause anytime.";
        savingsLabel.style.color = "#a1a1aa";
    }
}

// Cool smooth number increment animation helper
function animateValue(id, start, end, suffix) {
    const obj = document.getElementById(id);
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

// Modal open/close actions
function openDemoModal(planName = "Growth") {
    const modal = document.getElementById("demo-modal");
    const planSelect = document.getElementById("demo-plan");
    if (planSelect) {
        planSelect.value = planName;
    }
    modal.classList.add("open");
}

function closeDemoModal() {
    document.getElementById("demo-modal").classList.remove("open");
}

// Consultation submission handler
function handleConsultationSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById("demo-name").value;
    const email = document.getElementById("demo-email").value;
    const restaurant = document.getElementById("demo-restaurant").value;
    const plan = document.getElementById("demo-plan").value;

    // Simulate secure request loading state
    const btn = document.getElementById("btn-submit-demo");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "Securely Submitting...";

    setTimeout(() => {
        btn.innerHTML = "Success! Slot Booked";
        btn.style.background = "#10b981"; // Success green

        setTimeout(() => {
            // Reset and close
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.style.background = "";
            closeDemoModal();
            
            // Show custom gorgeous toast
            showToast(`Thank you, ${name}! Your demo reservation for the ${plan} tier has been registered securely. Our expert will email you at ${email} shortly.`);
        }, 1500);
    }, 1200);
}

// Custom Toast notification utility
function showToast(message) {
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
        max-width: 400px;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        line-height: 1.4;
        animation: slideInToast 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;
    
    // Add keyframe animation on the fly
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes slideInToast {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
    `;
    document.head.appendChild(styleSheet);

    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideInToast 0.5s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards";
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 6000);
}

// Standard onload setup
window.addEventListener("load", () => {
    // Initial load setup if needed
});
