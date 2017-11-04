import _ from "underscore";

import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2AABB = Box2D.Collision.b2AABB;
import b2BodyDef = Box2D.Dynamics.b2BodyDef;
import b2Body = Box2D.Dynamics.b2Body;
import b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
import b2Fixture = Box2D.Dynamics.b2Fixture;
import b2World = Box2D.Dynamics.b2World;
import b2MassData = Box2D.Collision.Shapes.b2MassData;
import b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
import b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
import b2MouseJoint =  Box2D.Dynamics.Joints.b2MouseJoint;
import b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

import { PointerHandler } from "./PointerHandler";
import { FpsTracker } from "./FpsTracker";
import { Gravity } from "./Gravity";

import * as game from "./game";

import PIXI, { Container } from "pixi.js";

import { Earth } from "./Earth";
import { Body } from "./Body";

class Enviornment {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvasDebug = document.getElementById("canvas-debug") as HTMLCanvasElement;
    renderer = PIXI.autoDetectRenderer(this.canvas.clientWidth, this.canvas.clientHeight, {
        view: this.canvas,
        antialias: true
    });
    stage = new PIXI.Container();
    fpsLabel = document.getElementById("fps-label");


    world = new b2World(new b2Vec2(0, 0), true);
    gravity = new Gravity(this.world);


    gameContainer = new game.Container();
}

const env = new Enviornment();

function adjustDisplay() {
    env.canvas.width = env.canvas.clientWidth;
    env.canvas.height = env.canvas.clientHeight;

    env.canvasDebug.width = env.canvasDebug.clientWidth;
    env.canvasDebug.height = env.canvasDebug.clientHeight;
}

window.addEventListener("resize", adjustDisplay);
adjustDisplay();



const earth = new Earth(env);


const bodies: Body[] = [];
for(var i = 0; i < 200; ++i) {
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
    linearVelocity.Multiply(1 * Math.sqrt(env.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
    // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));


    bodies.push(new Body(env, {
        position: position,
        linearVelocity: linearVelocity,
        angle: Math.random() * 2 * Math.PI,
        angularVelocity: 20 * (Math.random() - 0.5),
        radius: Math.random() * .5 + .1
    }));
}


const debugCtx = env.canvasDebug.getContext("2d");

env.world.SetDebugDraw((() => {
    const debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugCtx);
    debugDraw.SetFillAlpha(0.4);
    debugDraw.SetLineThickness(.05);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    //debugDraw.SetDrawScale(1/10);
    return debugDraw;
})());




const pointerHandler = new PointerHandler(env.world);
const fpsTracker = new FpsTracker();



function update(timestamp: number) {
    requestAnimationFrame(update);
    
    // update
    {
        fpsTracker.update(timestamp);
        pointerHandler.update();
        
        env.world.ClearForces();
        env.gravity.update();

        env.world.Step(1 / 60, 10, 10);
        
        env.gameContainer.update(1 / 60);

    }
    
    // render
    {
        env.gameContainer.render();

        const scale = 10;

        env.stage.position.set(
            env.canvas.width / 2, 
            env.canvas.height / 2);
        
        env.stage.scale.set(scale, scale);

        env.stage.pivot.set(
            earth.sprite.position.x, 
            earth.sprite.position.y);

        env.renderer.render(env.stage);

        debugCtx.save();
        debugCtx.clearRect(0, 0, debugCtx.canvas.width, debugCtx.canvas.height);
        debugCtx.translate(
            debugCtx.canvas.width / 2, 
            debugCtx.canvas.height / 2); 
        // debugCtx.rotate(- earth.GetAngle());
        debugCtx.scale(scale, scale);
        debugCtx.translate(
            - earth.body.GetPosition().x, 
            - earth.body.GetPosition().y);
            env.world.DrawDebugData();
        debugCtx.restore();

        env.fpsLabel.innerText = `FPS ${fpsTracker.fps && fpsTracker.fps.toFixed(2)}`;
    }
};

requestAnimationFrame(update);
