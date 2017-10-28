import * as PIXI from "pixi.js";

import { ok } from "./import-example";
console.log(`import ${ok()}`);

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



function update() {
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

    setTimeout(update, 10); // 100 UPS
}

function render(timestamp: number) {
    ball.sprite.x = ball.position.x;
    ball.sprite.y = ball.position.y;

    renderer.render(stage);
    requestAnimationFrame(render);
}

setTimeout(update);
requestAnimationFrame(render);