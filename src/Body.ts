import * as PIXI from "pixi.js";
import Box2D from "box2dweb";
import b2World = Box2D.Dynamics.b2World;
import b2BodyDef = Box2D.Dynamics.b2BodyDef;
import b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
import b2Body = Box2D.Dynamics.b2Body;
import b2Fixture = Box2D.Dynamics.b2Fixture;
import b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
import * as game from "./game";

export class Body {
    static createSpriteTexture(renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer, radius: number) {
        const g = new PIXI.Graphics();
        g.boundsPadding = 1;
        g.beginFill(0xe6b4b4, .4);
        g.lineStyle(.1 * 10, 0xe6b4b4);
        g.drawCircle(0, 0, radius * 10);
        g.endFill();
        g.moveTo(0, 0);
        g.lineTo(radius * 10, 0);
        return renderer.generateTexture(g, .5, 5);
        
    };

    body: b2Body;
    fixture: b2Fixture;
    sprite: PIXI.Sprite;
    object: game.Object;

    constructor(
        private env: {
            world: b2World,
            stage: PIXI.Container,
            gameContainer: game.Container,
            renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer
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
        this.body = env.world.CreateBody((() => {
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

        this.sprite = new PIXI.Sprite(Body.createSpriteTexture(env.renderer, args.radius));
        this.sprite.scale.set(.1);
        this.sprite.anchor.set(.5, .5);
        env.stage.addChild(this.sprite);
        
        this.object = {
            update: (dt) => {},
            render: () => this.render()
        };
        env.gameContainer.add(this.object);
    }

    render() {
        this.sprite.x = this.body.GetPosition().x;
        this.sprite.y = this.body.GetPosition().y;
        this.sprite.rotation = this.body.GetAngle();
    }
}
