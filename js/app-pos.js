/**
 * RestoFlow POS Dashboard Application Bootstrap
 */

import { appModel } from './models/AppModel.js?v=2.0.1';
import { POSView } from './views/pos/POSView.js?v=2.0.1';
import { POSController } from './controllers/POSController.js?v=2.0.1';

function initPOSApp() {
    if (window.posCtrl) return;
    const view = new POSView(appModel);
    const controller = new POSController(appModel, view);

    // Expose controller globally so inline template events can reference it
    window.posCtrl = controller;

    // Run POS initialization
    controller.init();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPOSApp);
} else {
    initPOSApp();
}
