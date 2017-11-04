System.register("game", [], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    var Container;
    return {
        setters: [],
        execute: function () {
            Container = (function () {
                function Container() {
                    this.objects = [];
                }
                Container.prototype.add = function (object) {
                    this.objects.push(object);
                };
                Container.prototype.remove = function (object) {
                    this.objects.splice(this.objects.indexOf(object), 1);
                };
                Container.prototype.update = function (dt) {
                    for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                        var object = _a[_i];
                        object.update(dt);
                    }
                };
                Container.prototype.render = function () {
                    for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                        var object = _a[_i];
                        object.render();
                    }
                };
                return Container;
            }());
            exports_1("Container", Container);
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
                    this.sprite = new PIXI.Sprite(Body.createSpriteTexture(env.renderer, args.radius));
                    this.sprite.scale.set(.1);
                    this.sprite.anchor.set(.5, .5);
                    env.stage.addChild(this.sprite);
                    this.object = {
                        update: function (dt) { },
                        render: function () { return _this.render(); }
                    };
                    env.gameContainer.add(this.object);
                }
                Body.createSpriteTexture = function (renderer, radius) {
                    var g = new PIXI.Graphics();
                    g.boundsPadding = 1;
                    g.beginFill(0xe6b4b4, .4);
                    g.lineStyle(.1 * 10, 0xe6b4b4);
                    g.drawCircle(0, 0, radius * 10);
                    g.endFill();
                    g.moveTo(0, 0);
                    g.lineTo(radius * 10, 0);
                    return renderer.generateTexture(g, .5, 5);
                };
                ;
                Body.prototype.render = function () {
                    this.sprite.x = this.body.GetPosition().x;
                    this.sprite.y = this.body.GetPosition().y;
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
                    this.sprite = new PIXI.Sprite(Earth.createSpriteTexture(env.renderer, 1));
                    this.sprite.scale.set(.1);
                    this.sprite.anchor.set(.5, .5);
                    env.stage.addChild(this.sprite);
                    this.object = {
                        update: function (dt) { return _this.update(dt); },
                        render: function () { return _this.render(); }
                    };
                    env.gameContainer.add(this.object);
                }
                Earth.createSpriteTexture = function (renderer, radius) {
                    var g = new PIXI.Graphics();
                    g.boundsPadding = 1;
                    g.beginFill(0xe6b4b4, .4);
                    g.lineStyle(.1 * 10, 0xe6b4b4, .8);
                    g.drawCircle(0, 0, radius * 10);
                    g.endFill();
                    g.moveTo(0, 0);
                    g.lineTo(radius * 10, 0);
                    return renderer.generateTexture(g, .5, 5);
                };
                ;
                Earth.prototype.update = function (dt) {
                };
                Earth.prototype.render = function () {
                    this.sprite.x = this.body.GetPosition().x;
                    this.sprite.y = this.body.GetPosition().y;
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
System.register("main", ["box2dweb", "PointerHandler", "FpsTracker", "Gravity", "game", "pixi.js", "Earth", "Body"], function (exports_7, context_7) {
    var __moduleName = context_7 && context_7.id;
    function adjustDisplay() {
        env.canvas.width = env.canvas.clientWidth;
        env.canvas.height = env.canvas.clientHeight;
        env.canvasDebug.width = env.canvasDebug.clientWidth;
        env.canvasDebug.height = env.canvasDebug.clientHeight;
    }
    function update(timestamp) {
        requestAnimationFrame(update);
        // update
        {
            fpsTracker.update(timestamp);
            pointerHandler.update();
            env.world.ClearForces();
            env.gravity.update();
            env.world.Step(1 / 60, 10, 10);
            env.gameContainer.update(1 / 60);
        }
        // render
        {
            env.gameContainer.render();
            var scale = 10;
            env.stage.position.set(env.canvas.width / 2, env.canvas.height / 2);
            env.stage.scale.set(scale, scale);
            env.stage.pivot.set(earth.sprite.position.x, earth.sprite.position.y);
            env.renderer.render(env.stage);
            debugCtx.save();
            debugCtx.clearRect(0, 0, debugCtx.canvas.width, debugCtx.canvas.height);
            debugCtx.translate(debugCtx.canvas.width / 2, debugCtx.canvas.height / 2);
            // debugCtx.rotate(- earth.GetAngle());
            debugCtx.scale(scale, scale);
            debugCtx.translate(-earth.body.GetPosition().x, -earth.body.GetPosition().y);
            env.world.DrawDebugData();
            debugCtx.restore();
            env.fpsLabel.innerText = "FPS " + (fpsTracker.fps && fpsTracker.fps.toFixed(2));
        }
    }
    var box2dweb_5, b2Vec2, b2World, b2DebugDraw, PointerHandler_1, FpsTracker_1, Gravity_1, game, pixi_js_1, Earth_1, Body_1, Enviornment, env, earth, bodies, i, debugCtx, pointerHandler, fpsTracker;
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
            function (game_1) {
                game = game_1;
            },
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            },
            function (Earth_1_1) {
                Earth_1 = Earth_1_1;
            },
            function (Body_1_1) {
                Body_1 = Body_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_5["default"].Common.Math.b2Vec2;
            b2World = box2dweb_5["default"].Dynamics.b2World;
            b2DebugDraw = box2dweb_5["default"].Dynamics.b2DebugDraw;
            Enviornment = (function () {
                function Enviornment() {
                    this.canvas = document.getElementById("canvas");
                    this.canvasDebug = document.getElementById("canvas-debug");
                    this.renderer = pixi_js_1["default"].autoDetectRenderer(this.canvas.clientWidth, this.canvas.clientHeight, {
                        view: this.canvas,
                        antialias: true
                    });
                    this.stage = new pixi_js_1["default"].Container();
                    this.fpsLabel = document.getElementById("fps-label");
                    this.world = new b2World(new b2Vec2(0, 0), true);
                    this.gravity = new Gravity_1.Gravity(this.world);
                    this.gameContainer = new game.Container();
                }
                return Enviornment;
            }());
            env = new Enviornment();
            window.addEventListener("resize", adjustDisplay);
            adjustDisplay();
            earth = new Earth_1.Earth(env);
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
            debugCtx = env.canvasDebug.getContext("2d");
            env.world.SetDebugDraw((function () {
                var debugDraw = new b2DebugDraw();
                debugDraw.SetSprite(debugCtx);
                debugDraw.SetFillAlpha(0.4);
                debugDraw.SetLineThickness(.05);
                debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                //debugDraw.SetDrawScale(1/10);
                return debugDraw;
            })());
            pointerHandler = new PointerHandler_1.PointerHandler(env.world);
            fpsTracker = new FpsTracker_1.FpsTracker();
            ;
            requestAnimationFrame(update);
        }
    };
});
//# sourceMappingURL=app.js.map