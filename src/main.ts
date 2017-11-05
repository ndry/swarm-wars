import _ from "underscore";

import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

import { FpsTracker } from "./FpsTracker";
import { Gravity } from "./Gravity";

import PIXI from "pixi.js";

import { Earth } from "./Earth";
import { Body } from "./Body";
import { Probe } from "./Probe";

import Rx from 'rxjs/Rx';

import { Camera } from "./Camera";
import { timestamp } from "rxjs/operators";

import { isVisible } from "./utils";


class Enviornment {
    pixelsPerMeter = 30;
    targetUps = 60;

    upsTracker = new FpsTracker();
    fpsTracker = new FpsTracker();

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
    stepButton = document.getElementById("step-button") as HTMLButtonElement;
    toggleGravityButton = document.getElementById("toggle-gravity-button") as HTMLButtonElement;
    
    isGravityOn = true;

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
env.stepButton.addEventListener("click", () => update(1 / 60));
env.toggleGravityButton.addEventListener("click", () => env.isGravityOn = !env.isGravityOn);

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
for(var i = 0; i < 100; ++i) {
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

const probes: Probe[] = [];
for(var i = 0; i < 100; ++i) {
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


    probes.push(new Probe(env, {
        position: position,
        linearVelocity: linearVelocity,
        angle: Math.random() * 2 * Math.PI,
        angularVelocity: 20 * (Math.random() - 0.5),
        radius: Math.random() * .5 + .1,
        color: (Math.random() < .5) ? 0xff0000 : 0x00ff00
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






function update(dt: number) {
    env.world.ClearForces();
    if (env.isGravityOn) {
        env.gravity.update();
    }
    env.world.Step(dt, 10, 10);

    env.updateEvent.next(dt);
}


const renderIterationEvent = new Rx.Subject<number>();
const updateIterationEvent = Rx.Observable
.interval(0, Rx.Scheduler.asap)
.throttleTime(1000 / env.targetUps)
.scan((lastAnimationFrameRequest: number) => {
    if (lastAnimationFrameRequest !== null) {
        cancelAnimationFrame(lastAnimationFrameRequest);
    }
    return requestAnimationFrame(() => renderIterationEvent.next());
}, null);



function run() {
    renderIterationEvent
    .timeInterval()
    .do(v => env.fpsTracker.update(v.interval))
    .subscribe(v => {
        env.renderEvent.next(v.interval);
    
        env.camera.render();
        env.renderer.render(env.stage);
        
        if (env.canvasDebug && isVisible(env.canvasDebug)) {
            env.debugCtx.save();
            env.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
            env.debugCtx.clearRect(0, 0, env.debugCtx.canvas.width, env.debugCtx.canvas.height);
            env.debugCtx.restore();
            env.debugCtx.save();
            env.camera.renderDebug();
            env.world.DrawDebugData();
            env.debugCtx.restore();
        }
        
        env.fpsLabel.innerText = `FPS ${env.fpsTracker.fps && env.fpsTracker.fps.toFixed(2)}`
            + ` / UPS ${env.upsTracker.fps && env.upsTracker.fps.toFixed(2)}`;
    });

    updateIterationEvent
    .timeInterval()
    .do(v => env.upsTracker.update(v.interval))
    .subscribe(v => {
        if (!env.isPaused) {
            update(1 / env.targetUps)
        }
    });
}

run();