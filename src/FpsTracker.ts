export class FpsTracker {
    historicalFactor: number;

    fps: number = null;

    constructor(historicalFactor: number = 0.95) {
        this.historicalFactor = historicalFactor;
    }

    update(dt: number) {
        const momentFps = 1 / dt * 1000;
        if (this.fps !== null && isFinite(this.fps)) {
            this.fps =
                this.fps * this.historicalFactor
                + momentFps * (1 - this.historicalFactor);
        } else {
            this.fps = momentFps;
        }
    }
}
