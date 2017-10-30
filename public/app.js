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
System.register("physics", ["gl-matrix"], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    var gl_matrix_1, Object, Container;
    return {
        setters: [
            function (gl_matrix_1_1) {
                gl_matrix_1 = gl_matrix_1_1;
            }
        ],
        execute: function () {
            Object = (function () {
                function Object() {
                    this.force = gl_matrix_1.vec2.create();
                    this.acceleration = gl_matrix_1.vec2.create();
                    this.velocity = gl_matrix_1.vec2.create();
                    this.position = gl_matrix_1.vec2.create();
                }
                return Object;
            }());
            exports_1("Object", Object);
            Container = (function () {
                function Container(width, heigth) {
                    this.bodies = [];
                    this.width = width;
                    this.height = heigth;
                }
                Container.prototype.update = function (dt) {
                    for (var _i = 0, _a = this.bodies; _i < _a.length; _i++) {
                        var body = _a[_i];
                        body.mass = Math.PI * body.radius * body.radius * body.density;
                    }
                    var r = gl_matrix_1.vec2.create();
                    var rnorm = gl_matrix_1.vec2.create();
                    var relativeVelocity = gl_matrix_1.vec2.create();
                    var relativeVelocityNorm = gl_matrix_1.vec2.create();
                    for (var _b = 0, _c = this.bodies; _b < _c.length; _b++) {
                        var body = _c[_b];
                        body.force.set([0, 0]);
                        for (var _d = 0, _e = this.bodies; _d < _e.length; _d++) {
                            var body2 = _e[_d];
                            if (body2 === body)
                                continue;
                            gl_matrix_1.vec2.subtract(r, body2.position, body.position);
                            var rlen = gl_matrix_1.vec2.length(r);
                            gl_matrix_1.vec2.normalize(rnorm, r);
                            var hh = body2.radius - rlen;
                            if (hh > 0) {
                                var a = body2.radius * body2.radius * Math.acos(hh / body2.radius) - hh * Math.sqrt(2 * hh * (body2.radius - hh));
                                a *= 2;
                                var mass = a * body2.density;
                                gl_matrix_1.vec2.scaleAndAdd(body.force, body.force, rnorm, .0005 * body.mass * mass / (rlen * rlen));
                            }
                            else {
                                gl_matrix_1.vec2.scaleAndAdd(body.force, body.force, rnorm, .0005 * body.mass * body2.mass / (rlen * rlen));
                            }
                            // vec2.scaleAndAdd(body.force, body.force, rnorm,
                            //      - .007 * body.mass * body2.mass / (rlen * rlen * rlen));
                            var rInterfere = Math.max(0, body.radius + body2.radius - rlen);
                            // vec2.scaleAndAdd(body.force, body.force, rnorm,
                            //     - .01 * body.elasticity * rInterfere);
                            // vec2.scaleAndAdd(body.force, body.force, rnorm,
                            //     - .01 * body2.elasticity * rInterfere);
                            if (rInterfere > 0) {
                                gl_matrix_1.vec2.subtract(relativeVelocity, body2.velocity, body.velocity);
                                gl_matrix_1.vec2.normalize(relativeVelocityNorm, relativeVelocity);
                                var relativeVelocityLen = gl_matrix_1.vec2.length(relativeVelocity);
                                gl_matrix_1.vec2.scaleAndAdd(body.force, body.force, relativeVelocityNorm, 1 * relativeVelocityLen * relativeVelocityLen * body2.elasticity);
                            }
                        }
                        gl_matrix_1.vec2.scale(body.force, body.force, 1);
                    }
                    for (var _f = 0, _g = this.bodies; _f < _g.length; _f++) {
                        var body = _g[_f];
                        this.updateBodyPosition(body, dt);
                    }
                    for (var _h = 0, _j = this.bodies; _h < _j.length; _h++) {
                        var body = _j[_h];
                        this.ensureBorders(body);
                    }
                };
                Container.prototype.updateBodyPosition = function (body, dt) {
                    gl_matrix_1.vec2.scale(body.acceleration, body.force, 1 / body.mass);
                    gl_matrix_1.vec2.scaleAndAdd(body.velocity, body.velocity, body.acceleration, dt);
                    gl_matrix_1.vec2.scaleAndAdd(body.position, body.position, body.velocity, dt);
                };
                Container.prototype.ensureBorders = function (body) {
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
                };
                return Container;
            }());
            exports_1("Container", Container);
        }
    };
});
System.register("game", [], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    var Object, Container;
    return {
        setters: [],
        execute: function () {
            Object = (function () {
                function Object() {
                }
                Object.prototype.update = function (dt) {
                };
                Object.prototype.render = function () {
                    this.pixiObject.x = this.physicsObject.position[0];
                    this.pixiObject.y = this.physicsObject.position[1];
                };
                return Object;
            }());
            exports_2("Object", Object);
            Container = (function () {
                function Container() {
                    this.objects = [];
                }
                Container.prototype.add = function (object) {
                    this.objects.push(object);
                    this.physicsContainer.bodies.push(object.physicsObject);
                    this.pixiContainer.addChild(object.pixiObject);
                };
                Container.prototype.remove = function (object) {
                    this.objects.splice(this.objects.indexOf(object), 1);
                    this.physicsContainer.bodies.splice(this.physicsContainer.bodies.indexOf(object.physicsObject), 1);
                    this.pixiContainer.removeChild(object.pixiObject);
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
            exports_2("Container", Container);
        }
    };
});
System.register("Ball", ["pixi.js", "physics", "game"], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
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
                    _this.pixiObject = new PIXI.Sprite(Ball.spriteTexture(radius));
                    _this.pixiObject.anchor.set(.5, .5);
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
            exports_3("Ball", Ball);
        }
    };
});
System.register("main", ["box2dweb"], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
    function handleMouseDown(e) {
        isMouseDown = true;
        handleMouseMove(e);
        document.addEventListener("mousemove", handleMouseMove, true);
        document.addEventListener("touchmove", handleMouseMove, true);
    }
    function handleMouseUp() {
        document.removeEventListener("mousemove", handleMouseMove, true);
        document.removeEventListener("touchmove", handleMouseMove, true);
        isMouseDown = false;
        mouseX = undefined;
        mouseY = undefined;
    }
    function handleMouseMove(e) {
        var clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        else if (e && e.changedTouches && e.changedTouches.length > 0) {
            var touch = e.changedTouches[e.changedTouches.length - 1];
            clientX = touch.clientX;
            clientY = touch.clientY;
        }
        else {
            return;
        }
        mouseX = (clientX - canvasPosition.x) / 30;
        mouseY = (clientY - canvasPosition.y) / 30;
        e.preventDefault();
    }
    function getBodyAtMouse() {
        mousePVec = new b2Vec2(mouseX, mouseY);
        var aabb = new b2AABB();
        aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
        aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
        // Query the world for overlapping shapes.
        selectedBody = null;
        world.QueryAABB(getBodyCB, aabb);
        return selectedBody;
    }
    function getBodyCB(fixture) {
        if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
            if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                selectedBody = fixture.GetBody();
                return false;
            }
        }
        return true;
    }
    //update
    function update() {
        if (isMouseDown && (!mouseJoint)) {
            var body = getBodyAtMouse();
            if (body) {
                var md = new b2MouseJointDef();
                md.bodyA = world.GetGroundBody();
                md.bodyB = body;
                // @ts-ignore Property is lacking is .d.ts only
                md.target.Set(mouseX, mouseY);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
            }
        }
        if (mouseJoint) {
            if (isMouseDown) {
                mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
            }
            else {
                world.DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        }
        world.ClearForces();
        for (var thisBody = world.GetBodyList(); thisBody; thisBody = thisBody.GetNext()) {
            for (var otherBody = world.GetBodyList(); otherBody; otherBody = otherBody.GetNext()) {
                if (thisBody === otherBody) {
                    continue;
                }
                var dst = new b2Vec2(0, 0);
                dst.Add(otherBody.GetPosition());
                dst.Subtract(thisBody.GetPosition());
                var dstLen = dst.Normalize();
                dst.Multiply(5 * thisBody.GetMass() * otherBody.GetMass() / (dstLen * dstLen));
                thisBody.ApplyForce(dst, thisBody.GetPosition());
            }
        }
        world.Step(1 / 60, 10, 10);
        world.DrawDebugData();
        world.ClearForces();
    }
    //helpers
    //http://js-tut.aardon.de/js-tut/tutorial/position.html
    function getElementPosition(element) {
        var elem = element, tagname = "", x = 0, y = 0;
        while (elem && (typeof (elem.tagName) != "undefined")) {
            y += elem.offsetTop;
            x += elem.offsetLeft;
            tagname = elem.tagName.toUpperCase();
            if (tagname == "BODY")
                elem = null;
            if (elem) {
                if (typeof (elem.offsetParent) == "object")
                    elem = elem.offsetParent;
            }
        }
        return { x: x, y: y };
    }
    var box2dweb_1, b2Vec2, b2AABB, b2BodyDef, b2Body, b2FixtureDef, b2World, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef, world, fixDef, bodyDef, i, i, debugDraw, mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint, canvasPosition;
    return {
        setters: [
            function (box2dweb_1_1) {
                box2dweb_1 = box2dweb_1_1;
            }
        ],
        execute: function () {
            b2Vec2 = box2dweb_1["default"].Common.Math.b2Vec2;
            b2AABB = box2dweb_1["default"].Collision.b2AABB;
            b2BodyDef = box2dweb_1["default"].Dynamics.b2BodyDef;
            b2Body = box2dweb_1["default"].Dynamics.b2Body;
            b2FixtureDef = box2dweb_1["default"].Dynamics.b2FixtureDef;
            b2World = box2dweb_1["default"].Dynamics.b2World;
            b2PolygonShape = box2dweb_1["default"].Collision.Shapes.b2PolygonShape;
            b2CircleShape = box2dweb_1["default"].Collision.Shapes.b2CircleShape;
            b2DebugDraw = box2dweb_1["default"].Dynamics.b2DebugDraw;
            b2MouseJointDef = box2dweb_1["default"].Dynamics.Joints.b2MouseJointDef;
            world = new b2World(new b2Vec2(0, 0) //gravity
            , true //allow sleep
            );
            fixDef = new b2FixtureDef;
            fixDef.density = 1.0;
            fixDef.friction = 1.0;
            fixDef.restitution = 1.0;
            bodyDef = new b2BodyDef;
            //create ground
            bodyDef.type = b2Body.b2_staticBody;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(20, 2);
            bodyDef.position.Set(10, 400 / 30 + 1.8);
            world.CreateBody(bodyDef).CreateFixture(fixDef);
            bodyDef.position.Set(10, -1.8);
            world.CreateBody(bodyDef).CreateFixture(fixDef);
            fixDef.shape.SetAsBox(2, 14);
            bodyDef.position.Set(-1.8, 13);
            world.CreateBody(bodyDef).CreateFixture(fixDef);
            bodyDef.position.Set(21.8, 13);
            world.CreateBody(bodyDef).CreateFixture(fixDef);
            for (i = 0; i < 200; ++i) {
                world.CreateBody((function () {
                    var bodyDef = new b2BodyDef;
                    bodyDef.type = b2Body.b2_dynamicBody;
                    bodyDef.position.x = Math.random() * 18;
                    bodyDef.position.y = Math.random() * 12;
                    bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
                    bodyDef.linearVelocity.Set(5 * (Math.random() - 0.5), 5 * (Math.random() - 0.5));
                    return bodyDef;
                })()).CreateFixture((function () {
                    var fixDef = new b2FixtureDef;
                    fixDef.density = 0.01;
                    fixDef.friction = 1.0;
                    fixDef.restitution = 0.5;
                    fixDef.shape = new b2CircleShape(Math.random() * 0.05 + 0.05);
                    return fixDef;
                })());
            }
            for (i = 0; i < 2; ++i) {
                world.CreateBody((function () {
                    var bodyDef = new b2BodyDef;
                    bodyDef.type = b2Body.b2_dynamicBody;
                    bodyDef.position.x = Math.random() * 18;
                    bodyDef.position.y = Math.random() * 12;
                    bodyDef.angularVelocity = 2 * (Math.random() - 0.5);
                    bodyDef.linearVelocity.Set(15 * (Math.random() - 0.5), 15 * (Math.random() - 0.5));
                    return bodyDef;
                })()).CreateFixture((function () {
                    var fixDef = new b2FixtureDef;
                    fixDef.density = 10.0;
                    fixDef.friction = 1.0;
                    fixDef.restitution = 0.5;
                    fixDef.shape = new b2CircleShape(Math.random() * 0.5 + 0.5);
                    return fixDef;
                })());
            }
            //setup debug draw
            debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
            debugDraw.SetDrawScale(30.0);
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
            window.setInterval(update, 1000 / 60);
            canvasPosition = getElementPosition(document.getElementById("canvas"));
            document.addEventListener("mousedown", handleMouseDown, true);
            document.addEventListener("touchstart", handleMouseDown, true);
            document.addEventListener("mouseup", handleMouseUp, true);
            document.addEventListener("touchend", handleMouseUp, true);
            ;
            ;
        }
    };
});
//# sourceMappingURL=app.js.map