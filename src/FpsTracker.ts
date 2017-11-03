export class FpsTracker {
    historicalFactor: number;

    lastTime: number;
    fps: number;

    constructor(historicalFactor: number = 0.95) {
        this.historicalFactor = historicalFactor;
    }

    update(timestamp: number) {
        if (this.lastTime) {
            const dt = timestamp - this.lastTime;
            const momentFps = 1 / dt * 1000;
            if (this.fps) {
                this.fps = 
                    this.fps * this.historicalFactor
                    + momentFps * (1 - this.historicalFactor);
            } else {
                this.fps = momentFps;
            }
        }
        this.lastTime = timestamp;
    }
}
