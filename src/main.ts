import * as PIXI from "pixi.js";
import * as physics from "./physics";
import * as game from "./game";

import { Ball } from "./Ball";

const fpsLabel = document.getElementById("fps-label") as HTMLDivElement;

const width = 1000;
const height = 500;

const renderer = PIXI.autoDetectRenderer(width, height);
document.body.appendChild(renderer.view);

const gameContainer = new game.Container();
gameContainer.pixiContainer = new PIXI.Container();
gameContainer.physicsContainer = new physics.Container(width, height);

gameContainer.add((() => {
    const ball = new Ball(100);
    ball.physicsObject.position.set([width / 2, height / 2]);
    ball.physicsObject.density = 10;
    return ball;
})());

for (let i = 0; i < 100; i++) {
    gameContainer.add((() => {
        const ball = new Ball(
            1 + Math.random() * 4);
            ball.physicsObject.position.set([Math.random() * width, Math.random() * height]);
            ball.physicsObject.velocity.set([Math.random() * 1, Math.random() * 1]);
            return ball;
    })());
}


let lastUpdateTime: number;
let ups: number;

function update() {
    let now = window.performance.now() / 1000;
    let dt = 0;
    if (lastUpdateTime) {
        dt = now - lastUpdateTime;
        ups = ups * 0.95 + 1 / dt * 0.05;
    } else {
        ups = 0;
    }
    lastUpdateTime = now;

    gameContainer.physicsContainer.update(1);
    gameContainer.update(1);
}

let lastRenderTime: number;
let fps: number;

function render() {
    let now = window.performance.now() / 1000;
    if (lastRenderTime) {
        const dt = now - lastRenderTime;
        fps = fps * 0.95 + 1 / dt * 0.05;
    } else {
        fps = 0;
    }
    lastRenderTime = now;

    gameContainer.render();
    renderer.render(gameContainer.pixiContainer);

    fpsLabel.innerText = `FPS ${fps && fps.toFixed(2)} / UPS ${ups && ups.toFixed(2)}`;

    requestAnimationFrame(render);
}

const updater = setInterval(update, 20);
requestAnimationFrame(render);