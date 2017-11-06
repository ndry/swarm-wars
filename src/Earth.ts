import Box2D from "box2dweb";
import b2World = Box2D.Dynamics.b2World;
import b2BodyDef = Box2D.Dynamics.b2BodyDef;
import b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
import b2Body = Box2D.Dynamics.b2Body;
import b2Fixture = Box2D.Dynamics.b2Fixture;
import b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

import BABYLON from "babylonjs";

import Rx from 'rxjs/Rx';
import { Camera } from "./Camera";

export namespace Earth {
    export interface Environment {
        physics: {
            world: b2World
        },
        graphics: {
            scene: BABYLON.Scene;
            camera: BABYLON.ArcRotateCamera;
        }
        pixelsPerMeter: number,
        updateEvent: Rx.Observable<number>,
        renderEvent: Rx.Observable<number>,
        camera: Camera
    }
}

export class Earth {
    body: b2Body;
    fixture: b2Fixture;
    mesh: BABYLON.Mesh;
    light: BABYLON.PointLight;
    updateSubscription: Rx.Subscription;
    renderSubscription: Rx.Subscription;

    constructor(
        private env: Earth.Environment
    ) {
        const radius = 1;

        this.body = env.physics.world.CreateBody((() => {
            var bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = 0;
            bodyDef.position.y = 0;
            bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
            // bodyDef.linearVelocity.Set(10 * (Math.random() - 0.5), 10 * (Math.random() - 0.5));
            return bodyDef;
        })());
        this.fixture = this.body.CreateFixture((() => {
            var fixDef = new b2FixtureDef;
            fixDef.density = 10.0;
            fixDef.friction = 1.0;
            fixDef.restitution = .1;
            fixDef.shape = new b2CircleShape(
                1
            );
            return fixDef;
        })());

        this.mesh = BABYLON.MeshBuilder.CreateSphere("", {segments: 4, diameter: radius * 2}, this.env.graphics.scene);
        const m = new BABYLON.StandardMaterial("", env.graphics.scene);
        m.emissiveColor = new BABYLON.Color3(1, 1, 1);
        this.mesh.material = m;

        this.light = new BABYLON.PointLight("", new BABYLON.Vector3(0, 0, 0), this.env.graphics.scene);
            
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
        

        this.updateSubscription = env.updateEvent.subscribe(dt => this.update(dt));
        this.renderSubscription = env.renderEvent.subscribe(() => this.render());
    }

    update(dt: number) {

    }

    render() {
        this.mesh.position.x = this.body.GetPosition().x;
        this.mesh.position.z = this.body.GetPosition().y;
        this.mesh.rotation.y = this.body.GetAngle();
        this.light.position.x = this.body.GetPosition().x;
        this.light.position.z = this.body.GetPosition().y;
    }
}
