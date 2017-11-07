import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;

export class Energy {

    constructor(
        private world: b2World
    ) {
    }

    update(dt: number) {
        const dst = new b2Vec2(0, 0);
        for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const thisState = thisBody.GetUserData();
            if (!(thisState && Energy.isContainer(thisState))) { continue; }
            
            this.act(thisState, dt);
        }
    }

    act(subject: Energy.Container, dt: number) {
        subject.energy = Math.min(subject.energy - subject.energyDelta, subject.energyCapacity)
        subject.energyDelta = 0;
        subject.isEnergyAvailable = subject.energy > 0;
    }
}

export namespace Energy {
    export interface Container {
        _isEnergyContainer_6589b4689768470f889fdc0bb502d061: boolean;
        energy: number;
        energyDelta: number;
        energyCapacity: number;
        isEnergyAvailable: boolean;
    }
    export function isContainer(x: any): x is Container {
        return !!(x as Container)._isEnergyContainer_6589b4689768470f889fdc0bb502d061;
    }
}