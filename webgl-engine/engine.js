import { Layer } from './layer.js'
import { Input } from './input.js'
import { Graphics } from './graphics.js';

export class WebGLEngine {
    /** 
     * @param {string} canvasId
     * @param {number} width
     * @param {number} height
     */
    constructor(canvasId, width, height) {
        const canvas = document.querySelector(canvasId);
        canvas.width = width;
        canvas.height = height;
        /** 
         * @type {Graphics} 
         * @public
         */
        this.graphics = new Graphics(canvas);
        
        /**
         * @type {Array<Layer>}
         */
        this.layers = [];
        /**
         * @type {number}
         */
        this.lastUpdatedTime = Date.now();

        Input.init(canvas);
    }

    /** main game loop */
    start() {

        let now = Date.now();
        let deltaTime = (now - this.lastUpdatedTime) / 1000;
        this.lastUpdatedTime = now;

        this.layers.forEach(element => {
            element.update(deltaTime);
        });
        
        requestAnimationFrame(() => this.start());
    }

    /**
     * 
     * @param {Layer} layer 
     */
    addLayer(layer) {
        this.layers.push(layer);
        layer.onAttach(this.graphics);
    }
}