import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;

export class SolarPower {

    constructor(
        private world: b2World
    ) {
    }

    update(dt: number) {
        const dst = new b2Vec2(0, 0);
        for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const thisState = thisBody.GetUserData() as SolarPower.Emitter;
            if (!(thisState && SolarPower.isEmitter(thisState))) { continue; }
            
            for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                if (thisBody === otherBody) { continue; }
                const otherState = otherBody.GetUserData() as SolarPower.Consumer;
                if (!(otherState && SolarPower.isConsumer(otherState))) { continue; }
                
                dst.SetV(otherBody.GetPosition());
                dst.Subtract(thisBody.GetPosition());
                const dstLen = dst.Normalize();
                
                this.consume(thisState, otherState, dstLen, dt);
            }
        }
    }

    consume(subject: SolarPower.Emitter, object: SolarPower.Consumer, distance: number, dt: number) {
        object.energyDelta += object.solarPanelEffectiveness * subject.power / (distance * 2 * Math.PI);
    }
}

export namespace SolarPower {
    export interface Emitter {
        _isSolarPowerEmitter_e21c9b9535744f61a1f899bbcdfdc30d: boolean;
        power: number;
    }
    export function isEmitter(x: any): x is Emitter {
        return !!(x as Emitter)._isSolarPowerEmitter_e21c9b9535744f61a1f899bbcdfdc30d;
    }
    export interface Consumer {
        _isSolarPowerConsumer_67a1c006936742cfaf30324c6a6c7baa: boolean;
        solarPanelEffectiveness: number;
        energyDelta: number;
    }
    export function isConsumer(x: any): x is Consumer {
        return !!(x as Consumer)._isSolarPowerConsumer_67a1c006936742cfaf30324c6a6c7baa;
    }
}