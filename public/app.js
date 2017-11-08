System.register("utils", [], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    function isVisible(elt) {
        var style = window.getComputedStyle(elt);
        return +style.width !== 0
            && +style.height !== 0
            && +style.opacity !== 0
            && style.display !== 'none'
            && style.visibility !== 'hidden';
    }
    exports_1("isVisible", isVisible);
    function adjust(x, ...applyAdjustmentList) {
        for (let applyAdjustment of applyAdjustmentList) {
            applyAdjustment(x);
        }
        return x;
    }
    exports_1("adjust", adjust);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("physics/Gravity", ["box2dweb", "utils"], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    var box2dweb_1, b2Vec2, utils_1, Gravity;
    return {
        setters: [
            function (box2dweb_1_1) {
                box2dweb_1 = box2dweb_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_1.default.Common.Math.b2Vec2;
            Gravity = class Gravity {
                constructor(world, gravitationalConstant = 10) {
                    this.world = world;
                    this.chunkSide = 10;
                    this.gravitationalConstant = gravitationalConstant;
                }
                c(x) {
                    return Math.round(x / this.chunkSide) * this.chunkSide;
                }
                ccid(cx, cy) {
                    return `chunkSide = ${this.chunkSide}`
                        + `; x = ${cx}`
                        + `; y = ${cy}`;
                }
                cid(x, y) {
                    return `chunkSide = ${this.chunkSide}`
                        + `; x = ${this.c(x)}`
                        + `; y = ${this.c(y)}`;
                }
                populateChunks() {
                    this.chunks = new Map();
                    for (let thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        const chunkId = this.cid(thisBody.GetPosition().x, thisBody.GetPosition().y);
                        const chunk = this.chunks.has(chunkId) ? this.chunks.get(chunkId) : utils_1.adjust({
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
                applyForces(dt) {
                    const _this = this;
                    const f = function* (x, y, r) {
                        for (let cx = _this.c(x - r); cx <= _this.c(x + r); cx += _this.chunkSide) {
                            for (let cy = _this.c(y - r); cy <= _this.c(y + r); cy += _this.chunkSide) {
                                const c = _this.chunks.get(_this.cid(cx, cy));
                                if (!c) {
                                    continue;
                                }
                                for (let body of c.bodies) {
                                    const dx = body.GetPosition().x - x;
                                    const dy = body.GetPosition().y - y;
                                    if (dx * dx + dy * dy > r * r) {
                                        continue;
                                    }
                                    yield body;
                                }
                            }
                        }
                    };
                    const cf = function* (ccx, ccy, cr) {
                        for (let cx = ccx - cr; cx <= ccx + cr; cx += 1) {
                            for (let cy = ccy - cr; cy <= ccy + cr; cy += 1) {
                                const c = _this.chunks.get(_this.cid(cx * _this.chunkSide, cy * _this.chunkSide));
                                if (!c) {
                                    continue;
                                }
                                yield* c.bodies;
                            }
                        }
                    };
                    const dst = new b2Vec2(0, 0);
                    for (let thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        const thisChunk = this.chunks.get(this.cid(thisBody.GetPosition().x, thisBody.GetPosition().y));
                        dst.SetV(thisChunk.gravitationalAcceleration);
                        dst.Multiply(thisBody.GetMass());
                        thisBody.ApplyForce(dst, thisBody.GetWorldCenter());
                        for (let otherBody of cf(this.c(thisBody.GetPosition().x), this.c(thisBody.GetPosition().y), 2)) {
                            if (thisBody === otherBody) {
                                continue;
                            }
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
                update(dt) {
                    this.populateChunks();
                    this.applyForces(dt);
                }
            };
            exports_2("Gravity", Gravity);
        }
    };
});
System.register("physics/Military", ["box2dweb"], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
    var box2dweb_2, b2Vec2, Military;
    return {
        setters: [
            function (box2dweb_2_1) {
                box2dweb_2 = box2dweb_2_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_2.default.Common.Math.b2Vec2;
            Military = class Military {
                constructor(world) {
                    this.world = world;
                }
                update(dt) {
                    this.population = {};
                    return;
                    const dst = new b2Vec2(0, 0);
                    for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        const thisState = thisBody.GetUserData();
                        if (!(thisState && Military.isUnit(thisState))) {
                            continue;
                        }
                        this.population[thisState.faction] = (this.population[thisState.faction] || 0) + 1;
                        for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                            if (thisBody === otherBody) {
                                continue;
                            }
                            const otherState = otherBody.GetUserData();
                            if (!(otherState && Military.isUnit(otherState))) {
                                continue;
                            }
                            if (thisState.faction === otherState.faction) {
                                continue;
                            }
                            dst.SetV(otherBody.GetPosition());
                            dst.Subtract(thisBody.GetPosition());
                            const dstLen = dst.Normalize();
                            this.attack(thisState, otherState, dstLen, dt);
                        }
                    }
                }
                attack(subject, object, distance, dt) {
                    if (distance > subject.range) {
                        return;
                    }
                    if (!subject.isEnergyAvailable) {
                        return;
                    }
                    const damage = Math.max(1, subject.attack - object.defense) / distance;
                    object.hitPoints -= damage * dt;
                    subject.energyDelta -= subject.attack;
                }
            };
            exports_3("Military", Military);
            (function (Military) {
                function isUnit(x) {
                    return !!x._isMilitaryUnit_32f06fe34e8b40479c503df3a4d09997;
                }
                Military.isUnit = isUnit;
            })(Military || (Military = {}));
            exports_3("Military", Military);
        }
    };
});
System.register("physics/Physics", ["box2dweb", "physics/Gravity", "physics/Military"], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
    var box2dweb_3, b2Vec2, b2World, Gravity_1, Military_1, Physics;
    return {
        setters: [
            function (box2dweb_3_1) {
                box2dweb_3 = box2dweb_3_1;
            },
            function (Gravity_1_1) {
                Gravity_1 = Gravity_1_1;
            },
            function (Military_1_1) {
                Military_1 = Military_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_3.default.Common.Math.b2Vec2;
            b2World = box2dweb_3.default.Dynamics.b2World;
            Physics = class Physics {
                constructor() {
                    this.isGravityOn = true;
                    this.world = new b2World(new b2Vec2(0, 0), true);
                    this.gravity = new Gravity_1.Gravity(this.world);
                    this.military = new Military_1.Military(this.world);
                }
                update(dt) {
                    this.world.ClearForces();
                    if (this.isGravityOn) {
                        this.gravity.update(dt);
                    }
                    this.world.Step(dt, 10, 10);
                    this.military.update(dt);
                }
            };
            exports_4("Physics", Physics);
        }
    };
});
System.register("FpsTracker", [], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
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
            exports_5("FpsTracker", FpsTracker);
        }
    };
});
System.register("graphics/GuiView", ["utils"], function (exports_6, context_6) {
    var __moduleName = context_6 && context_6.id;
    function create(constructor, parent, ...applyStyles) {
        return utils_2.adjust(new constructor(), ...applyStyles, el => parent.addControl(el));
    }
    var utils_2, GuiView;
    return {
        setters: [
            function (utils_2_1) {
                utils_2 = utils_2_1;
            }
        ],
        execute: function () {
            GuiView = class GuiView {
                constructor(env) {
                    this.env = env;
                    this.root = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("", true, this.env);
                    this.panel = create(BABYLON.GUI.StackPanel, this.root, el => {
                        el.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                        el.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                        el.width = "200px";
                    });
                    this.fpsLabel = create(BABYLON.GUI.TextBlock, this.panel, GuiView.defaultTextBlockStyle);
                    this.bodyCountLabel = create(BABYLON.GUI.TextBlock, this.panel, GuiView.defaultTextBlockStyle);
                    this.populationLabel = create(BABYLON.GUI.TextBlock, this.panel, GuiView.defaultTextBlockStyle, t => {
                        t.height = "100px";
                        t.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                    });
                    this.pauseButton = create(BABYLON.GUI.Button, this.panel, GuiView.defaultButtonStyle, el => {
                        create(BABYLON.GUI.TextBlock, el, el => {
                            el.text = "Pause";
                        });
                    });
                    this.stepButton = create(BABYLON.GUI.Button, this.panel, GuiView.defaultButtonStyle, el => {
                        create(BABYLON.GUI.TextBlock, el, el => {
                            el.text = "Step";
                        });
                    });
                    this.toggleGravityButton = create(BABYLON.GUI.Button, this.panel, GuiView.defaultButtonStyle, el => {
                        create(BABYLON.GUI.TextBlock, el, el => {
                            el.text = "Toggle Gravity";
                        });
                    });
                    this.toggleWorldGuiButton = create(BABYLON.GUI.Button, this.panel, GuiView.defaultButtonStyle, el => {
                        create(BABYLON.GUI.TextBlock, el, el => {
                            el.text = "Toggle World GUI";
                        });
                    });
                }
                static defaultButtonStyle(el) {
                    el.width = "100%";
                    el.height = "20px";
                    el.color = "white";
                    el.cornerRadius = 20;
                    el.background = "green";
                }
                static defaultTextBlockStyle(el) {
                    el.width = "100%";
                    el.height = "20px";
                    el.color = "white";
                }
            };
            exports_6("GuiView", GuiView);
        }
    };
});
System.register("graphics/GraphicsEnvironment", ["graphics/GuiView", "utils"], function (exports_7, context_7) {
    var __moduleName = context_7 && context_7.id;
    var GuiView_1, utils_3, GraphicsEnvionment;
    return {
        setters: [
            function (GuiView_1_1) {
                GuiView_1 = GuiView_1_1;
            },
            function (utils_3_1) {
                utils_3 = utils_3_1;
            }
        ],
        execute: function () {
            GraphicsEnvionment = class GraphicsEnvionment {
                constructor(env) {
                    this.env = env;
                    this.engine = new BABYLON.Engine(this.env.canvas, true);
                    this.scene = utils_3.adjust(new BABYLON.Scene(this.engine), scene => {
                        scene.clearColor = new BABYLON.Color4(0.1, 0, 0.1, 1);
                    });
                    this.camera = (() => {
                        const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, 0, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
                        camera.lowerRadiusLimit = 2;
                        camera.upperRadiusLimit = 50000;
                        camera.attachControl(this.env.canvas, false);
                        return camera;
                    })();
                    this.guiView = new GuiView_1.GuiView(this.scene);
                    this.isWorldGuiOn = true;
                    this.worldGuiRoot = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("", true, this.scene);
                }
            };
            exports_7("GraphicsEnvionment", GraphicsEnvionment);
        }
    };
});
System.register("Environment", ["underscore", "rxjs/Rx", "physics/Physics", "utils", "FpsTracker", "graphics/GraphicsEnvironment"], function (exports_8, context_8) {
    var __moduleName = context_8 && context_8.id;
    var underscore_1, Rx_1, Physics_1, utils_4, FpsTracker_1, GraphicsEnvironment_1, Enviornment;
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
            function (utils_4_1) {
                utils_4 = utils_4_1;
            },
            function (FpsTracker_1_1) {
                FpsTracker_1 = FpsTracker_1_1;
            },
            function (GraphicsEnvironment_1_1) {
                GraphicsEnvironment_1 = GraphicsEnvironment_1_1;
            }
        ],
        execute: function () {
            Enviornment = class Enviornment {
                constructor() {
                    this.physics = new Physics_1.Physics();
                    this.pixelsPerMeter = 30;
                    this.targetUps = 60;
                    this.upsTracker = new FpsTracker_1.FpsTracker();
                    this.fpsTracker = new FpsTracker_1.FpsTracker();
                    this.canvas = utils_4.adjust(document.getElementById("canvas"), canvas => {
                        canvas.addEventListener("contextmenu", ev => ev.preventDefault());
                    });
                    this.graphics = new GraphicsEnvironment_1.GraphicsEnvionment(this);
                    this.updateObservable = new Rx_1.default.Subject();
                    this.renderObservable = new Rx_1.default.Subject();
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
                    // this.graphics.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                    // const ratio = this.graphics.engine.getRenderWidth() / this.graphics.engine.getRenderHeight();
                    // const halfWidth = 20;
                    // this.graphics.camera.orthoLeft = -halfWidth;
                    // this.graphics.camera.orthoRight = halfWidth;
                    // this.graphics.camera.orthoTop = -halfWidth / ratio;
                    // this.graphics.camera.orthoBottom = halfWidth / ratio;
                    this.graphics.guiView.pauseButton.onPointerUpObservable.add(() => {
                        this.isPaused = !this.isPaused;
                    });
                    this.graphics.guiView.stepButton.onPointerUpObservable.add(() => {
                        this.update(1 / 60);
                    });
                    this.graphics.guiView.toggleGravityButton.onPointerUpObservable.add(() => {
                        this.physics.isGravityOn = !this.physics.isGravityOn;
                    });
                    this.graphics.guiView.toggleWorldGuiButton.onPointerUpObservable.add(() => {
                        this.graphics.isWorldGuiOn = !this.graphics.isWorldGuiOn;
                    });
                    window.addEventListener("resize", this.adjustDisplay);
                    this.adjustDisplay();
                }
                adjustDisplay() {
                    this.canvas.width = this.canvas.clientWidth;
                    this.canvas.height = this.canvas.clientHeight;
                    this.graphics.engine.resize();
                }
                update(dt) {
                    this.physics.update(dt);
                    this.updateObservable.next(dt);
                }
                render(dt) {
                    this.renderObservable.next(dt);
                    this.graphics.scene.render();
                    this.graphics.guiView.bodyCountLabel.text = `Bodies: ${this.physics.world.GetBodyCount()}`;
                    this.graphics.guiView.fpsLabel.text = `FPS ${this.fpsTracker.fps && this.fpsTracker.fps.toFixed(2)}`
                        + ` / UPS ${this.upsTracker.fps && this.upsTracker.fps.toFixed(2)}`;
                    this.graphics.guiView.populationLabel.text = JSON.stringify(this.physics.military.population, null, 4);
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
            exports_8("Enviornment", Enviornment);
        }
    };
});
System.register("Star", ["box2dweb"], function (exports_9, context_9) {
    var __moduleName = context_9 && context_9.id;
    var box2dweb_4, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Star;
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
            exports_9("Star", Star);
        }
    };
});
System.register("Planetoid", ["box2dweb"], function (exports_10, context_10) {
    var __moduleName = context_10 && context_10.id;
    var box2dweb_5, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Planetoid;
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
            exports_10("Planetoid", Planetoid);
        }
    };
});
System.register("Probe", ["box2dweb", "utils"], function (exports_11, context_11) {
    var __moduleName = context_11 && context_11.id;
    var box2dweb_6, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, utils_5, Probe;
    return {
        setters: [
            function (box2dweb_6_1) {
                box2dweb_6 = box2dweb_6_1;
            },
            function (utils_5_1) {
                utils_5 = utils_5_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_6.default.Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_6.default.Dynamics.b2FixtureDef;
            b2Body = box2dweb_6.default.Dynamics.b2Body;
            b2CircleShape = box2dweb_6.default.Collision.Shapes.b2CircleShape;
            Probe = class Probe {
                constructor(env, args) {
                    this.env = env;
                    this.args = args;
                    this.state = {
                        _isMilitaryUnit_32f06fe34e8b40479c503df3a4d09997: true,
                        energyDelta: 0,
                        isEnergyAvailable: false,
                        hitPoints: 100,
                        attack: 10,
                        defense: 10,
                        faction: this.args.color.toHexString(),
                        range: this.args.radius * 5
                    };
                    this.body = this.env.physics.world.CreateBody((() => {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.Set(this.args.position.x, this.args.position.y);
                        bodyDef.linearVelocity.Set(this.args.linearVelocity.x, this.args.linearVelocity.y);
                        bodyDef.angularVelocity = this.args.angularVelocity;
                        bodyDef.angle = this.args.angle;
                        bodyDef.userData = this.state;
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((() => {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = this.args.density;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(this.args.radius);
                        return fixDef;
                    })());
                    this.mesh = utils_5.adjust(BABYLON.MeshBuilder.CreateSphere("", {
                        segments: 4,
                        diameter: this.args.radius * 2
                    }, this.env.graphics.scene), mesh => {
                        const m = new BABYLON.StandardMaterial("", this.env.graphics.scene);
                        m.diffuseColor = this.args.color;
                        mesh.material = m;
                        mesh.outlineColor = new BABYLON.Color3(0, 0, 1);
                        mesh.outlineWidth = .05;
                        mesh.actionManager = new BABYLON.ActionManager(this.env.graphics.scene);
                        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, evt => {
                            mesh.renderOutline = true;
                        }));
                        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, evt => {
                            mesh.renderOutline = false;
                        }));
                        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, evt => {
                            this.env.graphics.camera.lockedTarget = mesh;
                        }));
                    });
                    this.labelRoot = utils_5.adjust(new BABYLON.GUI.StackPanel(), panel => {
                        panel.background = "black";
                        panel.alpha = 0.5;
                        panel.width = "150px";
                        panel.height = "200px";
                        panel.linkOffsetY = 150;
                        this.env.graphics.worldGuiRoot.addControl(panel);
                        panel.linkWithMesh(this.mesh);
                    });
                    this.labelTextBlock = utils_5.adjust(new BABYLON.GUI.TextBlock(), textBlock => {
                        textBlock.color = "white";
                        textBlock.fontSize = "15px";
                        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                        this.labelRoot.addControl(textBlock);
                    });
                    this.updateSubscription = this.env.updateObservable.subscribe(dt => this.update(dt));
                    this.renderSubscription = this.env.renderObservable.subscribe(() => this.render());
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
                    this.labelRoot.isVisible = this.env.graphics.isWorldGuiOn;
                    this.labelTextBlock.text = JSON.stringify(this.state, null, 4);
                }
            };
            exports_11("Probe", Probe);
        }
    };
});
System.register("maps/map01", ["Star", "Planetoid", "Probe", "box2dweb"], function (exports_12, context_12) {
    var __moduleName = context_12 && context_12.id;
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
        const asteroidCount = 500 + 100 + Math.random() * 30;
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
        const probeCount = 0;
        Math.random() * 10 * 2;
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
    exports_12("default", default_1);
    var Star_1, Planetoid_1, Probe_1, box2dweb_7, b2Vec2;
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
            function (box2dweb_7_1) {
                box2dweb_7 = box2dweb_7_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_7.default.Common.Math.b2Vec2;
        }
    };
});
System.register("main", ["Environment", "maps/map01"], function (exports_13, context_13) {
    var __moduleName = context_13 && context_13.id;
    var Environment_1, env, map01_1;
    return {
        setters: [
            function (Environment_1_1) {
                Environment_1 = Environment_1_1;
            },
            function (map01_1_1) {
                map01_1 = map01_1_1;
            }
        ],
        execute: function () {
            env = new Environment_1.Enviornment();
            map01_1.default(env);
            env.run();
        }
    };
});
System.register("physics/Energy", ["box2dweb"], function (exports_14, context_14) {
    var __moduleName = context_14 && context_14.id;
    var box2dweb_8, b2Vec2, Energy;
    return {
        setters: [
            function (box2dweb_8_1) {
                box2dweb_8 = box2dweb_8_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_8.default.Common.Math.b2Vec2;
            Energy = class Energy {
                constructor(world) {
                    this.world = world;
                }
                update(dt) {
                    const dst = new b2Vec2(0, 0);
                    for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        const thisState = thisBody.GetUserData();
                        if (!(thisState && Energy.isContainer(thisState))) {
                            continue;
                        }
                        this.act(thisState, dt);
                    }
                }
                act(subject, dt) {
                    subject.energy = Math.min(subject.energy - subject.energyDelta, subject.energyCapacity);
                    subject.energyDelta = 0;
                    subject.isEnergyAvailable = subject.energy > 0;
                }
            };
            exports_14("Energy", Energy);
            (function (Energy) {
                function isContainer(x) {
                    return !!x._isEnergyContainer_6589b4689768470f889fdc0bb502d061;
                }
                Energy.isContainer = isContainer;
            })(Energy || (Energy = {}));
            exports_14("Energy", Energy);
        }
    };
});
//todo 
System.register("physics/SolarPower", ["box2dweb"], function (exports_15, context_15) {
    var __moduleName = context_15 && context_15.id;
    var box2dweb_9, b2Vec2, SolarPower;
    return {
        setters: [
            function (box2dweb_9_1) {
                box2dweb_9 = box2dweb_9_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_9.default.Common.Math.b2Vec2;
            SolarPower = class SolarPower {
                constructor(world) {
                    this.world = world;
                }
                update(dt) {
                    const dst = new b2Vec2(0, 0);
                    for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        const thisState = thisBody.GetUserData();
                        if (!(thisState && SolarPower.isEmitter(thisState))) {
                            continue;
                        }
                        for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                            if (thisBody === otherBody) {
                                continue;
                            }
                            const otherState = otherBody.GetUserData();
                            if (!(otherState && SolarPower.isConsumer(otherState))) {
                                continue;
                            }
                            dst.SetV(otherBody.GetPosition());
                            dst.Subtract(thisBody.GetPosition());
                            const dstLen = dst.Normalize();
                            this.consume(thisState, otherState, dstLen, dt);
                        }
                    }
                }
                consume(subject, object, distance, dt) {
                    object.energyDelta += object.solarPanelEffectiveness * subject.power / (distance * 2 * Math.PI);
                }
            };
            exports_15("SolarPower", SolarPower);
            (function (SolarPower) {
                function isEmitter(x) {
                    return !!x._isSolarPowerEmitter_e21c9b9535744f61a1f899bbcdfdc30d;
                }
                SolarPower.isEmitter = isEmitter;
                function isConsumer(x) {
                    return !!x._isSolarPowerConsumer_67a1c006936742cfaf30324c6a6c7baa;
                }
                SolarPower.isConsumer = isConsumer;
            })(SolarPower || (SolarPower = {}));
            exports_15("SolarPower", SolarPower);
        }
    };
});
