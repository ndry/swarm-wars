import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;
import { adjust } from "../utils";
import { Chunk, ChunkManager } from "./ChunkManager";

export class Gravity {
    gravitationalConstant: number;

    constructor(
        private world: b2World,
        gravitationalConstant: number = 10,
    ) {
        this.gravitationalConstant = gravitationalConstant;
    }

    chunkSide = 10;
    chunkManager: ChunkManager<b2Body>;
    f: WeakMap<Chunk<b2Body>, {
        centerOfMass: b2Vec2,
        mass: number,
        gravitationalAcceleration: b2Vec2,
    }>;

    populateChunks() {
        this.f = new WeakMap<Chunk<b2Body>, {
            centerOfMass: b2Vec2,
            mass: number,
            gravitationalAcceleration: b2Vec2,
        }>();

        this.chunkManager = new ChunkManager(this.chunkSide);

        for (let thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            this.chunkManager.put(thisBody.GetPosition(), thisBody);
        }

        for (const chunk of this.chunkManager.chunks.values()) {
            this.f.set(chunk, {
                centerOfMass: new b2Vec2(),
                mass: 0,
                gravitationalAcceleration: new b2Vec2(),
            });
            const data = this.f.get(chunk);
            for (const body of chunk.entries) {
                const tmp = new b2Vec2();
                tmp.SetV(body.GetWorldCenter());
                tmp.Multiply(body.GetMass());
                data.centerOfMass.Add(tmp);
                data.mass += body.GetMass();
            }
            data.centerOfMass.Multiply(1 / data.mass);
        }

        for (const thisChunk of this.chunkManager.chunks.values()) {
            const thisData = this.f.get(thisChunk);
            for (const otherChunk of this.chunkManager.chunks.values()) {
                const otherData = this.f.get(otherChunk);

                if (Math.abs(thisChunk.position.x - otherChunk.position.x) <= 2 * this.chunkSide
                 && Math.abs(thisChunk.position.y - otherChunk.position.y) <= 2 * this.chunkSide) {
                    continue;
                }

                const g = new b2Vec2();
                g.SetV(otherData.centerOfMass);
                g.Subtract(otherData.centerOfMass);
                const dstLen = g.Normalize();
                if (dstLen > 0) {
                    g.Multiply(this.gravitationalConstant * otherData.mass / (dstLen * dstLen));
                    thisData.gravitationalAcceleration.Add(g);
                }
            }
        }
    }

    applyForces(dt: number) {
        const dst = new b2Vec2(0, 0);
        for (let thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const thisChunk = this.chunkManager.getChunk(thisBody.GetPosition());
            const thisData = this.f.get(thisChunk);
            dst.SetV(thisData.gravitationalAcceleration);
            dst.Multiply(thisBody.GetMass());
            thisBody.ApplyForce(dst, thisBody.GetWorldCenter());

            for (const otherBody of this.chunkManager.enumerateSquare(
                thisBody.GetPosition(),
                2 * this.chunkManager.chunkSide,
            )) {
                if (thisBody === otherBody) { continue; }
                dst.SetV(otherBody.GetWorldCenter());
                dst.Subtract(thisBody.GetWorldCenter());
                const dstLen = dst.Normalize();
                if (dstLen > 0) {
                    dst.Multiply(this.gravitationalConstant
                        * thisBody.GetMass()
                        * otherBody.GetMass()
                        / (dstLen * dstLen));
                    thisBody.ApplyForce(dst, thisBody.GetWorldCenter());
                }
            }
        }
    }

    update(dt: number) {
        this.populateChunks();
        this.applyForces(dt);
    }
}
