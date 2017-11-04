import _ from "underscore";

import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

import { PointerHandler } from "./PointerHandler";
import { FpsTracker } from "./FpsTracker";
import { Gravity } from "./Gravity";

import PIXI from "pixi.js";

import { Earth } from "./Earth";
import { Body } from "./Body";

import Rx from 'rxjs/Rx';

import { Camera } from "./Camera";


class Enviornment {
    pixelsPerMeter = 30;


    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvasDebug = document.getElementById("canvas-debug") as HTMLCanvasElement;
    debugCtx = this.canvasDebug.getContext("2d");
    renderer = PIXI.autoDetectRenderer(this.canvas.clientWidth, this.canvas.clientHeight, {
        view: this.canvas,
        antialias: true
    });
    stage = new PIXI.Container();
    fpsLabel = document.getElementById("fps-label");
    pauseButton = document.getElementById("pause-button") as HTMLButtonElement;
    trackRotationButton = document.getElementById("track-rotation-button") as HTMLButtonElement;
    
    

    world = new b2World(new b2Vec2(0, 0), true);
    gravity = new Gravity(this.world);


    updateEvent = new Rx.Subject<number>();
    renderEvent = new Rx.Subject<number>();


    camera = new Camera(this);

    isPaused = false;
}

const env = new Enviornment();

env.pauseButton.addEventListener("click", () => env.isPaused = !env.isPaused);
env.trackRotationButton.addEventListener("click", () => env.camera.trackRotation = !env.camera.trackRotation);

window.addEventListener("wheel", e => {
    env.camera.scale *= Math.pow(1.1, -e.deltaY / 100);
});

function adjustDisplay() {
    env.canvas.width = env.canvas.clientWidth;
    env.canvas.height = env.canvas.clientHeight;

    env.stage.position.set(
        env.canvas.width / 2, 
        env.canvas.height / 2);

    if (env.canvasDebug) {
        env.canvasDebug.width = env.canvasDebug.clientWidth;
        env.canvasDebug.height = env.canvasDebug.clientHeight;

        env.debugCtx.setTransform(1, 0, 0, 1, env.canvasDebug.width / 2, env.canvasDebug.height / 2);
    }
}

window.addEventListener("resize", adjustDisplay);
adjustDisplay();



const earth = new Earth(env);
env.camera.target = earth.sprite;

const bodies: Body[] = [];
for(var i = 0; i < 200; ++i) {
    const d = (Math.random() - .5) * 100;
    const a = Math.random() * 2 * Math.PI;
    const position = new b2Vec2(Math.cos(a), -Math.sin(a));
    position.Multiply(d);
    position.Add(earth.body.GetPosition());
    
    
    const linearVelocity = earth.body.GetPosition().Copy();
    linearVelocity.SetV(earth.body.GetPosition());
    linearVelocity.Subtract(position);
    linearVelocity.CrossFV(1);
    const dstLen = linearVelocity.Normalize();
    linearVelocity.Multiply(1 * Math.sqrt(env.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
    // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));


    bodies.push(new Body(env, {
        position: position,
        linearVelocity: linearVelocity,
        angle: Math.random() * 2 * Math.PI,
        angularVelocity: 20 * (Math.random() - 0.5),
        radius: Math.random() * .5 + .1
    }));
}



env.world.SetDebugDraw((() => {
    const debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(env.debugCtx);
    debugDraw.SetFillAlpha(0.4);
    debugDraw.SetLineThickness(.05);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    //debugDraw.SetDrawScale(1/10);
    return debugDraw;
})());




const pointerHandler = new PointerHandler(env.world);
const fpsTracker = new FpsTracker();

Rx.Observable.interval(0, Rx.Scheduler.animationFrame)
.timestamp()
.subscribe(timestamped => {
    // update
    if (!env.isPaused) 
    {
        fpsTracker.update(timestamped.timestamp);
        pointerHandler.update();
        
        env.world.ClearForces();
        env.gravity.update();

        env.world.Step(1 / 60, 10, 10);

        env.updateEvent.next(1 / 60);
    }

    // render
    {
        env.renderEvent.next(timestamped.timestamp);

        
        env.camera.render();
        env.renderer.render(env.stage);
        
        if (env.canvasDebug) {
            env.debugCtx.save();
            env.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
            env.debugCtx.clearRect(0, 0, env.debugCtx.canvas.width, env.debugCtx.canvas.height);
            env.debugCtx.restore();
            env.debugCtx.save();
            env.camera.renderDebug();
            env.world.DrawDebugData();
            env.debugCtx.restore();
        }
        
        env.fpsLabel.innerText = `FPS ${fpsTracker.fps && fpsTracker.fps.toFixed(2)}`;
    }
});
