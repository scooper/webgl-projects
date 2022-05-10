import { Layer } from '../webgl-engine/layer.js'
import { Graphics } from '../webgl-engine/graphics.js';
import { Input, KeyType, MouseButtonType } from '../webgl-engine/input.js'

// very simple raycast rendering based on a Javidx9 video
// to be improved... 
export class GameLayer extends Layer {
    constructor() {
        super();

        this.playerX = 3.0;
        this.playerY = 3.0;
        this.playerA = -3.14159 / 2;
        this.fov = 3.14159 / 4;
        this.playerSpeed = 3.0;

        this.maxDepth = 30.0;
        this.mapMaxX = 25;
        this.mapMaxY = 25;
        this.map = '#########################' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#############...........#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#...........#...........#' +
                   '#...........#...........#' +
                   '#...........#...........#' +
                   '#........#######........#' +
                   '#...........#...........#' +
                   '#...........#...........#' +
                   '#...........#...........#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#.......................#' +
                   '#...........#############' +
                   '#.......................#' +
                   '#########################';

        this.texBuffer = null;
        this.texBufferWidth = 0;
        this.texBufferHeight = 0;
        this.drawTex = false;
        this.textureLoaded = false;
    }
    
    init() {
        let image = new Image();
        let canvas = document.createElement('canvas')
        let context = canvas.getContext('2d');
        image.onload = () => {
            canvas.height = image.height;
            canvas.width = image.width;
            context.drawImage(image, 0, 0);
            let rgbdata = context.getImageData(0, 0, image.width, image.height).data;
            this.texBuffer = [];
            for(let i = 0; i <= rgbdata.length; i += 4) {
                let r = rgbdata[i];
                let g = rgbdata[i+1];
                let b = rgbdata[i+2];
                this.texBuffer.push([r, g, b]);
            }
            this.texBufferHeight = image.height;
            this.texBufferWidth = image.width;
            this.textureLoaded = true;

            document.body.appendChild(canvas);
        };
        image.src = "./example/res/brick-wall.png";
    }

   /**
     * Called each loop
     * @param {number} deltaTime
     */
    onUpdate(deltaTime) {
        this.gc.clear();

        if(Input.isKeyPressed(KeyType.KeyA)) {
            this.playerA -= (this.playerSpeed * 0.6) * deltaTime;
        }

        if(Input.isKeyPressed(KeyType.KeyD)) {
            this.playerA += (this.playerSpeed * 0.6) * deltaTime;
        }

        if(Input.isKeyPressed(KeyType.KeyW)) {
            this.playerX += Math.sin(this.playerA) * this.playerSpeed * deltaTime;
            this.playerY += Math.cos(this.playerA) * this.playerSpeed * deltaTime;

            let playerXInt = Math.trunc(this.playerX);
            let playerYInt = Math.trunc(this.playerY);

            if(this.map.charAt(playerYInt * this.mapMaxX + playerXInt) === '#') {
                this.playerX -= Math.sin(this.playerA) * this.playerSpeed * deltaTime;
                this.playerY -= Math.cos(this.playerA) * this.playerSpeed * deltaTime;
            }
        }

        if(Input.isKeyPressed(KeyType.KeyS)) {
            this.playerX -= Math.sin(this.playerA) * this.playerSpeed * deltaTime;
            this.playerY -= Math.cos(this.playerA) * this.playerSpeed * deltaTime;

            let playerXInt = Math.trunc(this.playerX);
            let playerYInt = Math.trunc(this.playerY);

            if(this.map.charAt(playerYInt * this.mapMaxX + playerXInt) === '#') {
                this.playerX += Math.sin(this.playerA) * this.playerSpeed * deltaTime;
                this.playerY += Math.cos(this.playerA) * this.playerSpeed * deltaTime;
            }
        }

        let [width, height] = this.gc.getCanvasDimensions();

        for(let x = 0; x < width; x++) {

            let rayStart = [this.playerX, this.playerY];

            let rayA = (this.playerA - this.fov / 2) + (x / width) * this.fov;

            let unitRay = [Math.sin(rayA) + this.playerX, Math.cos(rayA) + this.playerY];

            let rayDir = glMatrix.vec2.create();
            glMatrix.vec2.subtract(rayDir, unitRay, rayStart);
            glMatrix.vec2.normalize(rayDir, rayDir);
            
            
            let rayUnitStepSize = [Math.sqrt(1 + (rayDir[1]/rayDir[0]) * (rayDir[1]/rayDir[0])), Math.sqrt(1 + (rayDir[0]/rayDir[1]) * (rayDir[0]/rayDir[1]))];
            let mapCheck = [Math.trunc(rayStart[0]), Math.trunc(rayStart[1])];
            let rayLength = glMatrix.vec2.create();
            let step = glMatrix.vec2.create();
            let distanceToWall = 0.0;

            let hitWall = false;     
            let side = null;
            
            
            if(rayDir[0] < 0) {
                step[0] = -1;
                rayLength[0] = (rayStart[0] - mapCheck[0]) * rayUnitStepSize[0];
            } else {
                step[0] = 1;
                rayLength[0] = ((mapCheck[0]+1) - rayStart[0]) * rayUnitStepSize[0];
            }

            if(rayDir[1] < 0) {
                step[1] = -1;
                rayLength[1] = (rayStart[1] - mapCheck[1]) * rayUnitStepSize[1];
            } else {
                step[1] = 1;
                rayLength[1] = ((mapCheck[1]+1) - rayStart[1]) * rayUnitStepSize[1];
            }


            while(!hitWall && distanceToWall < this.maxDepth) {
                if(rayLength[0] < rayLength[1]) {
                    mapCheck[0] += step[0];
                    distanceToWall = rayLength[0];
                    rayLength[0] += rayUnitStepSize[0];
                    side = 0; // x horizontal hit
                } else {
                    mapCheck[1] += step[1];
                    distanceToWall = rayLength[1];
                    rayLength[1] += rayUnitStepSize[1];
                    side = 1; // y vertical hit
                }

                if(mapCheck[0] >= 0 && mapCheck[0] < this.mapMaxX && mapCheck[1] >= 0 && mapCheck[1] < this.mapMaxY) {
                    if(this.map.charAt(mapCheck[1] * this.mapMaxX + mapCheck[0]) === '#') {
                        hitWall = true;
                    }
                }
            }

            let intersection = [0, 0];

            if(hitWall) {
                intersection = rayDir;
                intersection[0] = this.playerX + distanceToWall * rayDir[0];
                intersection[1] = this.playerY + distanceToWall * rayDir[1];;
            }

            let sampleX = 0;
            if(side === 0) {
                sampleX = intersection[1];
                
            } else {
                sampleX = intersection[0];
            }

            let pixX = Math.trunc((sampleX * this.texBufferWidth) % this.texBufferWidth);

            if(side === 0 && rayDir[0] > 0) pixX = this.texBufferWidth - pixX - 1;
            if(side === 1 && rayDir[1] < 0) pixX = this.texBufferWidth - pixX - 1;
            
            let ceiling = (height / 2.0) - height / distanceToWall;
            let floor = height - ceiling;
            
            for(let y = 0; y < height; y++) {
                if(y <= ceiling) {
                    this.gc.drawScreenPixel(x, y, 0.0, 0.1, 0.4);
                } else if(y > ceiling && y <= floor) {
                    if(distanceToWall < this.maxDepth) {
                        if(this.textureLoaded) {
                            let sampleY = (y - ceiling) / (floor - ceiling);
                            let pixY = Math.trunc(((sampleY) * this.texBufferHeight) % this.texBufferHeight);
                            let pix = pixY * this.texBufferHeight + pixX;
                            let color = [this.texBuffer[pix][0]/255, this.texBuffer[pix][1]/255, this.texBuffer[pix][2]/255];
                            let dark = ((this.maxDepth - distanceToWall) / this.maxDepth) * 1.0;
                            color[0] *= dark;
                            color[1] *= dark;
                            color[2] *= dark;
                            this.gc.drawScreenPixel(x, y, color[0], color[1], color[2]);
                        } else {
                            let col = ((this.maxDepth - distanceToWall) / this.maxDepth) * 0.5
                            this.gc.drawScreenPixel(x, y, col, col, col);
                        }            
                    } else {
                        this.gc.drawScreenPixel(x, y, 0.0, 0.0, 0.0);
                    }
                } else {
                    this.gc.drawScreenPixel(x, y, 0.1, 0.4, 0.0);
                }
            }
        }
    }
}

