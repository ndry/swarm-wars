import * as PIXI from "pixi.js";
import * as physics from "./physics";

export interface IObject {
    physicsObject: physics.Object;
    pixiObject: PIXI.DisplayObject;
    update(dt: number): void;
    render(): void;
}

export class Object<PIXIObject extends PIXI.DisplayObject> implements IObject {
    physicsObject: physics.Object;
    pixiObject: PIXIObject;

    update(dt: number) {

    }

    render() {
        this.pixiObject.x = this.physicsObject.position[0];
        this.pixiObject.y = this.physicsObject.position[1];
    }
}

export class Container {
    physicsContainer: physics.Container;
    pixiContainer: PIXI.Container;

    objects: IObject[] = [];

    add(object: IObject) {
        this.objects.push(object);
        this.physicsContainer.bodies.push(object.physicsObject);
        this.pixiContainer.addChild(object.pixiObject);
    }

    remove(object: IObject) {
        this.objects.splice(this.objects.indexOf(object), 1);
        this.physicsContainer.bodies.splice(this.physicsContainer.bodies.indexOf(object.physicsObject), 1);
        this.pixiContainer.removeChild(object.pixiObject);
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
