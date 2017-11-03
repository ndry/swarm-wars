import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;

export class Gravity {
    gravitationalConstant: number;

    constructor(
        private world: b2World,
        gravitationalConstant: number = 10) {
        this.gravitationalConstant = gravitationalConstant;
    }

    update() {
        const dst = new b2Vec2(0, 0);
        for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                if (thisBody === otherBody) { continue; }
                dst.SetV(otherBody.GetPosition());
                dst.Subtract(thisBody.GetPosition());
                const dstLen = dst.Normalize();
                if (dstLen > 0) {
                    dst.Multiply(this.gravitationalConstant * thisBody.GetMass() * otherBody.GetMass() / (dstLen * dstLen));
                    thisBody.ApplyForce(dst, thisBody.GetPosition());
                }
            }
        }
    }
}
