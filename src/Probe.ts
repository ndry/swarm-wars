import Box2D from "box2dweb";
import b2World = Box2D.Dynamics.b2World;
import b2BodyDef = Box2D.Dynamics.b2BodyDef;
import b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
import b2Body = Box2D.Dynamics.b2Body;
import b2Fixture = Box2D.Dynamics.b2Fixture;
import b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

import Rx from 'rxjs/Rx';
import { Military } from "./physics/Military";
import { adjust } from "./utils";


        
var createLabel = function(mesh: BABYLON.Mesh, scene: BABYLON.Scene) {
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1", false, scene);
    var label = new BABYLON.GUI.Rectangle("label for " + mesh.name);
    label.background = "black"
    label.height = "30px";
    label.alpha = 0.5;
    label.width = "100px";
    label.cornerRadius = 20;
    label.thickness = 1;
    label.linkOffsetY = 30;
    advancedTexture.addControl(label); 
    label.linkWithMesh(mesh);

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = mesh.name;
    text1.color = "white";
    label.addControl(text1);  

    return text1;
}  


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
    
    state: Military.State = {
        hitPoints: 100,
        attack: 10,
        defense: 10,
        faction: this.args.color.toHexString(),
        range: this.args.radius * 5
    };

    body = this.env.physics.world.CreateBody((() => {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(this.args.position.x, this.args.position.y);
        bodyDef.linearVelocity.Set(this.args.linearVelocity.x, this.args.linearVelocity.y);
        bodyDef.angularVelocity = this.args.angularVelocity;
        bodyDef.angle = this.args.angle;
        bodyDef.userData = this.state;
        return bodyDef;
    })());

    fixture = this.body.CreateFixture((() => {
        var fixDef = new b2FixtureDef;
        fixDef.density = this.args.density;
        fixDef.friction = 1.0;
        fixDef.restitution = .1;
        fixDef.shape = new b2CircleShape(this.args.radius);
        return fixDef;
    })());

    mesh = adjust(BABYLON.MeshBuilder.CreateSphere("", {
        segments: 4, 
        diameter: this.args.radius * 2
    }, this.env.graphics.scene), mesh => {
        const m = new BABYLON.StandardMaterial("", this.env.graphics.scene);
        m.diffuseColor = this.args.color;
        mesh.material = m;

        mesh.outlineColor = new BABYLON.Color3(0, 0, 1);
        mesh.outlineWidth = .05;

        mesh.actionManager = new BABYLON.ActionManager(this.env.graphics.scene);
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, evt => {
            mesh.renderOutline = true;
        }));
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, evt => {
            mesh.renderOutline = false;
        }));
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, evt => {
            this.env.graphics.camera.lockedTarget = mesh;
        }));
    })

    label = createLabel(this.mesh, this.env.graphics.scene);

    updateSubscription = this.env.updateObservable.subscribe(dt => this.update(dt));
    renderSubscription = this.env.renderObservable.subscribe(() => this.render());


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
        this.label.text = this.state.hitPoints.toFixed(2);
    }
}
