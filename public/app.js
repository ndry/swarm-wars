System.register("Camera", [], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    var Camera;
    return {
        setters: [],
        execute: function () {
            Camera = class Camera {
                constructor(env) {
                    this.env = env;
                    this.scale = 1;
                    this.trackRotation = false;
                }
                render() {
                    // if (this.trackRotation && this.target) {
                    //     this.env.stage.rotation = -this.target.rotation;
                    // }
                    // this.env.stage.scale.set(this.scale, this.scale);
                    // if (this.target) {
                    //     this.env.stage.pivot.set(this.target.position.x, this.target.position.y);
                    // }
                }
                renderDebug() {
                    if (this.trackRotation && this.target) {
                        this.env.debugCtx.rotate(-this.target.rotation);
                    }
                    this.env.debugCtx.scale(this.scale * this.env.pixelsPerMeter, this.scale * this.env.pixelsPerMeter);
                    if (this.target) {
                        this.env.debugCtx.translate(-this.target.position.x / this.env.pixelsPerMeter, -this.target.position.y / this.env.pixelsPerMeter);
                    }
                }
            };
            exports_1("Camera", Camera);
        }
    };
});
System.register("FpsTracker", [], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    var FpsTracker;
    return {
        setters: [],
        execute: function () {
            FpsTracker = class FpsTracker {
                constructor(historicalFactor = 0.95) {
                    this.fps = null;
                    this.historicalFactor = historicalFactor;
                }
                update(dt) {
                    const momentFps = 1 / dt * 1000;
                    if (this.fps !== null && isFinite(this.fps)) {
                        this.fps =
                            this.fps * this.historicalFactor
                                + momentFps * (1 - this.historicalFactor);
                    }
                    else {
                        this.fps = momentFps;
                    }
                }
            };
            exports_2("FpsTracker", FpsTracker);
        }
    };
});
System.register("physics/Gravity", ["box2dweb"], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
    var box2dweb_1, b2Vec2, Gravity;
    return {
        setters: [
            function (box2dweb_1_1) {
                box2dweb_1 = box2dweb_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_1.default.Common.Math.b2Vec2;
            Gravity = class Gravity {
                constructor(world, gravitationalConstant = 10) {
                    this.world = world;
                    this.gravitationalConstant = gravitationalConstant;
                }
                update() {
                    const dst = new b2Vec2(0, 0);
                    for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                            if (thisBody === otherBody) {
                                continue;
                            }
                            dst.SetV(otherBody.GetPosition());
                            dst.Subtract(thisBody.GetPosition());
                            const dstLen = dst.Normalize();
                            if (dstLen > 0) {
                                dst.Multiply(this.gravitationalConstant * thisBody.GetMass() * otherBody.GetMass() / (dstLen * dstLen));
                                thisBody.ApplyForce(dst, thisBody.GetPosition());
                            }
                        }
                    }
                }
            };
            exports_3("Gravity", Gravity);
        }
    };
});
System.register("physics/Physics", ["box2dweb", "physics/Gravity"], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
    var box2dweb_2, b2Vec2, b2World, Gravity_1, Physics;
    return {
        setters: [
            function (box2dweb_2_1) {
                box2dweb_2 = box2dweb_2_1;
            },
            function (Gravity_1_1) {
                Gravity_1 = Gravity_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_2.default.Common.Math.b2Vec2;
            b2World = box2dweb_2.default.Dynamics.b2World;
            Physics = class Physics {
                constructor() {
                    this.isGravityOn = true;
                    this.world = new b2World(new b2Vec2(0, 0), true);
                    this.gravity = new Gravity_1.Gravity(this.world);
                }
                update(dt) {
                    this.world.ClearForces();
                    if (this.isGravityOn) {
                        this.gravity.update();
                    }
                    this.world.Step(dt, 10, 10);
                }
            };
            exports_4("Physics", Physics);
        }
    };
});
System.register("utils", [], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
    function isVisible(elt) {
        var style = window.getComputedStyle(elt);
        return +style.width !== 0
            && +style.height !== 0
            && +style.opacity !== 0
            && style.display !== 'none'
            && style.visibility !== 'hidden';
    }
    exports_5("isVisible", isVisible);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Star", ["box2dweb"], function (exports_6, context_6) {
    var __moduleName = context_6 && context_6.id;
    var box2dweb_3, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Star;
    return {
        setters: [
            function (box2dweb_3_1) {
                box2dweb_3 = box2dweb_3_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_3.default.Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_3.default.Dynamics.b2FixtureDef;
            b2Body = box2dweb_3.default.Dynamics.b2Body;
            b2CircleShape = box2dweb_3.default.Collision.Shapes.b2CircleShape;
            Star = class Star {
                constructor(env, args) {
                    this.env = env;
                    this.body = env.physics.world.CreateBody((() => {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.Set(args.position.x, args.position.y);
                        bodyDef.linearVelocity.Set(args.linearVelocity.x, args.linearVelocity.y);
                        bodyDef.angularVelocity = args.angularVelocity;
                        bodyDef.angle = args.angle;
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((() => {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = args.density;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(args.radius);
                        return fixDef;
                    })());
                    this.mesh = BABYLON.MeshBuilder.CreateSphere("", { segments: 4, diameter: args.radius * 2 }, this.env.graphics.scene);
                    const m = new BABYLON.StandardMaterial("", env.graphics.scene);
                    m.emissiveColor = new BABYLON.Color3(1, 1, 1);
                    this.mesh.material = m;
                    this.light = new BABYLON.PointLight("", new BABYLON.Vector3(0, 0, 0), this.env.graphics.scene);
                    this.mesh.outlineColor = new BABYLON.Color3(0, 0, 1);
                    this.mesh.outlineWidth = .05;
                    this.mesh.actionManager = new BABYLON.ActionManager(this.env.graphics.scene);
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, evt => {
                        this.mesh.renderOutline = true;
                    }));
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, evt => {
                        this.mesh.renderOutline = false;
                    }));
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, evt => {
                        this.env.graphics.camera.lockedTarget = this.mesh;
                    }));
                    this.updateSubscription = env.updateObservable.subscribe(dt => this.update(dt));
                    this.renderSubscription = env.renderObservable.subscribe(() => this.render());
                }
                update(dt) {
                }
                render() {
                    this.mesh.position.x = this.body.GetPosition().x;
                    this.mesh.position.z = this.body.GetPosition().y;
                    this.mesh.rotation.y = this.body.GetAngle();
                    this.light.position.x = this.body.GetPosition().x;
                    this.light.position.z = this.body.GetPosition().y;
                }
            };
            exports_6("Star", Star);
        }
    };
});
System.register("Planetoid", ["box2dweb"], function (exports_7, context_7) {
    var __moduleName = context_7 && context_7.id;
    var box2dweb_4, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Planetoid;
    return {
        setters: [
            function (box2dweb_4_1) {
                box2dweb_4 = box2dweb_4_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_4.default.Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_4.default.Dynamics.b2FixtureDef;
            b2Body = box2dweb_4.default.Dynamics.b2Body;
            b2CircleShape = box2dweb_4.default.Collision.Shapes.b2CircleShape;
            Planetoid = class Planetoid {
                constructor(env, args) {
                    this.env = env;
                    this.body = env.physics.world.CreateBody((() => {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.Set(args.position.x, args.position.y);
                        bodyDef.linearVelocity.Set(args.linearVelocity.x, args.linearVelocity.y);
                        bodyDef.angularVelocity = args.angularVelocity;
                        bodyDef.angle = args.angle;
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((() => {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = args.density;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(args.radius);
                        return fixDef;
                    })());
                    this.mesh = BABYLON.MeshBuilder.CreateSphere("", { segments: 4, diameter: args.radius * 2 }, this.env.graphics.scene);
                    const m = new BABYLON.StandardMaterial("", env.graphics.scene);
                    m.diffuseColor = new BABYLON.Color3(.5, .5, .5);
                    this.mesh.material = m;
                    this.mesh.outlineColor = new BABYLON.Color3(0, 0, 1);
                    this.mesh.outlineWidth = .05;
                    this.mesh.actionManager = new BABYLON.ActionManager(this.env.graphics.scene);
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, evt => {
                        this.mesh.renderOutline = true;
                    }));
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, evt => {
                        this.mesh.renderOutline = false;
                    }));
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, evt => {
                        this.env.graphics.camera.lockedTarget = this.mesh;
                    }));
                    this.updateSubscription = env.updateObservable.subscribe(dt => this.update(dt));
                    this.renderSubscription = env.renderObservable.subscribe(() => this.render());
                }
                update(dt) {
                }
                render() {
                    this.mesh.position.x = this.body.GetPosition().x;
                    this.mesh.position.z = this.body.GetPosition().y;
                    this.mesh.rotation.y = this.body.GetAngle();
                }
            };
            exports_7("Planetoid", Planetoid);
        }
    };
});
System.register("Probe", ["box2dweb"], function (exports_8, context_8) {
    var __moduleName = context_8 && context_8.id;
    var box2dweb_5, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Probe;
    return {
        setters: [
            function (box2dweb_5_1) {
                box2dweb_5 = box2dweb_5_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_5.default.Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_5.default.Dynamics.b2FixtureDef;
            b2Body = box2dweb_5.default.Dynamics.b2Body;
            b2CircleShape = box2dweb_5.default.Collision.Shapes.b2CircleShape;
            Probe = class Probe {
                constructor(env, args) {
                    this.env = env;
                    this.args = args;
                    this.body = env.physics.world.CreateBody((() => {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.Set(args.position.x, args.position.y);
                        bodyDef.linearVelocity.Set(args.linearVelocity.x, args.linearVelocity.y);
                        bodyDef.angularVelocity = args.angularVelocity;
                        bodyDef.angle = args.angle;
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((() => {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = args.density;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(args.radius);
                        return fixDef;
                    })());
                    this.mesh = BABYLON.MeshBuilder.CreateSphere("", { segments: 4, diameter: args.radius * 2 }, this.env.graphics.scene);
                    const m = new BABYLON.StandardMaterial("", env.graphics.scene);
                    m.diffuseColor = args.color;
                    this.mesh.material = m;
                    this.mesh.outlineColor = new BABYLON.Color3(0, 0, 1);
                    this.mesh.outlineWidth = .05;
                    this.mesh.actionManager = new BABYLON.ActionManager(this.env.graphics.scene);
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, evt => {
                        this.mesh.renderOutline = true;
                    }));
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, evt => {
                        this.mesh.renderOutline = false;
                    }));
                    this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, evt => {
                        this.env.graphics.camera.lockedTarget = this.mesh;
                    }));
                    this.updateSubscription = env.updateObservable.subscribe(dt => this.update(dt));
                    this.renderSubscription = env.renderObservable.subscribe(() => this.render());
                }
                update(dt) {
                    if (Math.random() < .001) {
                        new Probe(this.env, {
                            position: {
                                x: this.body.GetPosition().x + this.args.radius * Math.cos(this.body.GetAngle()),
                                y: this.body.GetPosition().y - this.args.radius * Math.sin(this.body.GetAngle())
                            },
                            linearVelocity: {
                                x: this.body.GetLinearVelocity().x,
                                y: this.body.GetLinearVelocity().y
                            },
                            angle: -this.body.GetAngle(),
                            angularVelocity: -this.body.GetAngularVelocity(),
                            radius: this.args.radius,
                            color: this.args.color,
                            density: this.fixture.GetDensity()
                        });
                    }
                }
                render() {
                    this.mesh.position.x = this.body.GetPosition().x;
                    this.mesh.position.z = this.body.GetPosition().y;
                    this.mesh.rotation.y = this.body.GetAngle();
                }
            };
            exports_8("Probe", Probe);
        }
    };
});
System.register("maps/map01", ["Star", "Planetoid", "Probe", "box2dweb"], function (exports_9, context_9) {
    var __moduleName = context_9 && context_9.id;
    function getRandomNorm() {
        const a = Math.random() * 2 * Math.PI;
        return new b2Vec2(Math.cos(a), -Math.sin(a));
    }
    function getRandomPolarVec2(minLength, maxLength) {
        const vec = getRandomNorm();
        vec.Multiply(minLength + Math.random() * (maxLength - minLength));
        return vec;
    }
    function getOrbitalSpeed(thisPoisition, that, gravitationalConstant) {
        const v = that.GetPosition().Copy();
        v.Subtract(thisPoisition);
        v.CrossFV(1);
        const dstLen = v.Normalize();
        v.Multiply(1 * Math.sqrt(gravitationalConstant * that.GetMass() / dstLen));
        v.Add(that.GetLinearVelocity());
        return v;
    }
    function default_1(env) {
        const sol = new Star_1.Star(env, {
            position: {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100
            },
            linearVelocity: {
                x: 50 * (Math.random() - 0.5),
                y: 50 * (Math.random() - 0.5)
            },
            angle: Math.random() * 2 * Math.PI,
            angularVelocity: 20 * (Math.random() - 0.5),
            radius: 8 + Math.random() * 2,
            density: 10
        });
        const asteroidBeltDist = 50 + Math.random() * 50;
        const closePlanets = [];
        const closePlanetsCount = 3 + Math.random() * 2;
        for (let i = 0; i < closePlanetsCount; i++) {
            const position = getRandomPolarVec2(30, asteroidBeltDist - 10);
            position.Add(sol.body.GetPosition());
            const planet = new Planetoid_1.Planetoid(env, {
                position: position,
                linearVelocity: getOrbitalSpeed(position, sol.body, env.physics.gravity.gravitationalConstant),
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: 1 + Math.random() * 1,
                density: 1
            });
            closePlanets.push(planet);
            const moonCount = Math.random() * 3;
            for (let j = 1; j < moonCount; j++) {
                const position = getRandomPolarVec2(3, 15);
                position.Add(planet.body.GetPosition());
                const moon = new Planetoid_1.Planetoid(env, {
                    position: position,
                    linearVelocity: getOrbitalSpeed(position, planet.body, env.physics.gravity.gravitationalConstant),
                    angle: Math.random() * 2 * Math.PI,
                    angularVelocity: 20 * (Math.random() - 0.5),
                    radius: .5 + Math.random() * .05,
                    density: .1
                });
            }
        }
        const asteroidCount = 100 + Math.random() * 30;
        for (let i = 0; i < asteroidCount; i++) {
            const position = getRandomPolarVec2(asteroidBeltDist * 0.95, asteroidBeltDist * 1.05);
            position.Add(sol.body.GetPosition());
            const asteroid = new Planetoid_1.Planetoid(env, {
                position: position,
                linearVelocity: getOrbitalSpeed(position, sol.body, env.physics.gravity.gravitationalConstant),
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: .3 + Math.random() * .2,
                density: .5
            });
        }
        const outPlanets = [];
        const outPlanetsCount = 4 + Math.random() * 3;
        for (let i = 0; i < outPlanetsCount; i++) {
            const position = getRandomPolarVec2(asteroidBeltDist + 30, 300);
            position.Add(sol.body.GetPosition());
            const planet = new Planetoid_1.Planetoid(env, {
                position: position,
                linearVelocity: getOrbitalSpeed(position, sol.body, env.physics.gravity.gravitationalConstant),
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: 2 + Math.random() * 3,
                density: 2
            });
            outPlanets.push(planet);
            const moonCount = Math.random() * 10;
            for (let j = 1; j < moonCount; j++) {
                const position = getRandomPolarVec2(3, 15);
                position.Add(planet.body.GetPosition());
                const moon = new Planetoid_1.Planetoid(env, {
                    position: position,
                    linearVelocity: getOrbitalSpeed(position, planet.body, env.physics.gravity.gravitationalConstant),
                    angle: Math.random() * 2 * Math.PI,
                    angularVelocity: 20 * (Math.random() - 0.5),
                    radius: .5 + Math.random() * .05,
                    density: .1
                });
            }
        }
        const earth = closePlanets[Math.floor(Math.random() * closePlanets.length)];
        const probeCount = Math.random() * 10 * 2;
        for (let i = 1; i < probeCount; i++) {
            const position = getRandomPolarVec2(1, 20);
            position.Add(earth.body.GetPosition());
            const moon = new Probe_1.Probe(env, {
                position: position,
                linearVelocity: getOrbitalSpeed(position, earth.body, env.physics.gravity.gravitationalConstant),
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: .2 + Math.random() * .05,
                color: i % 2 ? new BABYLON.Color3(1, 0, 0) : new BABYLON.Color3(0, 1, 0),
                density: .005
            });
        }
        env.graphics.camera.lockedTarget = earth.mesh;
    }
    exports_9("default", default_1);
    var Star_1, Planetoid_1, Probe_1, box2dweb_6, b2Vec2;
    return {
        setters: [
            function (Star_1_1) {
                Star_1 = Star_1_1;
            },
            function (Planetoid_1_1) {
                Planetoid_1 = Planetoid_1_1;
            },
            function (Probe_1_1) {
                Probe_1 = Probe_1_1;
            },
            function (box2dweb_6_1) {
                box2dweb_6 = box2dweb_6_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_6.default.Common.Math.b2Vec2;
        }
    };
});
System.register("main", ["underscore", "rxjs/Rx", "physics/Physics", "box2dweb", "FpsTracker", "Camera", "utils", "maps/map01"], function (exports_10, context_10) {
    var __moduleName = context_10 && context_10.id;
    var underscore_1, Rx_1, Physics_1, box2dweb_7, b2DebugDraw, FpsTracker_1, Camera_1, utils_1, Enviornment, env, map01_1;
    return {
        setters: [
            function (underscore_1_1) {
                underscore_1 = underscore_1_1;
            },
            function (Rx_1_1) {
                Rx_1 = Rx_1_1;
            },
            function (Physics_1_1) {
                Physics_1 = Physics_1_1;
            },
            function (box2dweb_7_1) {
                box2dweb_7 = box2dweb_7_1;
            },
            function (FpsTracker_1_1) {
                FpsTracker_1 = FpsTracker_1_1;
            },
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (map01_1_1) {
                map01_1 = map01_1_1;
            }
        ],
        execute: function () {
            b2DebugDraw = box2dweb_7.default.Dynamics.b2DebugDraw;
            Enviornment = class Enviornment {
                constructor() {
                    this.physics = new Physics_1.Physics();
                    this.pixelsPerMeter = 30;
                    this.targetUps = 60;
                    this.upsTracker = new FpsTracker_1.FpsTracker();
                    this.fpsTracker = new FpsTracker_1.FpsTracker();
                    this.canvas = document.getElementById("canvas");
                    this.canvasDebug = document.getElementById("canvas-debug");
                    this.debugCtx = this.canvasDebug.getContext("2d");
                    this.fpsLabel = document.getElementById("fps-label");
                    this.bodyCountLabel = document.getElementById("body-count-label");
                    this.pauseButton = document.getElementById("pause-button");
                    this.trackRotationButton = document.getElementById("track-rotation-button");
                    this.stepButton = document.getElementById("step-button");
                    this.toggleGravityButton = document.getElementById("toggle-gravity-button");
                    this.graphics = {
                        engine: null,
                        scene: null,
                        camera: null
                    };
                    this.updateObservable = new Rx_1.default.Subject();
                    this.renderObservable = new Rx_1.default.Subject();
                    this.camera = new Camera_1.Camera(this);
                    this.isPaused = false;
                    this.renderIterationEvent = new Rx_1.default.Subject();
                    this.updateIterationEvent = Rx_1.default.Observable
                        .interval(0, Rx_1.default.Scheduler.asap)
                        .throttleTime(1000 / this.targetUps)
                        .scan((lastAnimationFrameRequest) => {
                        if (lastAnimationFrameRequest !== null) {
                            cancelAnimationFrame(lastAnimationFrameRequest);
                        }
                        return requestAnimationFrame(() => this.renderIterationEvent.next());
                    }, null);
                    underscore_1.default.bindAll(this, "adjustDisplay");
                    this.canvas.addEventListener("contextmenu", ev => ev.preventDefault());
                    this.canvasDebug.addEventListener("contextmenu", ev => ev.preventDefault());
                    this.graphics.engine = new BABYLON.Engine(this.canvas, true);
                    this.graphics.scene = new BABYLON.Scene(this.graphics.engine);
                    const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, 0, 100, new BABYLON.Vector3(0, 0, 0), this.graphics.scene);
                    camera.lowerRadiusLimit = 2;
                    camera.upperRadiusLimit = 50000;
                    this.graphics.camera = camera;
                    this.graphics.camera.attachControl(this.canvas, false);
                    // this.graphics.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                    // const ratio = this.graphics.engine.getRenderWidth() / this.graphics.engine.getRenderHeight();
                    // const halfWidth = 20;
                    // this.graphics.camera.orthoLeft = -halfWidth;
                    // this.graphics.camera.orthoRight = halfWidth;
                    // this.graphics.camera.orthoTop = -halfWidth / ratio;
                    // this.graphics.camera.orthoBottom = halfWidth / ratio;
                    var gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    var button1 = BABYLON.GUI.Button.CreateSimpleButton("", "Pause");
                    button1.width = "150px";
                    button1.height = "40px";
                    button1.color = "white";
                    button1.cornerRadius = 20;
                    button1.background = "green";
                    button1.onPointerUpObservable.add(() => {
                        this.isPaused = !this.isPaused;
                    });
                    gui.addControl(button1);
                    this.pauseButton.addEventListener("click", () => this.isPaused = !this.isPaused);
                    this.trackRotationButton.addEventListener("click", () => this.camera.trackRotation = !this.camera.trackRotation);
                    this.stepButton.addEventListener("click", () => this.update(1 / 60));
                    this.toggleGravityButton.addEventListener("click", () => this.physics.isGravityOn = !this.physics.isGravityOn);
                    window.addEventListener("resize", this.adjustDisplay);
                    this.adjustDisplay();
                    this.physics.world.SetDebugDraw((() => {
                        const debugDraw = new b2DebugDraw();
                        debugDraw.SetSprite(this.debugCtx);
                        debugDraw.SetFillAlpha(0.4);
                        debugDraw.SetLineThickness(.05);
                        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                        //debugDraw.SetDrawScale(1/10);
                        return debugDraw;
                    })());
                }
                adjustDisplay() {
                    this.canvas.width = this.canvas.clientWidth;
                    this.canvas.height = this.canvas.clientHeight;
                    this.graphics.engine.resize();
                    if (this.canvasDebug) {
                        this.canvasDebug.width = this.canvasDebug.clientWidth;
                        this.canvasDebug.height = this.canvasDebug.clientHeight;
                        this.debugCtx.setTransform(1, 0, 0, 1, this.canvasDebug.width / 2, this.canvasDebug.height / 2);
                        this.debugCtx.scale(1, -1);
                    }
                }
                update(dt) {
                    this.physics.update(dt);
                    this.updateObservable.next(dt);
                }
                render(dt) {
                    this.renderObservable.next(dt);
                    this.camera.render();
                    this.graphics.scene.render();
                    if (this.canvasDebug && utils_1.isVisible(this.canvasDebug)) {
                        this.debugCtx.save();
                        this.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
                        this.debugCtx.clearRect(0, 0, this.debugCtx.canvas.width, this.debugCtx.canvas.height);
                        this.debugCtx.restore();
                        this.debugCtx.save();
                        this.debugCtx.rotate(this.graphics.camera.alpha + Math.PI / 2);
                        const scale = 1 / this.graphics.camera.radius * 20;
                        this.debugCtx.scale(scale, scale);
                        if (this.graphics.camera.lockedTarget) {
                            this.debugCtx.translate(-this.graphics.camera.lockedTarget.position.x * 30, -this.graphics.camera.lockedTarget.position.z * 30);
                        }
                        else {
                            this.debugCtx.translate(-this.graphics.camera.target.x * 30, -this.graphics.camera.target.z * 30);
                        }
                        this.camera.renderDebug();
                        this.physics.world.DrawDebugData();
                        this.debugCtx.restore();
                    }
                    this.bodyCountLabel.innerText = `Bodies: ${this.physics.world.GetBodyCount()}`;
                    this.fpsLabel.innerText = `FPS ${this.fpsTracker.fps && this.fpsTracker.fps.toFixed(2)}`
                        + ` / UPS ${this.upsTracker.fps && this.upsTracker.fps.toFixed(2)}`;
                }
                run() {
                    this.renderIterationEvent
                        .timeInterval()
                        .do(v => this.fpsTracker.update(v.interval))
                        .subscribe(v => {
                        this.render(v.interval);
                    });
                    this.updateIterationEvent
                        .timeInterval()
                        .do(v => this.upsTracker.update(v.interval))
                        .subscribe(v => {
                        if (!this.isPaused) {
                            this.update(1 / this.targetUps);
                        }
                    });
                    // this.graphics.engine.runRenderLoop(() => {
                    //     this.renderIterationEvent.next();
                    // });
                }
            };
            env = new Enviornment();
            map01_1.default(env);
            env.run();
        }
    };
});
//# sourceMappingURL=app.js.map