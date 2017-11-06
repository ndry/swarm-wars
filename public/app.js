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
System.register("Body", ["box2dweb", "babylonjs"], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    var box2dweb_1, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, babylonjs_1, Body;
    return {
        setters: [
            function (box2dweb_1_1) {
                box2dweb_1 = box2dweb_1_1;
            },
            function (babylonjs_1_1) {
                babylonjs_1 = babylonjs_1_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_1.default.Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_1.default.Dynamics.b2FixtureDef;
            b2Body = box2dweb_1.default.Dynamics.b2Body;
            b2CircleShape = box2dweb_1.default.Collision.Shapes.b2CircleShape;
            Body = class Body {
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
                        fixDef.density = 0.005;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(args.radius);
                        return fixDef;
                    })());
                    this.mesh = babylonjs_1.default.MeshBuilder.CreateSphere("", { segments: 16, diameter: args.radius * 2 }, this.env.graphics.scene);
                    const m = new babylonjs_1.default.StandardMaterial("", env.graphics.scene);
                    m.diffuseColor = new babylonjs_1.default.Color3(.5, .5, .5);
                    this.mesh.material = m;
                    // this.sprite.interactive = true;
                    // this.sprite.hitArea = new PIXI.Circle(0, 0, 1 * this.env.pixelsPerMeter);
                    // this.sprite.on("click", () => env.camera.target = this.sprite);
                    // this.sprite.on("mouseover", () => this.sprite.tint = 0xa0a0a0);
                    // this.sprite.on("mouseout", () => this.sprite.tint = 0xffffff);
                    this.updateSubscription = env.updateEvent.subscribe(dt => this.update(dt));
                    this.renderSubscription = env.renderEvent.subscribe(() => this.render());
                }
                update(dt) {
                }
                render() {
                    this.mesh.position.x = this.body.GetPosition().x;
                    this.mesh.position.y = this.body.GetPosition().y;
                    this.mesh.rotation.z = this.body.GetAngle();
                }
            };
            exports_2("Body", Body);
        }
    };
});
System.register("Earth", ["box2dweb", "babylonjs"], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
    var box2dweb_2, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, babylonjs_2, Earth;
    return {
        setters: [
            function (box2dweb_2_1) {
                box2dweb_2 = box2dweb_2_1;
            },
            function (babylonjs_2_1) {
                babylonjs_2 = babylonjs_2_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_2.default.Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_2.default.Dynamics.b2FixtureDef;
            b2Body = box2dweb_2.default.Dynamics.b2Body;
            b2CircleShape = box2dweb_2.default.Collision.Shapes.b2CircleShape;
            Earth = class Earth {
                constructor(env) {
                    this.env = env;
                    const radius = 1;
                    this.body = env.physics.world.CreateBody((() => {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.x = 0;
                        bodyDef.position.y = 0;
                        bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
                        // bodyDef.linearVelocity.Set(10 * (Math.random() - 0.5), 10 * (Math.random() - 0.5));
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((() => {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = 10.0;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(1);
                        return fixDef;
                    })());
                    this.mesh = babylonjs_2.default.MeshBuilder.CreateSphere("", { segments: 16, diameter: radius * 2 }, this.env.graphics.scene);
                    const m = new babylonjs_2.default.StandardMaterial("", env.graphics.scene);
                    m.emissiveColor = new babylonjs_2.default.Color3(1, 1, 1);
                    this.mesh.material = m;
                    this.light = new babylonjs_2.default.PointLight("", new babylonjs_2.default.Vector3(0, 0, 0), this.env.graphics.scene);
                    // this.sprite.interactive = true;
                    // this.sprite.hitArea = new PIXI.Circle(0, 0, 1 * this.env.pixelsPerMeter);
                    // this.sprite.on("click", () => env.camera.target = this.sprite);
                    // this.sprite.on("mouseover", () => this.sprite.tint = 0xa0a0a0);
                    // this.sprite.on("mouseout", () => this.sprite.tint = 0xffffff);
                    this.updateSubscription = env.updateEvent.subscribe(dt => this.update(dt));
                    this.renderSubscription = env.renderEvent.subscribe(() => this.render());
                }
                update(dt) {
                }
                render() {
                    this.mesh.position.x = this.body.GetPosition().x;
                    this.mesh.position.y = this.body.GetPosition().y;
                    this.mesh.rotation.z = this.body.GetAngle();
                    this.light.position.x = this.body.GetPosition().x;
                    this.light.position.y = this.body.GetPosition().y;
                }
            };
            exports_3("Earth", Earth);
        }
    };
});
System.register("FpsTracker", [], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
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
            exports_4("FpsTracker", FpsTracker);
        }
    };
});
System.register("physics/Gravity", ["box2dweb"], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
    var box2dweb_3, b2Vec2, Gravity;
    return {
        setters: [
            function (box2dweb_3_1) {
                box2dweb_3 = box2dweb_3_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_3.default.Common.Math.b2Vec2;
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
            exports_5("Gravity", Gravity);
        }
    };
});
System.register("physics/Physics", ["box2dweb", "physics/Gravity"], function (exports_6, context_6) {
    var __moduleName = context_6 && context_6.id;
    var box2dweb_4, b2Vec2, b2World, Gravity_1, Physics;
    return {
        setters: [
            function (box2dweb_4_1) {
                box2dweb_4 = box2dweb_4_1;
            },
            function (Gravity_1_1) {
                Gravity_1 = Gravity_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_4.default.Common.Math.b2Vec2;
            b2World = box2dweb_4.default.Dynamics.b2World;
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
            exports_6("Physics", Physics);
        }
    };
});
System.register("utils", [], function (exports_7, context_7) {
    var __moduleName = context_7 && context_7.id;
    function isVisible(elt) {
        var style = window.getComputedStyle(elt);
        return +style.width !== 0
            && +style.height !== 0
            && +style.opacity !== 0
            && style.display !== 'none'
            && style.visibility !== 'hidden';
    }
    exports_7("isVisible", isVisible);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("Probe", ["box2dweb", "babylonjs"], function (exports_8, context_8) {
    var __moduleName = context_8 && context_8.id;
    var box2dweb_5, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, babylonjs_3, Probe;
    return {
        setters: [
            function (box2dweb_5_1) {
                box2dweb_5 = box2dweb_5_1;
            },
            function (babylonjs_3_1) {
                babylonjs_3 = babylonjs_3_1;
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
                        fixDef.density = 0.005;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(args.radius);
                        return fixDef;
                    })());
                    this.mesh = babylonjs_3.default.MeshBuilder.CreateSphere("", { segments: 16, diameter: args.radius * 2 }, this.env.graphics.scene);
                    const m = new babylonjs_3.default.StandardMaterial("", env.graphics.scene);
                    m.diffuseColor = args.color;
                    this.mesh.material = m;
                    // this.sprite.interactive = true;
                    // this.sprite.hitArea = new PIXI.Circle(0, 0, 1 * this.env.pixelsPerMeter);
                    // this.sprite.on("click", () => env.camera.target = this.sprite);
                    // this.sprite.on("mouseover", () => this.sprite.tint = 0xa0a0a0);
                    // this.sprite.on("mouseout", () => this.sprite.tint = 0xffffff);
                    this.updateSubscription = env.updateEvent.subscribe(dt => this.update(dt));
                    this.renderSubscription = env.renderEvent.subscribe(() => this.render());
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
                            color: this.args.color
                        });
                    }
                }
                render() {
                    this.mesh.position.x = this.body.GetPosition().x;
                    this.mesh.position.y = this.body.GetPosition().y;
                    this.mesh.rotation.z = this.body.GetAngle();
                }
            };
            exports_8("Probe", Probe);
        }
    };
});
System.register("maps/map01", ["Earth", "Body", "Probe", "box2dweb", "babylonjs"], function (exports_9, context_9) {
    var __moduleName = context_9 && context_9.id;
    function default_1(env) {
        const earth = new Earth_1.Earth(env);
        env.camera.target = earth.mesh;
        const bodies = [];
        for (var i = 0; i < 100; ++i) {
            const d = (Math.random() - .5) * 100;
            const a = Math.random() * 2 * Math.PI;
            const position = new b2Vec2(Math.cos(a), -Math.sin(a));
            position.Multiply(d);
            position.Add(earth.body.GetPosition());
            const linearVelocity = earth.body.GetPosition().Copy();
            linearVelocity.SetV(earth.body.GetPosition());
            linearVelocity.Subtract(position);
            linearVelocity.CrossFV(1);
            const dstLen = linearVelocity.Normalize();
            linearVelocity.Multiply(1 * Math.sqrt(env.physics.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
            // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
            bodies.push(new Body_1.Body(env, {
                position: position,
                linearVelocity: linearVelocity,
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: Math.random() * .5 + .1
            }));
        }
        const probes = [];
        for (var i = 0; i < 100; ++i) {
            const d = (Math.random() - .5) * 100;
            const a = Math.random() * 2 * Math.PI;
            const position = new b2Vec2(Math.cos(a), -Math.sin(a));
            position.Multiply(d);
            position.Add(earth.body.GetPosition());
            const linearVelocity = earth.body.GetPosition().Copy();
            linearVelocity.SetV(earth.body.GetPosition());
            linearVelocity.Subtract(position);
            linearVelocity.CrossFV(1);
            const dstLen = linearVelocity.Normalize();
            linearVelocity.Multiply(1 * Math.sqrt(env.physics.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
            // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
            probes.push(new Probe_1.Probe(env, {
                position: position,
                linearVelocity: linearVelocity,
                angle: Math.random() * 2 * Math.PI,
                angularVelocity: 20 * (Math.random() - 0.5),
                radius: Math.random() * .5 + .1,
                color: (Math.random() < .5) ? new babylonjs_4.default.Color3(1, 0, 0) : new babylonjs_4.default.Color3(0, 1, 0)
            }));
        }
    }
    exports_9("default", default_1);
    var Earth_1, Body_1, Probe_1, box2dweb_6, b2Vec2, babylonjs_4;
    return {
        setters: [
            function (Earth_1_1) {
                Earth_1 = Earth_1_1;
            },
            function (Body_1_1) {
                Body_1 = Body_1_1;
            },
            function (Probe_1_1) {
                Probe_1 = Probe_1_1;
            },
            function (box2dweb_6_1) {
                box2dweb_6 = box2dweb_6_1;
            },
            function (babylonjs_4_1) {
                babylonjs_4 = babylonjs_4_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_6.default.Common.Math.b2Vec2;
        }
    };
});
System.register("main", ["underscore", "rxjs/Rx", "physics/Physics", "box2dweb", "FpsTracker", "babylonjs", "Camera", "utils", "maps/map01"], function (exports_10, context_10) {
    var __moduleName = context_10 && context_10.id;
    var underscore_1, Rx_1, Physics_1, box2dweb_7, b2DebugDraw, FpsTracker_1, babylonjs_5, Camera_1, utils_1, Enviornment, env, map01_1;
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
            function (babylonjs_5_1) {
                babylonjs_5 = babylonjs_5_1;
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
                    this.updateEvent = new Rx_1.default.Subject();
                    this.renderEvent = new Rx_1.default.Subject();
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
                    this.graphics.engine = new babylonjs_5.default.Engine(this.canvas, true);
                    this.pauseButton.addEventListener("click", () => this.isPaused = !this.isPaused);
                    this.trackRotationButton.addEventListener("click", () => this.camera.trackRotation = !this.camera.trackRotation);
                    this.stepButton.addEventListener("click", () => this.update(1 / 60));
                    this.toggleGravityButton.addEventListener("click", () => this.physics.isGravityOn = !this.physics.isGravityOn);
                    window.addEventListener("resize", this.adjustDisplay);
                    this.adjustDisplay();
                    window.addEventListener("wheel", e => {
                        this.camera.scale *= Math.pow(1.1, -e.deltaY / 100);
                    });
                    this.physics.world.SetDebugDraw((() => {
                        const debugDraw = new b2DebugDraw();
                        debugDraw.SetSprite(this.debugCtx);
                        debugDraw.SetFillAlpha(0.4);
                        debugDraw.SetLineThickness(.05);
                        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                        //debugDraw.SetDrawScale(1/10);
                        return debugDraw;
                    })());
                    this.createScene();
                }
                createScene() {
                    this.graphics.scene = new babylonjs_5.default.Scene(this.graphics.engine);
                    this.graphics.camera = new babylonjs_5.default.FreeCamera('camera1', new babylonjs_5.default.Vector3(0, 0, -10), this.graphics.scene);
                    this.graphics.camera.setTarget(babylonjs_5.default.Vector3.Zero());
                    this.graphics.camera.attachControl(this.canvas, false);
                }
                adjustDisplay() {
                    this.canvas.width = this.canvas.clientWidth;
                    this.canvas.height = this.canvas.clientHeight;
                    this.graphics.engine.resize();
                    if (this.canvasDebug) {
                        this.canvasDebug.width = this.canvasDebug.clientWidth;
                        this.canvasDebug.height = this.canvasDebug.clientHeight;
                        this.debugCtx.setTransform(1, 0, 0, 1, this.canvasDebug.width / 2, this.canvasDebug.height / 2);
                    }
                }
                update(dt) {
                    this.physics.update(dt);
                    this.updateEvent.next(dt);
                }
                render(dt) {
                    this.renderEvent.next(dt);
                    this.camera.render();
                    this.graphics.scene.render();
                    if (this.canvasDebug && utils_1.isVisible(this.canvasDebug)) {
                        this.debugCtx.save();
                        this.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
                        this.debugCtx.clearRect(0, 0, this.debugCtx.canvas.width, this.debugCtx.canvas.height);
                        this.debugCtx.restore();
                        this.debugCtx.save();
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
                    //     this.graphics.scene.render();
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