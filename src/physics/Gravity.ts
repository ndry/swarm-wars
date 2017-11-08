import Box2D from "box2dweb";

import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;
import { adjust } from "../utils";

export class Gravity {
    gravitationalConstant: number;

    constructor(
        private world: b2World,
        gravitationalConstant: number = 10
    ) {
        this.gravitationalConstant = gravitationalConstant;
    }

    chunkSide = 10;
    chunks: Map<string, {
        x: number,
        y: number,
        cx: number,
        cy: number,
        bodies: b2Body[],
        centerOfMass: b2Vec2,
        mass: number,
        gravitationalAcceleration: b2Vec2
    }>;
    c(x: number) {
        return Math.round(x / this.chunkSide) * this.chunkSide;
    }

    ccid(cx: number, cy: number) {
        return `chunkSide = ${this.chunkSide}`
        + `; x = ${cx}` 
        + `; y = ${cy}`;
    }
    cid(x: number, y: number) {
        return `chunkSide = ${this.chunkSide}`
        + `; x = ${this.c(x)}` 
        + `; y = ${this.c(y)}`;
    }

    populateChunks() {
        this.chunks = new Map<string, {
            x: number,
            y: number,
            cx: number,
            cy: number,
            bodies: b2Body[],
            centerOfMass: b2Vec2,
            mass: number,
            gravitationalAcceleration: b2Vec2
        }>();

        for (let thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const chunkId = this.cid(thisBody.GetPosition().x, thisBody.GetPosition().y);
            
            const chunk = this.chunks.has(chunkId) ? this.chunks.get(chunkId) : adjust({
                x: thisBody.GetPosition().x,
                y: thisBody.GetPosition().y,
                cx: this.c(thisBody.GetPosition().x),
                cy: this.c(thisBody.GetPosition().y),
                bodies: [],
                centerOfMass: new b2Vec2(),
                mass: 0,
                gravitationalAcceleration: new b2Vec2()
            }, c => this.chunks.set(chunkId, c));
            
            chunk.bodies.push(thisBody);
        }

        for (let chunk of this.chunks.values()) {
            for (let body of chunk.bodies) {
                const tmp = new b2Vec2();
                tmp.SetV(body.GetWorldCenter());
                tmp.Multiply(body.GetMass());
                chunk.centerOfMass.Add(tmp);
                chunk.mass += body.GetMass();
            }
            chunk.centerOfMass.Multiply(1 / chunk.mass);
        }

        for (let thisChunk of this.chunks.values()) {
            for (let otherChunk of this.chunks.values()) {
                if (Math.abs(thisChunk.cx - otherChunk.cx) <= 2 * this.chunkSide && Math.abs(thisChunk.cy - otherChunk.cy) <= 2 * this.chunkSide) {
                    continue;
                }

                const g = new b2Vec2();
                g.SetV(otherChunk.centerOfMass);
                g.Subtract(thisChunk.centerOfMass);
                const dstLen = g.Normalize();
                if (dstLen > 0) {
                    g.Multiply(this.gravitationalConstant * otherChunk.mass / (dstLen * dstLen));
                    thisChunk.gravitationalAcceleration.Add(g);
                }
            }
        }
    }

    applyForces(dt: number) {
        const _this = this;
        const f = function* (x: number, y: number, r: number) {
            for (let cx = _this.c(x-r); cx <= _this.c(x+r); cx += _this.chunkSide) {
                for (let cy = _this.c(y-r); cy <= _this.c(y+r); cy += _this.chunkSide) {
                    const c = _this.chunks.get(_this.cid(cx, cy));
                    if (!c) { continue; }
                    for (let body of c.bodies) {
                        const dx = body.GetPosition().x - x;
                        const dy = body.GetPosition().y - y;
                        if (dx*dx + dy*dy > r*r) { continue; }
                        yield body;
                    }
                }   
            }
        }

        const cf = function* (ccx: number, ccy: number, cr: number) {
            for (let cx = ccx-cr; cx <= ccx+cr; cx += 1) {
                for (let cy = ccy-cr; cy <= ccy+cr; cy += 1) {
                    const c = _this.chunks.get(_this.cid(cx * _this.chunkSide, cy * _this.chunkSide));
                    if (!c) { continue; }
                    yield* c.bodies;
                }   
            }
        }

        const dst = new b2Vec2(0, 0);
        for (let thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            const thisChunk = this.chunks.get(this.cid(thisBody.GetPosition().x, thisBody.GetPosition().y));
            dst.SetV(thisChunk.gravitationalAcceleration);
            dst.Multiply(thisBody.GetMass());
            thisBody.ApplyForce(dst, thisBody.GetWorldCenter());

            for (let otherBody of cf(this.c(thisBody.GetPosition().x), this.c(thisBody.GetPosition().y), 2)) {
                if (thisBody === otherBody) { continue; }
                dst.SetV(otherBody.GetWorldCenter());
                dst.Subtract(thisBody.GetWorldCenter());
                const dstLen = dst.Normalize();
                if (dstLen > 0) {
                    dst.Multiply(this.gravitationalConstant * thisBody.GetMass() * otherBody.GetMass() / (dstLen * dstLen));
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
