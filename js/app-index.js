/**
 * RestoFlow Landing Page Application Bootstrap
 */

import { appModel } from './models/AppModel.js?v=2.0.1';
import { IndexView } from './views/index/IndexView.js?v=2.0.1';
import { IndexController } from './controllers/IndexController.js?v=2.0.1';

function initIndexApp() {
    if (window.indexCtrl) return;
    const view = new IndexView();
    const controller = new IndexController(appModel, view);

    // Expose controller globally so inline template events can reference it
    window.indexCtrl = controller;

    // Run landing page initialization
    controller.init();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIndexApp);
} else {
    initIndexApp();
}
