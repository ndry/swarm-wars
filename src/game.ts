import * as PIXI from "pixi.js";
import Box2D from "box2dweb";

import b2Body = Box2D.Dynamics.b2Body;
import b2World = Box2D.Dynamics.b2World;

export interface IObject {
    physicsObject: b2Body;
    displayObject: PIXI.DisplayObject;
    update(dt: number): void;
    render(): void;
}

export class Object<PIXIObject extends PIXI.DisplayObject> implements IObject {
    physicsObject: b2Body;
    displayObject: PIXIObject;

    constructor(physicsObject: b2Body, displayObject: PIXIObject) {

    }

    update(dt: number) {

    }

    render() {
        this.displayObject.x = this.physicsObject.GetPosition().x;
        this.displayObject.y = this.physicsObject.GetPosition().y;
    }
}

export class Container {
    objects: IObject[] = [];

    add(object: IObject) {
        this.objects.push(object);
    }

    remove(object: IObject) {
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
