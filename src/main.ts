import _ from "underscore";
import Rx from 'rxjs/Rx';

import { Physics } from "./physics/Physics";

import Box2D from "box2dweb";
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

import { FpsTracker } from "./FpsTracker";

import PIXI from "pixi.js";
import { Camera } from "./Camera";
import { isVisible } from "./utils";

class Enviornment {
    physics = new Physics();

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
    bodyCountLabel = document.getElementById("body-count-label");
    pauseButton = document.getElementById("pause-button") as HTMLButtonElement;
    trackRotationButton = document.getElementById("track-rotation-button") as HTMLButtonElement;
    stepButton = document.getElementById("step-button") as HTMLButtonElement;
    toggleGravityButton = document.getElementById("toggle-gravity-button") as HTMLButtonElement;
    



    updateEvent = new Rx.Subject<number>();
    renderEvent = new Rx.Subject<number>();


    camera = new Camera(this);

    isPaused = false;

    renderIterationEvent = new Rx.Subject<number>();
    updateIterationEvent = Rx.Observable
    .interval(0, Rx.Scheduler.asap)
    .throttleTime(1000 / this.targetUps)
    .scan((lastAnimationFrameRequest: number) => {
        if (lastAnimationFrameRequest !== null) {
            cancelAnimationFrame(lastAnimationFrameRequest);
        }
        return requestAnimationFrame(() => this.renderIterationEvent.next());
    }, null);


    constructor() {
        _.bindAll(this, "adjustDisplay");

        this.pauseButton.addEventListener("click", () => this.isPaused = !this.isPaused);
        this.trackRotationButton.addEventListener("click", () => this.camera.trackRotation = !this.camera.trackRotation);
        this.stepButton.addEventListener("click", () => this.update(1 / 60));
        this.toggleGravityButton.addEventListener("click", () => this.physics.isGravityOn = !this.physics.isGravityOn);

        window.addEventListener("resize", this.adjustDisplay);
        this.adjustDisplay();

        window.addEventListener("wheel", e => {
            this.camera.scale *= Math.pow(1.1, -e.deltaY / 100);
        });

        this.physics.world.SetDebugDraw((() => {
            const debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(this.debugCtx);
            debugDraw.SetFillAlpha(0.4);
            debugDraw.SetLineThickness(.05);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            //debugDraw.SetDrawScale(1/10);
            return debugDraw;
        })());
    }


    adjustDisplay() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    
        this.stage.position.set(
            this.canvas.width / 2, 
            this.canvas.height / 2);
    
        if (this.canvasDebug) {
            this.canvasDebug.width = this.canvasDebug.clientWidth;
            this.canvasDebug.height = this.canvasDebug.clientHeight;
    
            this.debugCtx.setTransform(1, 0, 0, 1, this.canvasDebug.width / 2, this.canvasDebug.height / 2);
        }
    }

    update(dt: number) {
        this.physics.update(dt);
        this.updateEvent.next(dt);
    }

    render(dt: number) {
        this.renderEvent.next(dt);
        
        this.camera.render();
        this.renderer.render(this.stage);
        
        if (this.canvasDebug && isVisible(this.canvasDebug)) {
            this.debugCtx.save();
            this.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.debugCtx.clearRect(0, 0, this.debugCtx.canvas.width, this.debugCtx.canvas.height);
            this.debugCtx.restore();
            this.debugCtx.save();
            this.camera.renderDebug();
            this.physics.world.DrawDebugData();
            this.debugCtx.restore();
        }
        
        this.bodyCountLabel.innerText = `Bodies: ${this.physics.world.GetBodyCount()}`;
        this.fpsLabel.innerText = `FPS ${this.fpsTracker.fps && this.fpsTracker.fps.toFixed(2)}`
            + ` / UPS ${this.upsTracker.fps && this.upsTracker.fps.toFixed(2)}`;
    }

    run() {
        this.renderIterationEvent
        .timeInterval()
        .do(v => this.fpsTracker.update(v.interval))
        .subscribe(v => {
            this.render(v.interval);
        });
    
        this.updateIterationEvent
        .timeInterval()
        .do(v => this.upsTracker.update(v.interval))
        .subscribe(v => {
            if (!this.isPaused) {
                this.update(1 / this.targetUps)
            }
        });
    }
}

const env = new Enviornment();

import map from "./maps/map01";
map(env);

env.run();