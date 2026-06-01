/**
 * RestoFlow Customer Mobile Portal Application Bootstrap
 */

import { appModel } from './models/AppModel.js?v=2.0.1';
import { CustomerView } from './views/customer/CustomerView.js?v=2.0.1';
import { CustomerController } from './controllers/CustomerController.js?v=2.0.1';

function initCustomerApp() {
    if (window.custCtrl) return;
    const view = new CustomerView(appModel);
    const controller = new CustomerController(appModel, view);

    // Expose controller globally so inline template events can reference it
    window.custCtrl = controller;

    // Run Customer portal initialization
    controller.init();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCustomerApp);
} else {
    initCustomerApp();
}
