import * as PIXI from "pixi.js";

export class Camera {
    target: PIXI.DisplayObject;
    scale: number = 10;
    trackRotation: boolean = false;

    constructor(
        private env: {
            stage: PIXI.Container,
            debugCtx: CanvasRenderingContext2D
        }
    ) {
    }

    render() {
        if (this.trackRotation && this.target) {
            this.env.stage.rotation = -this.target.rotation;
        }
        this.env.stage.scale.set(this.scale, this.scale);
        if (this.target) {
            this.env.stage.pivot.set(this.target.position.x, this.target.position.y);
        }
    }

    renderDebug() {
        if (this.trackRotation && this.target) {
            this.env.debugCtx.rotate(-this.target.rotation);
        }
        this.env.debugCtx.scale(this.scale, this.scale);
        if (this.target) {
            this.env.debugCtx.translate(-this.target.position.x, -this.target.position.y);
        }
    }
}

export namespace Camera {
    export interface Target { 
        pivot: {
            x: number, 
            y: number
        }, 
        rotation: number, 
        scale: number 
    }
}