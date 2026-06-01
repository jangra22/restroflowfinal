/**
 * RestoFlow Landing Page Controller
 * Bridges the model layer (if any) and IndexView. Manages general page interactions.
 */

export class IndexController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Controller Local State
        this.billingFrequency = "monthly";
    }

    init() {
        // Setup initial landing state
        this.view.switchMockup('customer');
    }

    switchMockup(portal) {
        this.view.switchMockup(portal);
    }

    setBillingFrequency(freq) {
        if (this.billingFrequency === freq) return;
        
        const previousFrequency = this.billingFrequency;
        this.billingFrequency = freq;
        
        const targetPrice = freq === "monthly" ? 4999 : 3999;
        const currentPrice = previousFrequency === "monthly" ? 4999 : 3999;
        
        let savingsText = "No contracts. Cancel or pause anytime.";
        let savingsColor = "#a1a1aa";
        
        if (freq === "annually") {
            savingsText = "Saves ₹12,000 billed annually! (₹47,988 total)";
            savingsColor = "#10b981";
        }

        this.view.setBillingFrequencyUI(freq, targetPrice, savingsText, savingsColor);
        this.view.animatePriceValue(currentPrice, targetPrice, "/mo");
    }

    openDemoModal(planName = "Growth") {
        this.view.showDemoModal(planName);
    }

    closeDemoModal() {
        this.view.hideDemoModal();
    }

    toggleMobileMenu() {
        this.view.toggleMobileMenu();
    }

    handleConsultationSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById("demo-name") ? document.getElementById("demo-name").value : "";
        const email = document.getElementById("demo-email") ? document.getElementById("demo-email").value : "";
        const restaurant = document.getElementById("demo-restaurant") ? document.getElementById("demo-restaurant").value : "";
        const plan = document.getElementById("demo-plan") ? document.getElementById("demo-plan").value : "";

        const btn = document.getElementById("btn-submit-demo");
        const originalText = btn ? btn.innerHTML : "Confirm My Reservation";

        // Simulate secure request loading state
        this.view.setConsultationSubmitState(btn, true);

        setTimeout(() => {
            this.view.setConsultationSuccessState(btn, originalText);
            this.view.showToast(`Thank you, ${name}! Your demo reservation for the ${plan} tier has been registered securely. Our expert will email you at ${email} shortly.`);
        }, 1200);
    }
}
