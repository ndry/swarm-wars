var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
System.register("game", [], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    var Object, Container;
    return {
        setters: [],
        execute: function () {
            Object = (function () {
                function Object(physicsObject, displayObject) {
                }
                Object.prototype.update = function (dt) {
                };
                Object.prototype.render = function () {
                    this.displayObject.x = this.physicsObject.GetPosition().x;
                    this.displayObject.y = this.physicsObject.GetPosition().y;
                };
                return Object;
            }());
            exports_1("Object", Object);
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
System.register("Ball", ["pixi.js", "./physics", "game"], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    var PIXI, physics, game, Ball;
    return {
        setters: [
            function (PIXI_1) {
                PIXI = PIXI_1;
            },
            function (physics_1) {
                physics = physics_1;
            },
            function (game_1) {
                game = game_1;
            }
        ],
        execute: function () {
            Ball = (function (_super) {
                __extends(Ball, _super);
                function Ball(radius) {
                    var _this = _super.call(this) || this;
                    _this.physicsObject = new physics.Object();
                    _this.physicsObject.density = 1;
                    _this.physicsObject.elasticity = 1;
                    _this.physicsObject.radius = radius;
                    _this.displayObject = new PIXI.Sprite(Ball.spriteTexture(radius));
                    _this.displayObject.anchor.set(.5, .5);
                    return _this;
                }
                Ball.spriteTexture = function (radius) {
                    var g = new PIXI.Graphics();
                    //g.beginFill(0x00ff00);
                    g.lineStyle(1, 0x00ffff);
                    g.drawCircle(0, 0, radius);
                    //g.endFill();
                    return g.generateCanvasTexture();
                };
                ;
                Ball.prototype.render = function () {
                    _super.prototype.render.call(this);
                };
                return Ball;
            }(game.Object));
            exports_2("Ball", Ball);
        }
    };
});
System.register("FpsTracker", [], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
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
            exports_3("FpsTracker", FpsTracker);
        }
    };
});
System.register("Gravity", ["box2dweb"], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
    var box2dweb_1, b2Vec2, Gravity;
    return {
        setters: [
            function (box2dweb_1_1) {
                box2dweb_1 = box2dweb_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_1["default"].Common.Math.b2Vec2;
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
            exports_4("Gravity", Gravity);
        }
    };
});
System.register("PointerHandler", ["underscore", "box2dweb"], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
    var underscore_1, box2dweb_2, b2Vec2, b2AABB, b2Body, b2MouseJointDef, PointerHandler;
    return {
        setters: [
            function (underscore_1_1) {
                underscore_1 = underscore_1_1;
            },
            function (box2dweb_2_1) {
                box2dweb_2 = box2dweb_2_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_2["default"].Common.Math.b2Vec2;
            b2AABB = box2dweb_2["default"].Collision.b2AABB;
            b2Body = box2dweb_2["default"].Dynamics.b2Body;
            b2MouseJointDef = box2dweb_2["default"].Dynamics.Joints.b2MouseJointDef;
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
            exports_5("PointerHandler", PointerHandler);
        }
    };
});
System.register("main", ["box2dweb", "PointerHandler", "FpsTracker", "Gravity", "game", "pixi.js"], function (exports_6, context_6) {
    var __moduleName = context_6 && context_6.id;
    function update(timestamp) {
        requestAnimationFrame(update);
        // update
        {
            fpsTracker.update(timestamp);
            pointerHandler.update();
            world.ClearForces();
            gravity.update();
            world.Step(1 / 60, 10, 10);
            world.ClearForces();
        }
        // render
        {
            earth.render();
            for (var _i = 0, bodies_1 = bodies; _i < bodies_1.length; _i++) {
                var body = bodies_1[_i];
                body.render();
            }
            var scale = 10;
            stage.position.set(canvas.width / 2, canvas.height / 2);
            stage.scale.set(scale, scale);
            stage.pivot.set(earth.sprite.position.x, earth.sprite.position.y);
            renderer.render(stage);
            debugCtx.save();
            debugCtx.clearRect(0, 0, debugCtx.canvas.width, debugCtx.canvas.height);
            debugCtx.translate(debugCtx.canvas.width / 2, debugCtx.canvas.height / 2);
            // debugCtx.rotate(- earth.GetAngle());
            debugCtx.scale(scale, scale);
            debugCtx.translate(-earth.body.GetPosition().x, -earth.body.GetPosition().y);
            world.DrawDebugData();
            debugCtx.restore();
            fpsLabel.innerText = "FPS " + (fpsTracker.fps && fpsTracker.fps.toFixed(2));
        }
    }
    var box2dweb_3, b2Vec2, b2BodyDef, b2Body, b2FixtureDef, b2World, b2CircleShape, b2DebugDraw, PointerHandler_1, FpsTracker_1, Gravity_1, game, pixi_js_1, canvas, canvasDebug, renderer, stage, fpsLabel, world, gravity, cnt, Earth, earth, Body, bodies, i, debugCtx, debugDraw, pointerHandler, fpsTracker;
    return {
        setters: [
            function (box2dweb_3_1) {
                box2dweb_3 = box2dweb_3_1;
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
            function (game_2) {
                game = game_2;
            },
            function (pixi_js_1_1) {
                pixi_js_1 = pixi_js_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_3["default"].Common.Math.b2Vec2;
            b2BodyDef = box2dweb_3["default"].Dynamics.b2BodyDef;
            b2Body = box2dweb_3["default"].Dynamics.b2Body;
            b2FixtureDef = box2dweb_3["default"].Dynamics.b2FixtureDef;
            b2World = box2dweb_3["default"].Dynamics.b2World;
            b2CircleShape = box2dweb_3["default"].Collision.Shapes.b2CircleShape;
            b2DebugDraw = box2dweb_3["default"].Dynamics.b2DebugDraw;
            canvas = document.getElementById("canvas");
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            canvasDebug = document.getElementById("canvas-debug");
            canvasDebug.width = canvasDebug.clientWidth;
            canvasDebug.height = canvasDebug.clientHeight;
            renderer = pixi_js_1["default"].autoDetectRenderer(canvas.clientWidth, canvas.clientHeight, {
                view: canvas,
                antialias: true
            });
            stage = new pixi_js_1["default"].Container();
            fpsLabel = document.getElementById("fps-label");
            world = new b2World(new b2Vec2(0, 0), true);
            gravity = new Gravity_1.Gravity(world);
            cnt = new game.Container();
            Earth = (function () {
                function Earth() {
                    this.body = world.CreateBody((function () {
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
                    this.sprite = new pixi_js_1["default"].Sprite(Earth.createSpriteTexture(1));
                    this.sprite.scale.set(.1);
                    this.sprite.anchor.set(.5, .5);
                    stage.addChild(this.sprite);
                }
                Earth.createSpriteTexture = function (radius) {
                    var g = new pixi_js_1["default"].Graphics();
                    g.boundsPadding = 1;
                    g.beginFill(0xe6b4b4, .4);
                    g.lineStyle(.1 * 10, 0xe6b4b4, .8);
                    g.drawCircle(0, 0, radius * 10);
                    g.endFill();
                    g.moveTo(0, 0);
                    g.lineTo(radius * 10, 0);
                    return renderer.generateTexture(g, .5, 100);
                };
                ;
                Earth.prototype.render = function () {
                    this.sprite.x = this.body.GetPosition().x;
                    this.sprite.y = this.body.GetPosition().y;
                    this.sprite.rotation = this.body.GetAngle();
                };
                return Earth;
            }());
            earth = new Earth();
            Body = (function () {
                function Body() {
                    this.body = world.CreateBody((function () {
                        var bodyDef = new b2BodyDef;
                        bodyDef.type = b2Body.b2_dynamicBody;
                        var d = (Math.random() - .5) * 100;
                        var a = Math.random() * 2 * Math.PI;
                        bodyDef.position.Set(Math.cos(a), -Math.sin(a));
                        bodyDef.position.Multiply(d);
                        bodyDef.position.Add(earth.body.GetPosition());
                        bodyDef.angularVelocity = 20 * (Math.random() - 0.5);
                        bodyDef.linearVelocity.SetV(earth.body.GetPosition());
                        bodyDef.linearVelocity.Subtract(bodyDef.position);
                        bodyDef.linearVelocity.CrossFV(1);
                        var dstLen = bodyDef.linearVelocity.Normalize();
                        bodyDef.linearVelocity.Multiply(1 * Math.sqrt(gravity.gravitationalConstant * earth.body.GetMass() / dstLen));
                        // bodyDef.linearVelocity.Set(50 * (Math.random() - 0.5), 50 * (Math.random() - 0.5));
                        return bodyDef;
                    })());
                    var r = Math.random() * .5 + .1;
                    this.fixture = this.body.CreateFixture((function () {
                        var fixDef = new b2FixtureDef;
                        fixDef.density = 0.005;
                        fixDef.friction = 1.0;
                        fixDef.restitution = .1;
                        fixDef.shape = new b2CircleShape(r);
                        return fixDef;
                    })());
                    this.sprite = new pixi_js_1["default"].Sprite(Body.createSpriteTexture(r));
                    this.sprite.scale.set(.1);
                    this.sprite.anchor.set(.5, .5);
                    stage.addChild(this.sprite);
                }
                Body.createSpriteTexture = function (radius) {
                    var g = new pixi_js_1["default"].Graphics();
                    g.boundsPadding = 1;
                    g.beginFill(0xe6b4b4, .4);
                    g.lineStyle(.1 * 10, 0xe6b4b4);
                    g.drawCircle(0, 0, radius * 10);
                    g.endFill();
                    g.moveTo(0, 0);
                    g.lineTo(radius * 10, 0);
                    return renderer.generateTexture(g, .5, 100);
                };
                ;
                Body.prototype.render = function () {
                    this.sprite.x = this.body.GetPosition().x;
                    this.sprite.y = this.body.GetPosition().y;
                    this.sprite.rotation = this.body.GetAngle();
                };
                return Body;
            }());
            bodies = [];
            for (i = 0; i < 200; ++i) {
                bodies.push(new Body());
            }
            debugCtx = canvasDebug.getContext("2d");
            debugDraw = (function () {
                var debugDraw = new b2DebugDraw();
                debugDraw.SetSprite(debugCtx);
                debugDraw.SetFillAlpha(0.4);
                debugDraw.SetLineThickness(.05);
                debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                //debugDraw.SetDrawScale(1/10);
                return debugDraw;
            })();
            world.SetDebugDraw(debugDraw);
            pointerHandler = new PointerHandler_1.PointerHandler(world);
            fpsTracker = new FpsTracker_1.FpsTracker();
            ;
            requestAnimationFrame(update);
        }
    };
});
//# sourceMappingURL=app.js.map