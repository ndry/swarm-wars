import _ from "underscore";
import Rx from 'rxjs/Rx';

import { Physics } from "./physics/Physics";

import Box2D from "box2dweb";
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

import { FpsTracker } from "./FpsTracker";
import BABYLON from "babylonjs";

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
    fpsLabel = document.getElementById("fps-label");
    bodyCountLabel = document.getElementById("body-count-label");
    pauseButton = document.getElementById("pause-button") as HTMLButtonElement;
    trackRotationButton = document.getElementById("track-rotation-button") as HTMLButtonElement;
    stepButton = document.getElementById("step-button") as HTMLButtonElement;
    toggleGravityButton = document.getElementById("toggle-gravity-button") as HTMLButtonElement;

    graphics = {
        engine: null as BABYLON.Engine,
        scene: null as BABYLON.Scene,
        camera: null as BABYLON.ArcRotateCamera
    };


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
    }, null)
    ;


    constructor() {
        _.bindAll(this, "adjustDisplay");

        this.canvas.addEventListener("contextmenu", ev => ev.preventDefault());
        this.canvasDebug.addEventListener("contextmenu", ev => ev.preventDefault());
        
        this.graphics.engine = new BABYLON.Engine(this.canvas, true);

        this.graphics.scene = new BABYLON.Scene(this.graphics.engine);
        
        const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, 0, 100, new BABYLON.Vector3(0, 0, 0), this.graphics.scene);
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 500;



        this.graphics.camera = camera;
        this.graphics.camera.attachControl(this.canvas, false);


        // this.graphics.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        // const ratio = this.graphics.engine.getRenderWidth() / this.graphics.engine.getRenderHeight();
        // const halfWidth = 20;
        // this.graphics.camera.orthoLeft = -halfWidth;
        // this.graphics.camera.orthoRight = halfWidth;
        // this.graphics.camera.orthoTop = -halfWidth / ratio;
        // this.graphics.camera.orthoBottom = halfWidth / ratio;


        this.pauseButton.addEventListener("click", () => this.isPaused = !this.isPaused);
        this.trackRotationButton.addEventListener("click", () => this.camera.trackRotation = !this.camera.trackRotation);
        this.stepButton.addEventListener("click", () => this.update(1 / 60));
        this.toggleGravityButton.addEventListener("click", () => this.physics.isGravityOn = !this.physics.isGravityOn);

        window.addEventListener("resize", this.adjustDisplay);
        this.adjustDisplay();

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
    
        this.graphics.engine.resize();
    
        if (this.canvasDebug) {
            this.canvasDebug.width = this.canvasDebug.clientWidth;
            this.canvasDebug.height = this.canvasDebug.clientHeight;
    
            this.debugCtx.setTransform(1, 0, 0, 1, this.canvasDebug.width / 2, this.canvasDebug.height / 2);
            this.debugCtx.scale(1, -1);
        }

        
    }

    update(dt: number) {
        this.physics.update(dt);
        this.updateEvent.next(dt);
    }

    render(dt: number) {
        this.renderEvent.next(dt);
        
        this.camera.render();
        this.graphics.scene.render();
        
        if (this.canvasDebug && isVisible(this.canvasDebug)) {
            this.debugCtx.save();
            this.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.debugCtx.clearRect(0, 0, this.debugCtx.canvas.width, this.debugCtx.canvas.height);
            this.debugCtx.restore();
            this.debugCtx.save();

            this.debugCtx.rotate(this.graphics.camera.alpha + Math.PI / 2);
            
            const scale = 1 / this.graphics.camera.radius * 20;
            this.debugCtx.scale(scale, scale);
            
            if (this.graphics.camera.lockedTarget) {
                this.debugCtx.translate(
                    -this.graphics.camera.lockedTarget.position.x * 30,
                    -this.graphics.camera.lockedTarget.position.z * 30);
            } else {
                this.debugCtx.translate(
                    -this.graphics.camera.target.x * 30,
                    -this.graphics.camera.target.z * 30);
            }

            
            
            
            
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
        
        // this.graphics.engine.runRenderLoop(() => {
        //     this.renderIterationEvent.next();
        // });
    }
}

const env = new Enviornment();

import map from "./maps/map01";
map(env);

env.run();