import {vec2} from "gl-matrix";

export class Object {
    force = vec2.create();
    acceleration = vec2.create();
    velocity = vec2.create();
    position = vec2.create();
    radius: number;
    density: number;
    elasticity: number;
    mass: number;
}

export class Container {
    width: number;
    height: number;

    bodies: Object[] = [];

    constructor(width: number, heigth: number) {
        this.width = width;
        this.height = heigth
    }

    update(dt: number) {
        for (const body of this.bodies) {
            body.mass = Math.PI * body.radius * body.radius * body.density;
        }

        let r = vec2.create();
        let rnorm = vec2.create();
        const relativeVelocity = vec2.create();
        const relativeVelocityNorm = vec2.create();
        
        for (const body of this.bodies) {
            body.force.set([0, 0]);
            for (const body2 of this.bodies) {
                if (body2 === body) continue;
                vec2.subtract(r, body2.position, body.position);
                const rlen = vec2.length(r);
                vec2.normalize(rnorm, r);

                const hh = body2.radius - rlen;
                if (hh > 0) { 
                    let a = body2.radius * body2.radius * Math.acos(hh/body2.radius) - hh * Math.sqrt(2 * hh * (body2.radius - hh));
                    a *= 2;
                    let mass = a * body2.density;
                    vec2.scaleAndAdd(body.force, body.force, rnorm,
                        .0005 * body.mass * mass / (rlen * rlen));
                } else {

                    vec2.scaleAndAdd(body.force, body.force, rnorm,
                        .0005 * body.mass * body2.mass / (rlen * rlen));
                }

                // vec2.scaleAndAdd(body.force, body.force, rnorm,
                //      - .007 * body.mass * body2.mass / (rlen * rlen * rlen));

                const rInterfere = Math.max(0, body.radius + body2.radius - rlen);
                // vec2.scaleAndAdd(body.force, body.force, rnorm,
                //     - .01 * body.elasticity * rInterfere);
                // vec2.scaleAndAdd(body.force, body.force, rnorm,
                //     - .01 * body2.elasticity * rInterfere);

                if (rInterfere > 0) {
                    vec2.subtract(relativeVelocity, body2.velocity, body.velocity);
                    vec2.normalize(relativeVelocityNorm, relativeVelocity);
                    const relativeVelocityLen = vec2.length(relativeVelocity);
                    vec2.scaleAndAdd(body.force, body.force, relativeVelocityNorm,
                        1 * relativeVelocityLen * relativeVelocityLen * body2.elasticity);
                }
            }
            vec2.scale(body.force, body.force, 1)
        }    
        
        for (const body of this.bodies) {
            this.updateBodyPosition(body, dt);
        }

        for (const body of this.bodies) {
            this.ensureBorders(body);
        }
    }

    updateBodyPosition(body: Object, dt: number) {
        vec2.scale(body.acceleration, body.force, 1 / body.mass);
        vec2.scaleAndAdd(body.velocity, body.velocity, body.acceleration, dt);
        vec2.scaleAndAdd(body.position, body.position, body.velocity, dt);
    }

    ensureBorders(body: Object) {
        if (body.position[0] - body.radius < 0) {
            body.position[0] = body.radius - body.position[0] + body.radius;
            body.velocity[0] = -body.velocity[0];
        }
        if (body.position[1] - body.radius < 0) {
            body.position[1] = body.radius - body.position[1] + body.radius;
            body.velocity[1] = -body.velocity[1];
        }
        if (body.position[0] + body.radius >= this.width) {
            body.position[0] = this.width - body.radius - body.position[0] + this.width - body.radius;
            body.velocity[0] = -body.velocity[0];
        }
        if (body.position[1] + body.radius >= this.height) {
            body.position[1] = this.height - body.radius - body.position[1] + this.height - body.radius;
            body.velocity[1] = -body.velocity[1];
        }
    }

}