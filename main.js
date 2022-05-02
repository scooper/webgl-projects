import { WebGLEngine } from './webgl-engine/engine.js';
import { DebugLayer } from './example/debug-layer.js';
import { GameLayer} from './example/game-layer.js';

function main() {
    const engine = new WebGLEngine('#glCanvas', 720, 480);
    engine.addLayer(new DebugLayer());
    engine.addLayer(new GameLayer());
    engine.start();
}

main();