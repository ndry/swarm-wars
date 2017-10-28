import * as PIXI from "pixi.js";

import { ok } from "./import-example";
console.log(`import ${ok()}`);

const fpsLabel = document.getElementById("fps-label") as HTMLDivElement;

const width = 256;
const height = 256;

const renderer = PIXI.autoDetectRenderer(width, height);
document.body.appendChild(renderer.view);

const stage = new PIXI.Container();



const g = new PIXI.Graphics();
g.beginFill(0x00ff00);
g.lineStyle(0);
g.drawCircle(0, 0, 10);
g.endFill();

const ball = {
    velocity: {
        x: 5,
        y: 3,
    },
    position: {
        x: 100,
        y: 200
    },
    sprite: (() => {
        const sprite = new PIXI.Sprite(g.generateCanvasTexture());
        sprite.anchor.set(.5, .5);
        stage.addChild(sprite);
        return sprite;
    })()
}


let lastUpdateTime: number;
let ups: number;

function update() {
    let now = Date.now() / 1000;
    if (lastUpdateTime) {
        const dt = now - lastUpdateTime;
        ups = ups * 0.95 + 1 / dt * 0.05;
    } else {
        ups = 0;
    }
    lastUpdateTime = now;


    ball.velocity.y += .1; // gravity
    ball.position.x += ball.velocity.x;
    ball.position.y += ball.velocity.y;
    if (ball.position.x < 0) {
        ball.position.x = -ball.position.x;
        ball.velocity.x = -ball.velocity.x;
    }
    if (ball.position.y < 0) {
        ball.position.y = -ball.position.y;
        ball.velocity.y = -ball.velocity.y;
    }
    if (ball.position.x >= width) {
        ball.position.x = width - ball.position.x + width;
        ball.velocity.x = -ball.velocity.x;
    }
    if (ball.position.y >= width) {
        ball.position.y = height - ball.position.y + height;
        ball.velocity.y = -ball.velocity.y;
    }

    setTimeout(update, 1);
}

let lastRenderTime: number;
let fps: number;

function render() {
    let now = Date.now() / 1000;
    if (lastRenderTime) {
        const dt = now - lastRenderTime;
        fps = fps * 0.95 + 1 / dt * 0.05;
    } else {
        fps = 0;
    }
    lastRenderTime = now;
    
    ball.sprite.x = ball.position.x;
    ball.sprite.y = ball.position.y;

    renderer.render(stage);


    fpsLabel.innerText = `FPS ${fps && fps.toFixed(2)} / UPS ${ups && ups.toFixed(2)}`;

    requestAnimationFrame(render);
}

setTimeout(update);
requestAnimationFrame(render);