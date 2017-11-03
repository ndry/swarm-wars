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

import PIXI from "pixi.js";



const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const canvasDebug = document.getElementById("canvas-debug") as HTMLCanvasElement;
canvasDebug.width = canvasDebug.clientWidth;
canvasDebug.height = canvasDebug.clientHeight;

const renderer = PIXI.autoDetectRenderer(canvas.clientWidth, canvas.clientHeight, {
    view: canvas,
    antialias: true
});
const stage = new PIXI.Container();



const fpsLabel = document.getElementById("fps-label");

const world = new b2World(new b2Vec2(0, 0), true);
const gravity = new Gravity(world);

const cnt = new game.Container();

class Earth {
    static createSpriteTexture(radius: number) {
        const g = new PIXI.Graphics();
        g.beginFill(0x334045);
        g.lineStyle(1, 0xadd8e6);
        g.drawCircle(0, 0, radius);
        g.endFill();
        return g.generateCanvasTexture();
    };

    body: b2Body;
    fixture: b2Fixture;
    sprite: PIXI.Sprite;

    constructor() {
        this.body = world.CreateBody((() => {
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

        const scale = 1 / 1000;
        this.sprite = new PIXI.Sprite(Earth.createSpriteTexture(1 / scale));
        this.sprite.scale.set(1 * scale);
        this.sprite.anchor.set(.5, .5);
        stage.addChild(this.sprite);
    }

    render() {
        this.sprite.x = this.body.GetPosition().x;
        this.sprite.y = this.body.GetPosition().y;
        this.sprite.rotation = this.body.GetAngle();
    }
}

const earth = new Earth();

for(var i = 0; i < 200; ++i) {
    world.CreateBody((() => {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        const d = (Math.random() - .5) * 100;
        const a = Math.random() * 2 * Math.PI;
        bodyDef.position.Set(Math.cos(a), -Math.sin(a));
        bodyDef.position.Multiply(d);
        bodyDef.position.Add(earth.body.GetPosition());
        bodyDef.angularVelocity = 20 * (Math.random() - 0.5);

        
        bodyDef.linearVelocity.SetV(earth.body.GetPosition());
        bodyDef.linearVelocity.Subtract(bodyDef.position);
        bodyDef.linearVelocity.CrossFV(1);
        const dstLen = bodyDef.linearVelocity.Normalize();
        bodyDef.linearVelocity.Multiply(1 * Math.sqrt(gravity.gravitationalConstant * earth.body.GetMass() / dstLen));

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

const debugCtx = canvasDebug.getContext("2d");
const debugDraw = (() => {
    const debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugCtx);
    debugDraw.SetFillAlpha(0);
    debugDraw.SetLineThickness(.05);
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
        earth.render();

        const scale = 10;

        stage.position.set(
            canvas.width / 2, 
            canvas.height / 2);
        
        stage.scale.set(scale, scale);

        stage.pivot.set(
            earth.sprite.position.x, 
            earth.sprite.position.y);

        renderer.render(stage);

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
        world.DrawDebugData();
        debugCtx.restore();

        fpsLabel.innerText = `FPS ${fpsTracker.fps && fpsTracker.fps.toFixed(2)}`;
    }
};

requestAnimationFrame(update);
