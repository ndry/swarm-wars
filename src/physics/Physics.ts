import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;

import { Gravity } from "./Gravity";
import { Military } from "./Military";

export class Physics {
    isGravityOn = true;

    world = new b2World(new b2Vec2(0, 0), true);
    gravity = new Gravity(this.world);
    military = new Military(this.world);

    update(dt: number) {
        this.world.ClearForces();
        if (this.isGravityOn) {
            this.gravity.update(dt);
        }
        this.world.Step(dt, 10, 10);
        this.military.update(dt);
    }
}
