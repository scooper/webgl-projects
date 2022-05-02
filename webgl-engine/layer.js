import { Graphics } from "./graphics.js";

export class Layer {
    constructor() {
        if(this.constructor == Layer) {
            throw new Error("Layer base class cannot be instantiated!");
        }

        /** @type {Graphics} */
        this.gc = null;
    }

    update(deltaTime) {
        this.onUpdate(deltaTime);

        // do general updates
        if(this.gc != null) {
            this.gc.flush();
        }
    }

    /**
     * Called each loop
     * @param {number} deltaTime 
     */
    onUpdate(deltaTime) {
        throw new Error("Method 'onUpdate()' must be implemented!");
    }

    /** When attached, specific graphics context is added and layer initialised */
    onAttach(graphics) {
        this.gc = graphics;
        this.init();
    }

    init() {
        
    }
}