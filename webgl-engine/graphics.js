const vertexPointSource = `#version 300 es
layout(location = 0) in vec2 a_coordinates;
layout(location = 1) in vec3 a_color;
uniform mat3 u_projection;

out vec3 vertColor;

void main() {
    vertColor = a_color;
    gl_Position = vec4((u_projection * vec3(a_coordinates, 1)).xy, 0.0, 1.0);
    gl_PointSize = 1.0;
}
`;

const fragmentPointSource = `#version 300 es
precision mediump float;
in vec3 vertColor;
out vec4 outColor;

void main() {
    outColor = vec4(vertColor, 1.0);
}
`;

export class Graphics {

    static MAX_POINTS_PER_BATCH = 10000;
    static FLOATS_PER_VERT = 5;
    /**
     * Creates a new graphics context object for the current canvas
     * */
    constructor(canvas) {
        /** @type {WebGL2RenderingContext} */
        this.context = canvas.getContext("webgl2");
        /** @type {HTMLElement} */
        this.canvas = canvas;

        if(!this.context) {
            alert("Unable to init webgl!");
            return;
        }

        this.pointShader = this.#loadProgram(vertexPointSource, fragmentPointSource);
        this.pointsBuffer = this.context.createBuffer();
        this.pointsBufferSource = new Float32Array(Graphics.MAX_POINTS_PER_BATCH * Graphics.FLOATS_PER_VERT);
        this.pointsBufferCount = 0;
    }

    /**
     * 
     * @param {string} fragmentSource 
     * @param {string} vertexSource 
     * @returns {number}
     */
    #loadProgram(vertexSource, fragmentSource) {
        
        const vertexShader = this.#loadShader(this.context.VERTEX_SHADER, vertexSource);
        const fragShader = this.#loadShader(this.context.FRAGMENT_SHADER, fragmentSource);

        const program = this.context.createProgram();
        this.context.attachShader(program, vertexShader);
        this.context.attachShader(program, fragShader);
        this.context.linkProgram(program);

        if (!this.context.getProgramParameter(program, this.context.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.context.getProgramInfoLog(program));
            return null;
        }

        this.context.deleteShader(vertexShader);
        this.context.deleteShader(fragShader);

        return program;
    }

    /**
     * 
     * @param {number} type 
     * @param {string} source 
     * @returns {number}
     */
    #loadShader(type, source) {
        const shader = this.context.createShader(type);

        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);

        if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.context.getShaderInfoLog(shader));
            this.context.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Gets width and height of canvas
     * @returns {[number, number]}
     */
    getCanvasDimensions() {
        return [this.context.canvas.width, this.context.canvas.height];
    }

    flush() {
        if(this.pointsBufferCount > 0) {
            this.context.useProgram(this.pointShader);

            // projection matrix location
            let projectionLocation = this.context.getUniformLocation(this.pointShader, "u_projection" );
            let projection = glMatrix.mat3.create();
            glMatrix.mat3.projection(projection, this.context.canvas.width, this.context.canvas.height);

            this.context.uniformMatrix3fv(projectionLocation, false, projection);

            this.context.bindBuffer( this.context.ARRAY_BUFFER, this.pointsBuffer );
            this.context.enableVertexAttribArray(0);
            this.context.enableVertexAttribArray(1);
        
            // Send the vertex data to the shader program.
            this.context.vertexAttribPointer( 0, 2, this.context.FLOAT, false, 5 * 4, 0);
            this.context.vertexAttribPointer( 1, 3, this.context.FLOAT, false, 5 * 4, 2 * 4);

            this.context.bufferData(this.context.ARRAY_BUFFER, this.pointsBufferSource, this.context.STATIC_DRAW);
            this.context.drawArrays(this.context.POINTS, 0, this.pointsBufferCount);

            this.context.useProgram(null);
            this.pointsBufferCount = 0;

        }
    }

    /** 
     * Batches the drawing of a single pixel to screen space
     * @param {number} x
     * @param {number} y
     * @param {number} r
     * @param {number} g
     * @param {number} b
     */
    drawScreenPixel(x, y, r, g, b) {
        // x+0.5, y+0.5
        var offset = this.pointsBufferCount * Graphics.FLOATS_PER_VERT;

        this.pointsBufferSource[offset] = x+0.5;
        this.pointsBufferSource[offset+1] = y+0.5;
        this.pointsBufferSource[offset+2] = r;
        this.pointsBufferSource[offset+3] = g;
        this.pointsBufferSource[offset+4] = b;

        this.pointsBufferCount++;

        if(this.pointsBufferCount === Graphics.MAX_POINTS_PER_BATCH) {
            this.flush();
        }
    }

    /**
     * 
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     * @param {number} a 
     */
    clearColor(r, g, b, a) {
        this.context.clearColor(r, g, b, a);
    }

    // TODO: make this customisable (other buffer bits)
    clear() {
        this.context.clear(this.context.COLOR_BUFFER_BIT);
    }
}