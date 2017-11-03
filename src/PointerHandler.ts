import _ from "underscore";

import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2AABB = Box2D.Collision.b2AABB;
import b2Body = Box2D.Dynamics.b2Body;
import b2World = Box2D.Dynamics.b2World;
import b2MouseJoint =  Box2D.Dynamics.Joints.b2MouseJoint;
import b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;


export class PointerHandler {

    lastPointer: b2Vec2;
    joint: b2MouseJoint;

    constructor(private world: b2World) {
        _.bindAll(this, "handlePointerDown", "handlePointerUp", "handlePointerMove");
        document.addEventListener("pointerdown", this.handlePointerDown, true);
        document.addEventListener("pointerup", this.handlePointerUp, true);
    }

    handlePointerDown(e: PointerEvent) {
        this.lastPointer = new b2Vec2(e.offsetX, e.offsetY);
        document.addEventListener("pointermove", this.handlePointerMove, true);
    }

    handlePointerUp() {
        document.removeEventListener("pointermove", this.handlePointerMove, true);
        this.lastPointer = null;
    }
    
    handlePointerMove(e: PointerEvent) {
        this.lastPointer.Set(e.offsetX, e.offsetY);
        e.preventDefault();
    }

    getBodyAtMouse(): b2Body {
        let selectedBody = null;
        this.world.QueryAABB(fixture => {
            if (fixture.GetBody().GetType() == b2Body.b2_staticBody) {
                return true;
            }
            if (!fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), this.lastPointer)) {
                return true;
            }
            selectedBody = fixture.GetBody();
            return false;
        }, (() => {
            const aabb = new b2AABB();
            aabb.lowerBound.Set(this.lastPointer.x - 0.001, this.lastPointer.y - 0.001);
            aabb.upperBound.Set(this.lastPointer.x + 0.001, this.lastPointer.y + 0.001);
            return aabb;
        })());
        return selectedBody;
    }

    update() {
        if (this.lastPointer && (!this.joint)) {
            let body = this.getBodyAtMouse();
            if (body) {
                this.joint = this.world.CreateJoint((() => {
                    var def = new b2MouseJointDef();
                    def.bodyA = this.world.GetGroundBody();
                    def.bodyB = body;
                    def
                        // @ts-ignore Property is lacking is .d.ts only
                        .target
                        = this.lastPointer;
                    def.collideConnected = true;
                    def.maxForce = 300.0 * body.GetMass();
                    return def;
                })()) as b2MouseJoint;
                body.SetAwake(true);
            }
        }
        
        if (this.joint) {
            if (this.lastPointer) {
                this.joint.SetTarget(this.lastPointer);
            } else {
                this.world.DestroyJoint(this.joint);
                this.joint = null;
            }
        }
    }
}
