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
System.register("main", ["pixi.js", "physics", "game", "Ball"], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
    function update() {
        var now = window.performance.now() / 1000;
        var dt = 0;
        if (lastUpdateTime) {
            dt = now - lastUpdateTime;
            ups = ups * 0.95 + 1 / dt * 0.05;
        }
        else {
            ups = 0;
        }
        lastUpdateTime = now;
        gameContainer.physicsContainer.update(1);
        gameContainer.update(1);
    }
    function render() {
        var now = window.performance.now() / 1000;
        if (lastRenderTime) {
            var dt = now - lastRenderTime;
            fps = fps * 0.95 + 1 / dt * 0.05;
        }
        else {
            fps = 0;
        }
        lastRenderTime = now;
        gameContainer.render();
        renderer.render(gameContainer.pixiContainer);
        fpsLabel.innerText = "FPS " + (fps && fps.toFixed(2)) + " / UPS " + (ups && ups.toFixed(2));
        requestAnimationFrame(render);
    }
    var PIXI, physics, game, Ball_1, fpsLabel, width, height, renderer, gameContainer, lastUpdateTime, ups, lastRenderTime, fps, updater;
    return {
        setters: [
            function (PIXI_2) {
                PIXI = PIXI_2;
            },
            function (physics_2) {
                physics = physics_2;
            },
            function (game_2) {
                game = game_2;
            },
            function (Ball_1_1) {
                Ball_1 = Ball_1_1;
            }
        ],
        execute: function () {
            fpsLabel = document.getElementById("fps-label");
            width = 1000;
            height = 500;
            renderer = PIXI.autoDetectRenderer(width, height);
            document.body.appendChild(renderer.view);
            gameContainer = new game.Container();
            gameContainer.pixiContainer = new PIXI.Container();
            gameContainer.physicsContainer = new physics.Container(width, height);
            gameContainer.add((function () {
                var ball = new Ball_1.Ball(100);
                ball.physicsObject.position.set([width / 2, height / 2]);
                ball.physicsObject.density = 10;
                return ball;
            })());
            for (var i = 0; i < 100; i++) {
                gameContainer.add((function () {
                    var ball = new Ball_1.Ball(1 + Math.random() * 4);
                    ball.physicsObject.position.set([Math.random() * width, Math.random() * height]);
                    ball.physicsObject.velocity.set([Math.random() * 1, Math.random() * 1]);
                    return ball;
                })());
            }
            updater = setInterval(update, 20);
            requestAnimationFrame(render);
        }
    };
});
//# sourceMappingURL=app.js.map