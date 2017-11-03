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

const fpsLabel = document.getElementById("fps-label");

const world = new b2World(new b2Vec2(0, 0), true);
const gravity = new Gravity(world);

const cnt = new game.Container();

let earth: b2Body;
for(var i = 0; i < 1; ++i) {
    let body = world.CreateBody((() => {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = Math.random() * 900 + 100;
        bodyDef.position.y = Math.random() * 450 + 50;
        bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
        // bodyDef.linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
        return bodyDef;
    })());
    body.CreateFixture((() => {
        var fixDef = new b2FixtureDef;
        fixDef.density = 10.0;
        fixDef.friction = 1.0;
        fixDef.restitution = .1;
        fixDef.shape = new b2CircleShape(
            1
        );
        return fixDef;
    })());
    earth = body;
}

for(var i = 0; i < 200; ++i) {
    world.CreateBody((() => {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        const d = (Math.random() - .5) * 100;
        const a = Math.random() * 2 * Math.PI;
        bodyDef.position.Set(Math.cos(a), -Math.sin(a));
        bodyDef.position.Multiply(d);
        bodyDef.position.Add(earth.GetPosition());
        bodyDef.angularVelocity = 20 * (Math.random() - 0.5);

        
        bodyDef.linearVelocity.SetV(earth.GetPosition());
        bodyDef.linearVelocity.Subtract(bodyDef.position);
        bodyDef.linearVelocity.CrossFV(1);
        const dstLen = bodyDef.linearVelocity.Normalize();
        bodyDef.linearVelocity.Multiply(1 * Math.sqrt(gravity.gravitationalConstant * earth.GetMass() / dstLen));

        // bodyDef.linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
        return bodyDef;
    })()).CreateFixture((() => {
        var fixDef = new b2FixtureDef;
        fixDef.density = 0.005;
        fixDef.friction = 1.0;
        fixDef.restitution = .1;
        fixDef.shape = new b2CircleShape(
            Math.random() * .5 + .1
        );
        return fixDef;
    })());
}

// for(var i = 0; i < 2; ++i) {
//     world.CreateBody((() => {
//         var bodyDef = new b2BodyDef;
//         bodyDef.type = b2Body.b2_dynamicBody;
//         bodyDef.position.x = Math.random() * 900 + 100;
//         bodyDef.position.y = Math.random() * 450 + 50;
//         bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
//         bodyDef.linearVelocity.Set(15 * (Math.random() - 0.5), 15 * (Math.random() - 0.5));
//         return bodyDef;
//     })()).CreateFixture((() => {
//         var fixDef = new b2FixtureDef;
//         fixDef.density = 5.0;
//         fixDef.friction = 1.0;
//         fixDef.restitution = .9;
//         fixDef.shape = new b2CircleShape(
//             Math.random() * 10 + 10
//         );
//         return fixDef;
//     })());
// }

const debugCtx = (document.getElementById("canvas") as HTMLCanvasElement).getContext("2d");
const debugDraw = (() => {
    const debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugCtx);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(.1);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    //debugDraw.SetDrawScale(1/10);
    return debugDraw;
})();

world.SetDebugDraw(debugDraw);



const pointerHandler = new PointerHandler(world);
const fpsTracker = new FpsTracker();



function update(timestamp: number) {
    requestAnimationFrame(update);
    
    // update
    {
        fpsTracker.update(timestamp);
        pointerHandler.update();
        
        world.ClearForces();
        gravity.update();

        world.Step(1 / 60, 10, 10);
        world.ClearForces();
    }
    
    // render
    {
        debugCtx.save();
        // const scale = 10 / 6.957e9;
        const scale = 10;
        debugCtx.clearRect(0, 0, debugCtx.canvas.width, debugCtx.canvas.height);
        debugCtx.translate(
            debugCtx.canvas.width / 2, 
            debugCtx.canvas.height / 2); 
        // debugCtx.rotate(- earth.GetAngle());
        debugCtx.scale(scale, scale);
        debugCtx.translate(
            - earth.GetPosition().x, 
            - earth.GetPosition().y);
        world.DrawDebugData();
        debugCtx.restore();

        fpsLabel.innerText = `FPS ${fpsTracker.fps && fpsTracker.fps.toFixed(2)}`;
    }
};

requestAnimationFrame(update);
