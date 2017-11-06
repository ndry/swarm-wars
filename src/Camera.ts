export class Camera {
    target: any;
    scale: number = 1;
    trackRotation: boolean = false;

    constructor(
        private env: {
            
            pixelsPerMeter: number,
            debugCtx: CanvasRenderingContext2D
        }
    ) {
    }

    render() {
        // if (this.trackRotation && this.target) {
        //     this.env.stage.rotation = -this.target.rotation;
        // }
        // this.env.stage.scale.set(this.scale, this.scale);
        // if (this.target) {
        //     this.env.stage.pivot.set(this.target.position.x, this.target.position.y);
        // }
    }

    renderDebug() {
        if (this.trackRotation && this.target) {
            this.env.debugCtx.rotate(-this.target.rotation);
        }
        this.env.debugCtx.scale(this.scale * this.env.pixelsPerMeter, this.scale * this.env.pixelsPerMeter);
        if (this.target) {
            this.env.debugCtx.translate(-this.target.position.x / this.env.pixelsPerMeter, -this.target.position.y / this.env.pixelsPerMeter);
        }
    }
}
