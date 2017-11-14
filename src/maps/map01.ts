import { Star } from "../Star";
import { Planetoid } from "../Planetoid";
import { Probe } from "../Probe";
import Rx from "rxjs/Rx";
import Box2D from "box2dweb";
import b2Vec2 = Box2D.Common.Math.b2Vec2;
import b2World = Box2D.Dynamics.b2World;
import b2Body = Box2D.Dynamics.b2Body;
import b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

function getRandomNorm() {
    const a = Math.random() * 2 * Math.PI;
    return new b2Vec2(Math.cos(a), -Math.sin(a));
}

function getRandomPolarVec2(minLength: number, maxLength: number) {
    const vec = getRandomNorm();
    vec.Multiply(minLength + Math.random() * (maxLength - minLength));
    return vec;
}

function getOrbitalSpeed(thisPoisition: b2Vec2, that: b2Body, gravitationalConstant: number) {
    const v = that.GetPosition().Copy();
    v.Subtract(thisPoisition);
    v.CrossFV(1);
    const dstLen = v.Normalize();
    v.Multiply(1 * Math.sqrt(gravitationalConstant * that.GetMass() / dstLen));
    v.Add(that.GetLinearVelocity());
    return v;
}

export default function (env: Star.Environment & Planetoid.Environment & Probe.Environment & {
    physics: {
        gravity: {
            gravitationalConstant: number,
        },
    },
    graphics: {
        camera: BABYLON.ArcRotateCamera;
    },
}) {
    const sol = new Star(env, {
        position: {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
        },
        linearVelocity: {
            x: 50 * (Math.random() - 0.5),
            y: 50 * (Math.random() - 0.5),
        },
        angle: Math.random() * 2 * Math.PI,
        angularVelocity: 20 * (Math.random() - 0.5),
        radius: 8 + Math.random() * 2,
        density: 10,
    });

    const asteroidBeltDist = 50 + Math.random() * 50;

    const closePlanets: Planetoid[] = [];
    const closePlanetsCount = 3 + Math.random() * 2;
    for (let i = 0; i < closePlanetsCount; i++) {
        const position = getRandomPolarVec2(30, asteroidBeltDist - 10);
        position.Add(sol.body.GetPosition());

        const planet = new Planetoid(env, {
            position,
            linearVelocity: getOrbitalSpeed(position, sol.body, env.physics.gravity.gravitationalConstant),
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: 1 + Math.random() * 1,
            density: 1,
        });
        closePlanets.push(planet);

        const moonCount = Math.random() * 3;
        for (let j = 1; j < moonCount; j++) {
            const p = getRandomPolarVec2(3, 15);
            p.Add(planet.body.GetPosition());

            const moon = new Planetoid(env, {
                position: p,
                linearVelocity: getOrbitalSpeed(p, planet.body, env.physics.gravity.gravitationalConstant),
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: .5 + Math.random() * .05,
                density: .1,
            });
        }
    }

    const asteroidCount = 1500 + 100 + Math.random() * 30;
    for (let i = 0; i < asteroidCount; i++) {
        const position = getRandomPolarVec2(asteroidBeltDist * 0.95, asteroidBeltDist * 1.05);
        position.Add(sol.body.GetPosition());

        const asteroid = new Planetoid(env, {
            position: position,
            linearVelocity: getOrbitalSpeed(position, sol.body, env.physics.gravity.gravitationalConstant),
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: .3 + Math.random() * .2,
            density: .5,
        });
    }

    const outPlanets: Planetoid[] = [];
    const outPlanetsCount = 4 + Math.random() * 3;
    for (let i = 0; i < outPlanetsCount; i++) {
        const position = getRandomPolarVec2(asteroidBeltDist + 30, 300);
        position.Add(sol.body.GetPosition());

        const planet = new Planetoid(env, {
            position: position,
            linearVelocity: getOrbitalSpeed(position, sol.body, env.physics.gravity.gravitationalConstant),
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: 2 + Math.random() * 3,
            density: 2,
        });
        outPlanets.push(planet);

        const moonCount = Math.random() * 10;
        for (let j = 1; j < moonCount; j++) {
            const p = getRandomPolarVec2(3, 15);
            p.Add(planet.body.GetPosition());

            const moon = new Planetoid(env, {
                position: p,
                linearVelocity: getOrbitalSpeed(p, planet.body, env.physics.gravity.gravitationalConstant),
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: .5 + Math.random() * .05,
                density: .1,
            });
        }
    }

    const earth = closePlanets[Math.floor(Math.random() * closePlanets.length)];

    const probeCount = 0; // Math.random() * 10 * 2;
    for (let i = 1; i < probeCount; i++) {
        const position = getRandomPolarVec2(1, 20);
        position.Add(earth.body.GetPosition());

        const moon = new Probe(env, {
            position,
            linearVelocity: getOrbitalSpeed(position, earth.body, env.physics.gravity.gravitationalConstant),
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: .2 + Math.random() * .05,
            color: i % 2 ? new BABYLON.Color3(1, 0, 0) : new BABYLON.Color3(0, 1, 0),
            density: .005,
        });
    }

    env.graphics.camera.lockedTarget = earth.mesh;
}
