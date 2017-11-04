System.register("Camera", [], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    var Camera;
    return {
        setters: [],
        execute: function () {
            Camera = (function () {
                function Camera(env) {
                    this.env = env;
                    this.scale = 1;
                    this.trackRotation = false;
                }
                Camera.prototype.render = function () {
                    if (this.trackRotation && this.target) {
                        this.env.stage.rotation = -this.target.rotation;
                    }
                    this.env.stage.scale.set(this.scale, this.scale);
                    if (this.target) {
                        this.env.stage.pivot.set(this.target.position.x, this.target.position.y);
                    }
                };
                Camera.prototype.renderDebug = function () {
                    if (this.trackRotation && this.target) {
                        this.env.debugCtx.rotate(-this.target.rotation);
                    }
                    this.env.debugCtx.scale(this.scale * this.env.pixelsPerMeter, this.scale * this.env.pixelsPerMeter);
                    if (this.target) {
                        this.env.debugCtx.translate(-this.target.position.x / this.env.pixelsPerMeter, -this.target.position.y / this.env.pixelsPerMeter);
                    }
                };
                return Camera;
            }());
            exports_1("Camera", Camera);
        }
    };
});
System.register("Body", ["pixi.js", "box2dweb"], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    var PIXI, box2dweb_1, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Body;
    return {
        setters: [
            function (PIXI_1) {
                PIXI = PIXI_1;
            },
            function (box2dweb_1_1) {
                box2dweb_1 = box2dweb_1_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_1["default"].Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_1["default"].Dynamics.b2FixtureDef;
            b2Body = box2dweb_1["default"].Dynamics.b2Body;
            b2CircleShape = box2dweb_1["default"].Collision.Shapes.b2CircleShape;
            Body = (function () {
                function Body(env, args) {
                    var _this = this;
                    this.env = env;
                    this.body = env.world.CreateBody((function () {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.Set(args.position.x, args.position.y);
                        bodyDef.linearVelocity.Set(args.linearVelocity.x, args.linearVelocity.y);
                        bodyDef.angularVelocity = args.angularVelocity;
                        bodyDef.angle = args.angle;
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((function () {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = 0.005;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(args.radius);
                        return fixDef;
                    })());
                    this.sprite = new PIXI.Sprite(Body.createSpriteTexture(env.renderer, args.radius * this.env.pixelsPerMeter));
                    this.sprite.anchor.set(.5, .5);
                    this.sprite.interactive = true;
                    this.sprite.hitArea = new PIXI.Circle(0, 0, args.radius * this.env.pixelsPerMeter);
                    this.sprite.on("click", function () { return env.camera.target = _this.sprite; });
                    this.sprite.on("mouseover", function () { return _this.sprite.tint = 0x0000ff; });
                    this.sprite.on("mouseout", function () { return _this.sprite.tint = 0xffffff; });
                    env.stage.addChild(this.sprite);
                    this.updateSubscription = env.updateEvent.subscribe(function (dt) { return _this.update(dt); });
                    this.renderSubscription = env.renderEvent.subscribe(function () { return _this.render(); });
                }
                Body.createSpriteTexture = function (renderer, radius) {
                    var g = new PIXI.Graphics();
                    g.boundsPadding = 1;
                    g.beginFill(0xe6b4b4, .4);
                    g.lineStyle(1, 0xe6b4b4);
                    g.drawCircle(0, 0, radius);
                    g.endFill();
                    g.moveTo(0, 0);
                    g.lineTo(radius, 0);
                    return renderer.generateTexture(g);
                };
                ;
                Body.prototype.update = function (dt) {
                };
                Body.prototype.render = function () {
                    this.sprite.x = this.body.GetPosition().x * this.env.pixelsPerMeter;
                    this.sprite.y = this.body.GetPosition().y * this.env.pixelsPerMeter;
                    this.sprite.rotation = this.body.GetAngle();
                };
                return Body;
            }());
            exports_2("Body", Body);
        }
    };
});
System.register("Earth", ["pixi.js", "box2dweb"], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
    var PIXI, box2dweb_2, b2BodyDef, b2FixtureDef, b2Body, b2CircleShape, Earth;
    return {
        setters: [
            function (PIXI_2) {
                PIXI = PIXI_2;
            },
            function (box2dweb_2_1) {
                box2dweb_2 = box2dweb_2_1;
            }
        ],
        execute: function () {
            b2BodyDef = box2dweb_2["default"].Dynamics.b2BodyDef;
            b2FixtureDef = box2dweb_2["default"].Dynamics.b2FixtureDef;
            b2Body = box2dweb_2["default"].Dynamics.b2Body;
            b2CircleShape = box2dweb_2["default"].Collision.Shapes.b2CircleShape;
            Earth = (function () {
                function Earth(env) {
                    var _this = this;
                    this.env = env;
                    this.body = env.world.CreateBody((function () {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        bodyDef.position.x = 0;
                        bodyDef.position.y = 0;
                        bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
                        // bodyDef.linearVelocity.Set(10 * (Math.random() - 0.5), 10 * (Math.random() - 0.5));
                        return bodyDef;
                    })());
                    this.fixture = this.body.CreateFixture((function () {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = 10.0;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(1);
                        return fixDef;
                    })());
                    this.sprite = new PIXI.Sprite(Earth.createSpriteTexture(env.renderer, 1 * this.env.pixelsPerMeter));
                    this.sprite.anchor.set(.5, .5);
                    this.sprite.interactive = true;
                    this.sprite.hitArea = new PIXI.Circle(0, 0, 1 * this.env.pixelsPerMeter);
                    this.sprite.on("click", function () { return env.camera.target = _this.sprite; });
                    this.sprite.on("mouseover", function () { return _this.sprite.tint = 0x0000ff; });
                    this.sprite.on("mouseout", function () { return _this.sprite.tint = 0xffffff; });
                    env.stage.addChild(this.sprite);
                    this.updateSubscription = env.updateEvent.subscribe(function (dt) { return _this.update(dt); });
                    this.renderSubscription = env.renderEvent.subscribe(function () { return _this.render(); });
                }
                Earth.createSpriteTexture = function (renderer, radius) {
                    var g = new PIXI.Graphics();
                    g.boundsPadding = 1;
                    g.beginFill(0xe6b4b4, .4);
                    g.lineStyle(1, 0xe6b4b4, .8);
                    g.drawCircle(0, 0, radius);
                    g.endFill();
                    g.moveTo(0, 0);
                    g.lineTo(radius, 0);
                    return renderer.generateTexture(g);
                };
                ;
                Earth.prototype.update = function (dt) {
                };
                Earth.prototype.render = function () {
                    this.sprite.x = this.body.GetPosition().x * this.env.pixelsPerMeter;
                    this.sprite.y = this.body.GetPosition().y * this.env.pixelsPerMeter;
                    this.sprite.rotation = this.body.GetAngle();
                };
                return Earth;
            }());
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
            FpsTracker = (function () {
                function FpsTracker(historicalFactor) {
                    if (historicalFactor === void 0) { historicalFactor = 0.95; }
                    this.historicalFactor = historicalFactor;
                }
                FpsTracker.prototype.update = function (timestamp) {
                    if (this.lastTime) {
                        var dt = timestamp - this.lastTime;
                        var momentFps = 1 / dt * 1000;
                        if (this.fps) {
                            this.fps =
                                this.fps * this.historicalFactor
                                    + momentFps * (1 - this.historicalFactor);
                        }
                        else {
                            this.fps = momentFps;
                        }
                    }
                    this.lastTime = timestamp;
                };
                return FpsTracker;
            }());
            exports_4("FpsTracker", FpsTracker);
        }
    };
});
System.register("Gravity", ["box2dweb"], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
    var box2dweb_3, b2Vec2, Gravity;
    return {
        setters: [
            function (box2dweb_3_1) {
                box2dweb_3 = box2dweb_3_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_3["default"].Common.Math.b2Vec2;
            Gravity = (function () {
                function Gravity(world, gravitationalConstant) {
                    if (gravitationalConstant === void 0) { gravitationalConstant = 10; }
                    this.world = world;
                    this.gravitationalConstant = gravitationalConstant;
                }
                Gravity.prototype.update = function () {
                    var dst = new b2Vec2(0, 0);
                    for (var thisBody = this.world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
                        for (var otherBody = this.world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                            if (thisBody === otherBody) {
                                continue;
                            }
                            dst.SetV(otherBody.GetPosition());
                            dst.Subtract(thisBody.GetPosition());
                            var dstLen = dst.Normalize();
                            if (dstLen > 0) {
                                dst.Multiply(this.gravitationalConstant * thisBody.GetMass() * otherBody.GetMass() / (dstLen * dstLen));
                                thisBody.ApplyForce(dst, thisBody.GetPosition());
                            }
                        }
                    }
                };
                return Gravity;
            }());
            exports_5("Gravity", Gravity);
        }
    };
});
System.register("PointerHandler", ["underscore", "box2dweb"], function (exports_6, context_6) {
    var __moduleName = context_6 && context_6.id;
    var underscore_1, box2dweb_4, b2Vec2, b2AABB, b2Body, b2MouseJointDef, PointerHandler;
    return {
        setters: [
            function (underscore_1_1) {
                underscore_1 = underscore_1_1;
            },
            function (box2dweb_4_1) {
                box2dweb_4 = box2dweb_4_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_4["default"].Common.Math.b2Vec2;
            b2AABB = box2dweb_4["default"].Collision.b2AABB;
            b2Body = box2dweb_4["default"].Dynamics.b2Body;
            b2MouseJointDef = box2dweb_4["default"].Dynamics.Joints.b2MouseJointDef;
            PointerHandler = (function () {
                function PointerHandler(world) {
                    this.world = world;
                    underscore_1["default"].bindAll(this, "handlePointerDown", "handlePointerUp", "handlePointerMove");
                    document.addEventListener("pointerdown", this.handlePointerDown, true);
                    document.addEventListener("pointerup", this.handlePointerUp, true);
                }
                PointerHandler.prototype.handlePointerDown = function (e) {
                    this.lastPointer = new b2Vec2(e.offsetX, e.offsetY);
                    document.addEventListener("pointermove", this.handlePointerMove, true);
                };
                PointerHandler.prototype.handlePointerUp = function () {
                    document.removeEventListener("pointermove", this.handlePointerMove, true);
                    this.lastPointer = null;
                };
                PointerHandler.prototype.handlePointerMove = function (e) {
                    this.lastPointer.Set(e.offsetX, e.offsetY);
                    e.preventDefault();
                };
                PointerHandler.prototype.getBodyAtMouse = function () {
                    var _this = this;
                    var selectedBody = null;
                    this.world.QueryAABB(function (fixture) {
                        if (fixture.GetBody().GetType() == b2Body.b2_staticBody) {
                            return true;
                        }
                        if (!fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), _this.lastPointer)) {
                            return true;
                        }
                        selectedBody = fixture.GetBody();
                        return false;
                    }, (function () {
                        var aabb = new b2AABB();
                        aabb.lowerBound.Set(_this.lastPointer.x - 0.001, _this.lastPointer.y - 0.001);
                        aabb.upperBound.Set(_this.lastPointer.x + 0.001, _this.lastPointer.y + 0.001);
                        return aabb;
                    })());
                    return selectedBody;
                };
                PointerHandler.prototype.update = function () {
                    var _this = this;
                    if (this.lastPointer && (!this.joint)) {
                        var body_1 = this.getBodyAtMouse();
                        if (body_1) {
                            this.joint = this.world.CreateJoint((function () {
                                var def = new b2MouseJointDef();
                                def.bodyA = _this.world.GetGroundBody();
                                def.bodyB = body_1;
                                def
                                    .target
                                    = _this.lastPointer;
                                def.collideConnected = true;
                                def.maxForce = 300.0 * body_1.GetMass();
                                return def;
                            })());
                            body_1.SetAwake(true);
                        }
                    }
                    if (this.joint) {
                        if (this.lastPointer) {
                            this.joint.SetTarget(this.lastPointer);
                        }
                        else {
                            this.world.DestroyJoint(this.joint);
                            this.joint = null;
                        }
                    }
                };
                return PointerHandler;
            }());
            exports_6("PointerHandler", PointerHandler);
        }
    };
});
System.register("main", ["box2dweb", "PointerHandler", "FpsTracker", "Gravity", "pixi.js", "Earth", "Body", "rxjs/Rx", "Camera"], function (exports_7, context_7) {
    var __moduleName = context_7 && context_7.id;
    function adjustDisplay() {
        env.canvas.width = env.canvas.clientWidth;
        env.canvas.height = env.canvas.clientHeight;
        env.stage.position.set(env.canvas.width / 2, env.canvas.height / 2);
        if (env.canvasDebug) {
            env.canvasDebug.width = env.canvasDebug.clientWidth;
            env.canvasDebug.height = env.canvasDebug.clientHeight;
            env.debugCtx.setTransform(1, 0, 0, 1, env.canvasDebug.width / 2, env.canvasDebug.height / 2);
        }
    }
    var box2dweb_5, b2Vec2, b2World, b2DebugDraw, PointerHandler_1, FpsTracker_1, Gravity_1, pixi_js_1, Earth_1, Body_1, Rx_1, Camera_1, Enviornment, env, earth, bodies, i, pointerHandler, fpsTracker;
    return {
        setters: [
            function (box2dweb_5_1) {
                box2dweb_5 = box2dweb_5_1;
            },
            function (PointerHandler_1_1) {
                PointerHandler_1 = PointerHandler_1_1;
            },
            function (FpsTracker_1_1) {
                FpsTracker_1 = FpsTracker_1_1;
            },
            function (Gravity_1_1) {
                Gravity_1 = Gravity_1_1;
            },
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (Earth_1_1) {
                Earth_1 = Earth_1_1;
            },
            function (Body_1_1) {
                Body_1 = Body_1_1;
            },
            function (Rx_1_1) {
                Rx_1 = Rx_1_1;
            },
            function (Camera_1_1) {
                Camera_1 = Camera_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_5["default"].Common.Math.b2Vec2;
            b2World = box2dweb_5["default"].Dynamics.b2World;
            b2DebugDraw = box2dweb_5["default"].Dynamics.b2DebugDraw;
            Enviornment = (function () {
                function Enviornment() {
                    this.pixelsPerMeter = 30;
                    this.canvas = document.getElementById("canvas");
                    this.canvasDebug = document.getElementById("canvas-debug");
                    this.debugCtx = this.canvasDebug.getContext("2d");
                    this.renderer = pixi_js_1["default"].autoDetectRenderer(this.canvas.clientWidth, this.canvas.clientHeight, {
                        view: this.canvas,
                        antialias: true
                    });
                    this.stage = new pixi_js_1["default"].Container();
                    this.fpsLabel = document.getElementById("fps-label");
                    this.pauseButton = document.getElementById("pause-button");
                    this.trackRotationButton = document.getElementById("track-rotation-button");
                    this.world = new b2World(new b2Vec2(0, 0), true);
                    this.gravity = new Gravity_1.Gravity(this.world);
                    this.updateEvent = new Rx_1["default"].Subject();
                    this.renderEvent = new Rx_1["default"].Subject();
                    this.camera = new Camera_1.Camera(this);
                    this.isPaused = false;
                }
                return Enviornment;
            }());
            env = new Enviornment();
            env.pauseButton.addEventListener("click", function () { return env.isPaused = !env.isPaused; });
            env.trackRotationButton.addEventListener("click", function () { return env.camera.trackRotation = !env.camera.trackRotation; });
            window.addEventListener("wheel", function (e) {
                env.camera.scale *= Math.pow(1.1, -e.deltaY / 100);
            });
            window.addEventListener("resize", adjustDisplay);
            adjustDisplay();
            earth = new Earth_1.Earth(env);
            env.camera.target = earth.sprite;
            bodies = [];
            for (i = 0; i < 200; ++i) {
                var d = (Math.random() - .5) * 100;
                var a = Math.random() * 2 * Math.PI;
                var position = new b2Vec2(Math.cos(a), -Math.sin(a));
                position.Multiply(d);
                position.Add(earth.body.GetPosition());
                var linearVelocity = earth.body.GetPosition().Copy();
                linearVelocity.SetV(earth.body.GetPosition());
                linearVelocity.Subtract(position);
                linearVelocity.CrossFV(1);
                var dstLen = linearVelocity.Normalize();
                linearVelocity.Multiply(1 * Math.sqrt(env.gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
                // linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
                bodies.push(new Body_1.Body(env, {
                    position: position,
                    linearVelocity: linearVelocity,
                    angle: Math.random() * 2 * Math.PI,
                    angularVelocity: 20 * (Math.random() - 0.5),
                    radius: Math.random() * .5 + .1
                }));
            }
            env.world.SetDebugDraw((function () {
                var debugDraw = new b2DebugDraw();
                debugDraw.SetSprite(env.debugCtx);
                debugDraw.SetFillAlpha(0.4);
                debugDraw.SetLineThickness(.05);
                debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                //debugDraw.SetDrawScale(1/10);
                return debugDraw;
            })());
            pointerHandler = new PointerHandler_1.PointerHandler(env.world);
            fpsTracker = new FpsTracker_1.FpsTracker();
            Rx_1["default"].Observable.interval(0, Rx_1["default"].Scheduler.animationFrame)
                .timestamp()
                .subscribe(function (timestamped) {
                // update
                if (!env.isPaused) {
                    fpsTracker.update(timestamped.timestamp);
                    pointerHandler.update();
                    env.world.ClearForces();
                    env.gravity.update();
                    env.world.Step(1 / 60, 10, 10);
                    env.updateEvent.next(1 / 60);
                }
                // render
                {
                    env.renderEvent.next(timestamped.timestamp);
                    env.camera.render();
                    env.renderer.render(env.stage);
                    if (env.canvasDebug) {
                        env.debugCtx.save();
                        env.debugCtx.setTransform(1, 0, 0, 1, 0, 0);
                        env.debugCtx.clearRect(0, 0, env.debugCtx.canvas.width, env.debugCtx.canvas.height);
                        env.debugCtx.restore();
                        env.debugCtx.save();
                        env.camera.renderDebug();
                        env.world.DrawDebugData();
                        env.debugCtx.restore();
                    }
                    env.fpsLabel.innerText = "FPS " + (fpsTracker.fps && fpsTracker.fps.toFixed(2));
                }
            });
        }
    };
});
//# sourceMappingURL=app.js.map