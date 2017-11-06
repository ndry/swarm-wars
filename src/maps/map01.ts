import { Earth } from "../Earth";
import { Body } from "../Body";
import { Probe } from "../Probe";

import Rx from 'rxjs/Rx';
import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
import { Camera } from "../Camera";


export default function (env: {
    physics: {
        world: b2World,
        gravity: {
            gravitationalConstant: number
        }
    },
    pixelsPerMeter: number,
    stage: PIXI.Container,
    renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer,
    updateEvent: Rx.Observable<number>,
    renderEvent: Rx.Observable<number>,
    camera: Camera
}) {
    const earth = new Earth(env);
    env.camera.target = earth.sprite;
    
    const bodies: Body[] = [];
    for(var i = 0; i < 100; ++i) {
        const d = (Math.random() - .5) * 100;
        const a = Math.random() * 2 * Math.PI;
        const position = new b2Vec2(Math.cos(a), -Math.sin(a));
        position.Multiply(d);
        position.Add(earth.body.GetPosition());
        
        
        const linearVelocity = earth.body.GetPosition().Copy();
        linearVelocity.SetV(earth.body.GetPosition());
        linearVelocity.Subtract(position);
        linearVelocity.CrossFV(1);
        const dstLen = linearVelocity.Normalize();
        linearVelocity.Multiply(1 * Math.sqrt(env.physics.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
        // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
    
    
        bodies.push(new Body(env, {
            position: position,
            linearVelocity: linearVelocity,
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: Math.random() * .5 + .1
        }));
    }
    
    const probes: Probe[] = [];
    for(var i = 0; i < 100; ++i) {
        const d = (Math.random() - .5) * 100;
        const a = Math.random() * 2 * Math.PI;
        const position = new b2Vec2(Math.cos(a), -Math.sin(a));
        position.Multiply(d);
        position.Add(earth.body.GetPosition());
        
        
        const linearVelocity = earth.body.GetPosition().Copy();
        linearVelocity.SetV(earth.body.GetPosition());
        linearVelocity.Subtract(position);
        linearVelocity.CrossFV(1);
        const dstLen = linearVelocity.Normalize();
        linearVelocity.Multiply(1 * Math.sqrt(env.physics.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
        // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
    
    
        probes.push(new Probe(env, {
            position: position,
            linearVelocity: linearVelocity,
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: Math.random() * .5 + .1,
            color: (Math.random() < .5) ? 0xff0000 : 0x00ff00
        }));
    }    
}