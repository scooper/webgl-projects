export class KeyType {
    /** @param {number} */
    constructor(code) {
        /** 
         * @public
         * @type {string} 
         * */
        this.code = code;
    }

    // utility keys
    static Esc = new KeyType('Escape');

    // arrow keys
    static ArrowLeft = new KeyType('ArrowLeft');
    static ArrowUp = new KeyType('ArrowUp');
    static ArrowRight = new KeyType('ArrowRight');
    static ArrowDown = new KeyType('ArrowDown');

    // alphabet
    static KeyA = new KeyType('KeyA');
    static KeyB = new KeyType('KeyB');
    static KeyC = new KeyType('KeyC');
    static KeyD = new KeyType('KeyD');
    static KeyE = new KeyType('KeyE');
    static KeyF = new KeyType('KeyF');
    static KeyG = new KeyType('KeyG');
    static KeyH = new KeyType('KeyH');
    static KeyI = new KeyType('KeyI');
    static KeyJ = new KeyType('KeyJ');
    static KeyK = new KeyType('KeyK');
    static KeyL = new KeyType('KeyL');
    static KeyM = new KeyType('KeyM');
    static KeyN = new KeyType('KeyN');
    static KeyO = new KeyType('KeyO');
    static KeyP = new KeyType('KeyP');
    static KeyQ = new KeyType('KeyQ');
    static KeyR = new KeyType('KeyR');
    static KeyS = new KeyType('KeyS');
    static KeyT = new KeyType('KeyT');
    static KeyU = new KeyType('KeyU');
    static KeyV = new KeyType('KeyV');
    static KeyW = new KeyType('KeyW');
    static KeyX = new KeyType('KeyX');
    static KeyY = new KeyType('KeyY');
    static KeyZ = new KeyType('KeyZ');
}

export class MouseButtonType {
    /** @param {number} */
    constructor(code) {
        /** 
         * @public
         * @type {number} 
         * */
        this.code = code;
    }

    static LeftMouse = new KeyType(0);
    static MiddleMouse = new KeyType(1);
    static RightMouse = new KeyType(2);
}

export class Input {
    /** 
     * Holds the state of keys pressed for easy lookup
     * @private
     * @type {Map<string, boolean>}
     * */
    static #keys = new Map();

    /** 
     * Holds the state of mouse buttons pressed for easy lookup
     * @private
     * @type {Map<number, boolean>}
     * */
    static #mouseButtons = new Map();

    /**
     * Holds the x, y coordinates of the mouse
     * @private
     * @type {number}
     */
    static #mouseX = 0; // TODO: change to some self made vector object/class?
    static #mouseY = 0; // TODO: change to some self made vector object/class?

    /**
     * Returns true if given key exists in the key map
     * @param {KeyType} key
     * @returns {boolean}
     */
    static isKeyPressed(key) {
        return Input.#keys.get(key.code);
    }

    /**
     * Returns true if given mouse button exists in the button map
     * @param {MouseButtonType} key
     * @returns {boolean}
     */
    static isMouseButtonPressed(button) {
        return Input.#mouseButtons.get(button.code);
    }

    /**
     * Returns the current x, y position of the mouse
     * @returns {[number, number]}
     */
    static getMousePos() {
        return [Input.#mouseX, Input.#mouseY];
    }

    /**
     * Attaches input handlers for the given canvas element
     * @param {HTMLCanvasElement} canvas
     */
    static init(canvas) {
        // keyboard events
        canvas.addEventListener('keyup', (e) => {
            Input.#keys.set(e.code, false);
            e.preventDefault();
            return true;
        });

        canvas.addEventListener('keydown', (e) => {
            Input.#keys.set(e.code, true);
            e.preventDefault();
            return true;
        });

        // mouse events
        canvas.addEventListener('mousemove', (e) => {
            /** @type {HTMLElement} */
            let boundingRect = e.target.getBoundingClientRect(); // we want pos relative to canvas
            Input.#mouseX = e.clientX - boundingRect.left;
            Input.#mouseY = e.clientY - boundingRect.top;
        });
        canvas.addEventListener('mousedown', (e) => {
            Input.#mouseButtons.set(e.button, true);
            return true;
        });
        canvas.addEventListener('mouseup', (e) => {
            Input.#mouseButtons.set(e.button, false);
            return true;
        });
    }
}