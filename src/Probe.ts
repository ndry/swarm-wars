import Box2D from "box2dweb";
import b2World = Box2D.Dynamics.b2World;
import b2BodyDef = Box2D.Dynamics.b2BodyDef;
import b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
import b2Body = Box2D.Dynamics.b2Body;
import b2Fixture = Box2D.Dynamics.b2Fixture;
import b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

import Rx from 'rxjs/Rx';

export namespace Probe {
    export interface Environment {
        physics: {
            world: b2World
        },
        graphics: {
            scene: BABYLON.Scene;
            camera: BABYLON.ArcRotateCamera;
        }
        pixelsPerMeter: number,
        updateObservable: Rx.Observable<number>,
        renderObservable: Rx.Observable<number>
    }
}

export class Probe {
    body: b2Body;
    fixture: b2Fixture;
    mesh: BABYLON.Mesh;
    updateSubscription: Rx.Subscription;
    renderSubscription: Rx.Subscription;

    constructor(
        private env: Probe.Environment,
        private args: {
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
            radius: number,
            density: number,
            color: BABYLON.Color3
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
            fixDef.density = args.density;
            fixDef.friction = 1.0;
            fixDef.restitution = .1;
            fixDef.shape = new b2CircleShape(args.radius);
            return fixDef;
        })());

        this.mesh = BABYLON.MeshBuilder.CreateSphere("", {segments: 4, diameter: args.radius * 2}, this.env.graphics.scene);
        const m = new BABYLON.StandardMaterial("", env.graphics.scene);
        m.diffuseColor = args.color;
        this.mesh.material = m;

        this.mesh.outlineColor = new BABYLON.Color3(0, 0, 1);
        this.mesh.outlineWidth = .05;

        this.mesh.actionManager = new BABYLON.ActionManager(this.env.graphics.scene);
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, evt => {
            this.mesh.renderOutline = true;
        }));
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, evt => {
            this.mesh.renderOutline = false;
        }));
        this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, evt => {
            this.env.graphics.camera.lockedTarget = this.mesh;
        }));
        
        
        this.updateSubscription = env.updateObservable.subscribe(dt => this.update(dt));
        this.renderSubscription = env.renderObservable.subscribe(() => this.render());
    }

    update(dt: number) {
        if (Math.random() < .001) {
            new Probe(this.env, {
                position: {
                    x: this.body.GetPosition().x + this.args.radius * Math.cos(this.body.GetAngle()),
                    y: this.body.GetPosition().y - this.args.radius * Math.sin(this.body.GetAngle())
                },
                linearVelocity: {
                    x: this.body.GetLinearVelocity().x,
                    y: this.body.GetLinearVelocity().y
                },
                angle: -this.body.GetAngle(),
                angularVelocity: -this.body.GetAngularVelocity(),
                radius: this.args.radius,
                color: this.args.color,
                density: this.fixture.GetDensity()
            });
        }
    }
        
    render() {
        this.mesh.position.x = this.body.GetPosition().x;
        this.mesh.position.z = this.body.GetPosition().y;
        this.mesh.rotation.y = this.body.GetAngle();
    }
}
