import { Layer } from '../webgl-engine/layer.js'
import { Graphics } from '../webgl-engine/graphics.js';
import { Input, KeyType, MouseButtonType } from '../webgl-engine/input.js'

export class DebugLayer extends Layer {
    constructor() {
        super();

        /** @param {HTMLElement} */
        this.debugOverlay = null;
    }

    /**
     * Called each loop
     * @param {number} deltaTime 
     */
    onUpdate(deltaTime) {
        const deltaTimeString = 'dt: ' + deltaTime + 'ms';
        this.debugOverlay.textContent = deltaTimeString;
    }

    init() {
        let canvas = this.gc.canvas;
        let container = canvas.parentElement;
        this.debugOverlay = document.createElement('div');
        
        this.debugOverlay.style.color = 'white';
        this.debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.debugOverlay.style.fontFamily = 'monospace';
        this.debugOverlay.style.padding = '1em';
        this.debugOverlay.style.position = 'relative';
        this.debugOverlay.style.marginBottom = '0.5em';

        this.debugOverlay.tabIndex = -1;

        container.insertBefore(this.debugOverlay, canvas);
    }
}