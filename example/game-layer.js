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
        this.playerSpeed = 5.0;

        this.depth = 30.0;
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
    }

    init() {
        //this.depth = this.gc.canvas.width;
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

            if(this.map.charAt(playerXInt * this.mapMaxX + playerYInt) === '#') {
                this.playerX -= Math.sin(this.playerA) * this.playerSpeed * deltaTime;
                this.playerY -= Math.cos(this.playerA) * this.playerSpeed * deltaTime;
            }
        }

        if(Input.isKeyPressed(KeyType.KeyS)) {
            this.playerX -= Math.sin(this.playerA) * this.playerSpeed * deltaTime;
            this.playerY -= Math.cos(this.playerA) * this.playerSpeed * deltaTime;

            let playerXInt = Math.trunc(this.playerX);
            let playerYInt = Math.trunc(this.playerY);

            if(this.map.charAt(playerXInt * this.mapMaxX + playerYInt) === '#') {
                this.playerX += Math.sin(this.playerA) * this.playerSpeed * deltaTime;
                this.playerY += Math.cos(this.playerA) * this.playerSpeed * deltaTime;
            }
        }

        let [width, height] = this.gc.getCanvasDimensions();

        for(let x = 0; x < width; x++) {
            let ray = (this.playerA - this.fov / 2) + (x / width) * this.fov;
            let stepSize = 0.01;
            let distanceToWall = 0.0;

            let hitWall = false;
            let boundry = false;

            let eyeX = Math.sin(ray);
            let eyeY = Math.cos(ray);

            while(!hitWall) {
                distanceToWall += stepSize;
                let testX = Math.round(this.playerX + eyeX * distanceToWall);
                let testY = Math.round(this.playerY + eyeY * distanceToWall);

                if(testX < 0 || testX >= this.mapMaxX || testY < 0 || testY >= this.mapMaxY) {
                    hitWall = true;
                    distanceToWall = this.depth;
                } else {
                    if(this.map.charAt(testX * this.mapMaxX + testY) === '#') {
                        hitWall = true;
                    }
                }
            }

            let ceiling = (height / 2.0) - height / distanceToWall;
            let floor = height - ceiling;
            
            for(let y = 0; y < height; y++) {
                if(y <= ceiling) {
                    this.gc.drawScreenPixel(x, y, 0.0, 0.1, 0.4);
                } else if(y > ceiling && y <= floor) {
                    if(distanceToWall < this.depth) {
                        let col = ((0.5/this.depth) * (this.depth - distanceToWall));
                        this.gc.drawScreenPixel(x, y, col, col, col);
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

