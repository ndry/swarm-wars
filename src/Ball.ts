import * as PIXI from "pixi.js";
import * as physics from "./physics";
import * as game from "./game";

export class Ball extends game.Object<PIXI.Sprite> {
    static spriteTexture(radius: number) {
        const g = new PIXI.Graphics();
        //g.beginFill(0x00ff00);
        g.lineStyle(1, 0x00ffff);
        g.drawCircle(0, 0, radius);
        //g.endFill();
        return g.generateCanvasTexture();
    };
    
    constructor(radius: number) {
        super();

        this.physicsObject = new physics.Object();
        this.physicsObject.density = 1;
        this.physicsObject.elasticity = 1;
        this.physicsObject.radius = radius;

        this.pixiObject = new PIXI.Sprite(Ball.spriteTexture(radius));
        this.pixiObject.anchor.set(.5, .5);
    }

    render() {
        super.render();
    }
}
