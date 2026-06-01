/**
 * RestoFlow Customer Mobile Portal Application Bootstrap
 */

import { appModel } from './models/AppModel.js';
import { CustomerView } from './views/customer/CustomerView.js';
import { CustomerController } from './controllers/CustomerController.js';

document.addEventListener("DOMContentLoaded", () => {
    const view = new CustomerView(appModel);
    const controller = new CustomerController(appModel, view);

    // Expose controller globally so inline template events can reference it
    window.custCtrl = controller;

    // Run Customer portal initialization
    controller.init();
});
