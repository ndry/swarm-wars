import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;

export class Military {

    population: { [faction: string]: number };
    
    constructor(
        private world: b2World
    ) {
    }

    update(dt: number) {
        this.population = {};
        const dst = new b2Vec2(0, 0);
        for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const thisState = thisBody.GetUserData();
            if (!(thisState && Military.isUnit(thisState))) { continue; }
            
            this.population[thisState.faction] = (this.population[thisState.faction] || 0) + 1;
            
            for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                if (thisBody === otherBody) { continue; }
                const otherState = otherBody.GetUserData();
                if (!(otherState && Military.isUnit(otherState))) { continue; }
                if (thisState.faction === otherState.faction) { continue; }

                dst.SetV(otherBody.GetPosition());
                dst.Subtract(thisBody.GetPosition());
                const dstLen = dst.Normalize();
                
                this.attack(thisState, otherState, dstLen, dt);
            }
        }
    }

    attack(subject: Military.Unit, object: Military.Unit, distance: number, dt: number) {
        if (distance > subject.range) { return; }
        if (!subject.isEnergyAvailable) { return; }

        const damage = Math.max(1, subject.attack - object.defense) / distance;
        object.hitPoints -= damage * dt;
        subject.energyDelta -= subject.attack;
    }
}

export namespace Military {
    export interface Unit {
        _isMilitaryUnit_32f06fe34e8b40479c503df3a4d09997: boolean;
        energyDelta: number;
        isEnergyAvailable: boolean;
        hitPoints: number;
        faction: string;
        attack: number;
        defense: number;
        range: number;
    }
    export function isUnit(x: any): x is Unit {
        return !!(x as Unit)._isMilitaryUnit_32f06fe34e8b40479c503df3a4d09997;
    }
}
