/**
 * RestoFlow Landing Page Application Bootstrap
 */

import { appModel } from './models/AppModel.js';
import { IndexView } from './views/index/IndexView.js';
import { IndexController } from './controllers/IndexController.js';

document.addEventListener("DOMContentLoaded", () => {
    const view = new IndexView();
    const controller = new IndexController(appModel, view);

    // Expose controller globally so inline template events can reference it
    window.indexCtrl = controller;

    // Run landing page initialization
    controller.init();
});
