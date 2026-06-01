/**
 * RestoFlow POS Dashboard Application Bootstrap
 */

import { appModel } from './models/AppModel.js';
import { POSView } from './views/pos/POSView.js';
import { POSController } from './controllers/POSController.js';

document.addEventListener("DOMContentLoaded", () => {
    const view = new POSView(appModel);
    const controller = new POSController(appModel, view);

    // Expose controller globally so inline template events can reference it
    window.posCtrl = controller;

    // Run POS initialization
    controller.init();
});
