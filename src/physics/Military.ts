import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;

export namespace Military {
    export interface State {
        hitPoints: number;
        faction: any;
        attack: number;
        defense: number;
        range: number;
    }
}

export class Military {
    
    constructor(
        private world: b2World
    ) {
    }

    update(dt: number) {
        const dst = new b2Vec2(0, 0);
        for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const thisState = thisBody.GetUserData() as Military.State;
            if (!thisState) { continue; }
            if (!thisState.attack) { continue; }
            if (!thisState.range) { continue; }
            
            for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                if (thisBody === otherBody) { continue; }
                const otherState = otherBody.GetUserData() as Military.State;
                if (!otherState) { continue; }
                if (thisState.faction === otherState.faction) { continue; }

                dst.SetV(otherBody.GetPosition());
                dst.Subtract(thisBody.GetPosition());
                const dstLen = dst.Normalize();
                if (dstLen > thisState.range) { continue; }

                const damage = Math.max(1, thisState.attack - otherState.defense) / dstLen;
                otherState.hitPoints -= damage * dt;
            }
        }
    }
}
