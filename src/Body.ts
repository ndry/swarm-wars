import * as PIXI from "pixi.js";
import Box2D from "box2dweb";
import b2World = Box2D.Dynamics.b2World;
import b2BodyDef = Box2D.Dynamics.b2BodyDef;
import b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
import b2Body = Box2D.Dynamics.b2Body;
import b2Fixture = Box2D.Dynamics.b2Fixture;
import b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
import Rx from 'rxjs/Rx';
import { Camera } from "./Camera";

export class Body {
    static createSpriteTexture(renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer, radius: number) {
        const g = new PIXI.Graphics();
        g.boundsPadding = 1;
        g.beginFill(0xb4b4b4, .4);
        g.lineStyle(1, 0xb4b4b4);
        const cx = renderer instanceof PIXI.WebGLRenderer ? 0 : radius + g.boundsPadding;
        const cy = renderer instanceof PIXI.WebGLRenderer ? 0 : radius + g.boundsPadding;
        g.drawCircle(cx, cy, radius);
        g.endFill();
        g.moveTo(cx, cy);
        g.lineTo(cx + radius, cy);
        return renderer.generateTexture(g, 1, 5);
        
    };

    body: b2Body;
    fixture: b2Fixture;
    sprite: PIXI.Sprite;
    updateSubscription: Rx.Subscription;
    renderSubscription: Rx.Subscription;

    constructor(
        private env: {
            physics: {
                world: b2World
            },
            pixelsPerMeter: number,
            stage: PIXI.Container,
            renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer,
            updateEvent: Rx.Observable<number>,
            renderEvent: Rx.Observable<number>,
            camera: Camera
        },
        args: {
            position: {
                x: number,
                y: number
            },
            linearVelocity: {
                x: number,
                y: number
            },
            angle: number,
            angularVelocity: number,
            radius: number
        }
    ) {
        this.body = env.physics.world.CreateBody((() => {
            var bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.Set(args.position.x, args.position.y);
            bodyDef.linearVelocity.Set(args.linearVelocity.x, args.linearVelocity.y);
            bodyDef.angularVelocity = args.angularVelocity;
            bodyDef.angle = args.angle;
            return bodyDef;
        })());
        this.fixture = this.body.CreateFixture((() => {
            var fixDef = new b2FixtureDef;
            fixDef.density = 0.005;
            fixDef.friction = 1.0;
            fixDef.restitution = .1;
            fixDef.shape = new b2CircleShape(args.radius);
            return fixDef;
        })());

        this.sprite = new PIXI.Sprite(Body.createSpriteTexture(env.renderer, args.radius * this.env.pixelsPerMeter));
        this.sprite.anchor.set(.5, .5);
        this.sprite.interactive = true;
        this.sprite.hitArea = new PIXI.Circle(0, 0, args.radius * this.env.pixelsPerMeter);
        this.sprite.on("click", () => env.camera.target = this.sprite);
        this.sprite.on("mouseover", () => this.sprite.tint = 0xa0a0a0);
        this.sprite.on("mouseout", () => this.sprite.tint = 0xffffff);
        env.stage.addChild(this.sprite);
        
        this.updateSubscription = env.updateEvent.subscribe(dt => this.update(dt));
        this.renderSubscription = env.renderEvent.subscribe(() => this.render());
    }

    update(dt: number) {
        
    }
        
    render() {
        this.sprite.x = this.body.GetPosition().x * this.env.pixelsPerMeter;
        this.sprite.y = this.body.GetPosition().y * this.env.pixelsPerMeter;
        this.sprite.rotation = this.body.GetAngle();
    }
}
