import _ from "underscore";
import Rx from 'rxjs/Rx';

import { Physics } from "./physics/Physics";

import { isVisible, adjust } from "./utils";
import { FpsTracker } from "./FpsTracker";
import { GraphicsEnvionment } from "./graphics/GraphicsEnvironment";


export class Enviornment {
    physics = new Physics();

    pixelsPerMeter = 30;
    targetUps = 60;

    upsTracker = new FpsTracker();
    fpsTracker = new FpsTracker();

    canvas = adjust(document.getElementById("canvas") as HTMLCanvasElement, canvas => {
        canvas.addEventListener("contextmenu", ev => ev.preventDefault());
    });
    
    graphics = new GraphicsEnvionment(this);

    

    updateObservable = new Rx.Subject<number>();
    renderObservable = new Rx.Subject<number>();


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

        // this.graphics.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        // const ratio = this.graphics.engine.getRenderWidth() / this.graphics.engine.getRenderHeight();
        // const halfWidth = 20;
        // this.graphics.camera.orthoLeft = -halfWidth;
        // this.graphics.camera.orthoRight = halfWidth;
        // this.graphics.camera.orthoTop = -halfWidth / ratio;
        // this.graphics.camera.orthoBottom = halfWidth / ratio;


        this.graphics.guiView.pauseButton.onPointerUpObservable.add(() => {
            this.isPaused = !this.isPaused;
        });

        this.graphics.guiView.stepButton.onPointerUpObservable.add(() => {
            this.update(1 / 60);
        });

        this.graphics.guiView.toggleGravityButton.onPointerUpObservable.add(() => {
            this.physics.isGravityOn = !this.physics.isGravityOn
        });

        this.graphics.guiView.toggleWorldGuiButton.onPointerUpObservable.add(() => {
            this.graphics.isWorldGuiOn = !this.graphics.isWorldGuiOn;
        });

        window.addEventListener("resize", this.adjustDisplay);
        this.adjustDisplay();
    }

    adjustDisplay() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    
        this.graphics.engine.resize();
    }

    update(dt: number) {
        this.physics.update(dt);
        this.updateObservable.next(dt);
    }

    render(dt: number) {
        this.renderObservable.next(dt);
        this.graphics.scene.render();
        
        this.graphics.guiView.bodyCountLabel.text = `Bodies: ${this.physics.world.GetBodyCount()}`;
        this.graphics.guiView.fpsLabel.text = `FPS ${this.fpsTracker.fps && this.fpsTracker.fps.toFixed(2)}`
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
