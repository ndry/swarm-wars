import * as PIXI from "pixi.js";
import Box2D from "box2dweb";

import b2Body = Box2D.Dynamics.b2Body;
import b2World = Box2D.Dynamics.b2World;

export interface Object {
    update(dt: number): void;
    render(): void;
}

export class Container {
    objects: Object[] = [];

    add(object: Object) {
        this.objects.push(object);
    }

    remove(object: Object) {
        this.objects.splice(this.objects.indexOf(object), 1);
    }

    update(dt: number) {
        for (const object of this.objects) {
            object.update(dt);
        }
    }

    render() {
        for (const object of this.objects) {
            object.render();
        }
    }
}
