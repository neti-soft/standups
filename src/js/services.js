"use strict";
angular.module("standups.services", ["standups.helpers"])

    // Service for storing data using the Chrome extension storage API.
    .service("Store", ["$q", "$h", function ($q, $h) {

        var cache = {};

        return {

            get: function (key) {
                if (!key) {
                    return $q.reject("Error: No \"key\" parameter specified.");
                }

                if (!$h.isString(key) || key.trim() === "") {
                    return $q.reject("Error: Parameter \"key\" is not valid string or empty.");
                }

                var def = $q.defer();

                if (cache[key]) {
                    return def.resolve(cache[key]);
                }

                chrome.storage.sync.get(key, function (value) {
                    if (chrome.runtime.lastError) {
                        def.reject(runtime.lastError);
                    }
                    cache[key] = value[key];
                    def.resolve(cache[key]);
                });

                return def.promise;
            },

            set: function (key, value) {

                if ($h.isUndefined(key)) {
                    return $q.reject("Error: No \"key\" parameter specified.");
                }

                if (!$h.isString(key) || key.trim() === "") {
                    return $q.reject("Error: Parameter \"key\" is not valid string or empty.");
                }

                if ($h.isUndefined(value)) {
                    return $q.reject("Error: No \"value\" parameter specified.");
                }

                var def = $q.defer();

                // Save it using the Chrome extension storage API.
                var data = {};
                data[key] = value;
                chrome.storage.sync.set(data, function (items) {
                    if (chrome.runtime.lastError) {
                        def.reject(chrome.runtime.lastError);
                    }
                    cache[key] = value;
                    def.resolve(items);
                });
                return def.promise;
            }
        }
    }])

    .service("Projects", ["$h", "Store", function ($h, Store) {

        var api = {

            data: {
                project: null, //active project
                projects: []
            },

            load: function () {
                return Store.get("projects").then(function (data) {
                    if ($h.isArray(data)) {
                        api.data.projects = data;
                        api.data.project = _.findWhere(data, {active: true});
                    }
                });
            },

            select: function (project) {
                if (api.data.project) {
                    api.data.project.active = false;
                }
                api.data.project = project;
                api.data.project.active = true;
            },

            selectUser: function (project, user) {
                var p = this.byId(project.id);
                if (!p) return;
                var u = _.findWhere(p.users, {id: user.id});
                if (!u) return;
                this.unSelectionAllUsers(p);
                u.active = true;
            },

            byId: function(id) {
                return _.findWhere(api.data.projects, {id: id});
            },

            unSelectionAllUsers: function(project) {
                _.each(project.users, function (u) {
                    u.active = false;
                });
            },

            update: function (project) {
                var original = _.findWhere(api.data.projects, {id: project.id});
                if (original) {
                    original.name = project.name;
                    original.users = project.users;
                }
            },

            create: function (project) {
                //generate id
                project.id = $h.generateId();
                if (!api.data.project) {
                    api.data.project = project;
                    api.data.project.active = true;
                }
                api.data.projects.push(project);
            },

            addUser: function (project, userName) {
                project.users.push({
                    id: $h.generateId(),
                    name: userName
                });
            },

            removeUser: function (project, user) {
                $h.removeFromArray(project.users, {id: user.id});
            },

            remove: function (project) {
                if (api.data.project == project) {
                    api.data.project = null;
                }
                $h.removeFromArray(api.data.projects, {id: project.id});
            },

            saveState: function () {
                return Store.set("projects", angular.copy(api.data.projects));
            }
        };

        return api;
    }])

    .service("Extension", function () {

        var el = $("#extension-standups");

        $.fn.scrollStopped = function (callback) {
            $(this).scroll(function () {
                var self = this, $this = $(self);
                if ($this.data("scrollTimeout")) {
                    clearTimeout($this.data("scrollTimeout"));
                }
                $this.data("scrollTimeout", setTimeout(callback, 250, self));
            });
        };

        var Ext = {

            isMaximized: true,

            toggleSound: function () {
                Ext.Settings.enableSound = !Ext.Settings.enableSound;
            },

            quit: function () {
                el.remove();
            },

            minimize: function() {
                this.isMaximized = false;
            },

            maximize: function() {
                this.isMaximized = true;
            },

            Settings: {
                enableSound: true
            },

            Nav: {
                view: "main",
                to: function (name) {
                    Ext.Nav.view = name;
                },
                is: function (view) {
                    return Ext.Nav.view == view;
                }
            },

            Screen: {
                scroll: function (cb) {
                    $(document).scroll(cb.bind(document, el));
                },

                scrollStopped: function (cb) {
                    $(document).scrollStopped(cb.bind(document, el))
                }
            }
        };

        return Ext;
    })

    .service("Standup", ["Observable", function (Observable) {
        return {
            paused: false
        };
    }])

    .factory("Observable", [function() {

        function Observable() {
            this._events = {};
        }

        Observable.mixin = function(o) {
            var obs = new Observable();
            return _.extend(o, obs);
        };

        Observable.prototype.on = function (e, cb) {
            this._events[e] = cb;
        };

        Observable.prototype._fire = function (e) {
            var args = [].splice(1, arguments);
            this._events[e] && this._events[e].apply(this, args);
        };

        return Observable;
    }])

    .factory("Timer", ["Observable", function (Observable) {

        function Timer(h, m, s) {
            this.started = false;
            this.timeout = false;
            this.time = {};
            this.set(h, m, s);
        }

        Timer.prototype.set = function () {
            var date = arguments[0];
            if (arguments.length > 1) {
                date = new Date(1, 1, 1, arguments[0] || 0, arguments[1] || 0, arguments[2] || 0); // Fri Feb 01 1901
            }
            this._update(date);
            this.h = this.time.h;
            this.m = this.time.m;
            this.s = this.time.s;
            this.checkTimeout();
            this._fire("change", this.time);
        };

        Timer.prototype.start = function () {
            if (!this.timeout && !this.interval) {
                this.started = true;
                this.interval = setInterval(this._tick.bind(this), 1000);
            }
        };

        Timer.prototype._tick = function () {
            if (!this.timeout) {
                this._degrees();
                this._fire("change", this.time);
            } else {
                this.stop();
                this._fire("timeout", this.time);
            }
        };

        Timer.prototype._update = function (date) {
            this.time.h = date.getHours() + ((date.getDate() - 1) * 24);
            this.time.m = date.getMinutes();
            this.time.s = date.getSeconds();
        };

        Timer.prototype._degrees = function () {
            var d = new Date(1, 1, 1, this.time.h, this.time.m, this.time.s);
            d.setSeconds(d.getSeconds() - 1);
            this._update(d);
            this.checkTimeout();
        };

        Timer.prototype.checkTimeout = function () {
            this.timeout = this.time.h == 0 && this.time.m == 0 && this.time.s == 0;
            return this.timeout;
        };

        Timer.prototype.stop = function () {
            clearInterval(this.interval);
            this.started = false;
            this.interval = null;
        };

        Timer.prototype.reset = function () {
            this.time.h = this.h;
            this.time.m = this.m;
            this.time.s = this.s;
            this.checkTimeout();
        };

        Timer.prototype.zero = function () {
            this.set(0, 0, 0);
        };

        Timer.prototype.input = function (num) {
            var t = Timer.to2digits(this.time);
            //shift left
            t.h1 = t.h2;
            t.h2 = t.m1;
            t.m1 = t.m2;
            t.m2 = t.s1;
            t.s1 = t.s2;
            t.s2 = num;
            t = Timer.from2digits(t);
            this.set(t.h, t.m, t.s);
        };

        Timer.to2digit = function (n) {
            return ("0" + n).slice(-2);
        };

        Timer.to2digits = function (time) {
            var f = Timer.to2digit;
            return {
                h1: f(time.h)[0],
                h2: f(time.h)[1],
                m1: f(time.m)[0],
                m2: f(time.m)[1],
                s1: f(time.s)[0],
                s2: f(time.s)[1]
            };
        };

        Timer.from2digits = function (time) {
            return {
                h: time.h1 + time.h2,
                m: time.m1 + time.m2,
                s: time.s1 + time.s2
            }
        };

        Timer.prototype = Observable.mixin(Timer.prototype);

        return Timer;
    }])

    .service("Keyboard", [function () {

        var subs = [];


        var Keyboard = {};

        // Lets user to use special key names, as CTRL+Enter, Backspace, ALT+Del, ALT+DELETE, instead of ascii code
        Keyboard.SpecialKeys = {
            8: /^backspace$/gi,
            9: /^tab$/gi,
            13: /^enter$/gi,
            27: /^escape|esc$/gi,
            32: /^space|spacebar$/gi,
            37: /^left arrow|left$/gi,
            38: /^up arrow|up$/gi,
            39: /^right arrow|right$/gi,
            40: /^down arrow|down$/gi,
            45: /^insert$/gi,
            46: /^delete|del$/gi
        };

        var ctrlRgx = /ctrl/gi,
            altRgx = /alt|left alt/gi,
            cmdRgx = /cmd|command/gi,
            shiftRgx = /shift/gi;


        var Subscription = function (value, cb, ctx) {
            this.cb = cb;
            this.value = value;
            this.ctx = ctx;
            this.ctrlKey = ctrlRgx.test(value);
            this.altKey = altRgx.test(value);
            this.metaKey = cmdRgx.test(value);
            this.shiftKey = shiftRgx.test(value);

            if (typeof value === "number") {
                this.code = value;
                return;
            }

            if (value instanceof RegExp) {
                this.pattern = value;
                return;
            }

            var parts = value.split("+");
            value = parts[parts.length - 1];

            if (value == "*") {
                this.pattern = new RegExp(".", "gi");
                return;
            }

            for (var code in Keyboard.SpecialKeys) {
                if (Keyboard.SpecialKeys[code].test(value)) {
                    this.code = parseInt(code);
                    return;
                }
            }
            this.code = value.charCodeAt(0);
        };

        Subscription.hasEqualProperties = function (a, b, keys) {
            return keys.reduce(function (prevResult, key) {
                if (typeof prevResult == "string") {
                    prevResult = a[prevResult] === b[prevResult];
                }
                if (key == "pattern") {
                    return (a.pattern && b.pattern && a.pattern.toString() == b.pattern) && prevResult;
                }
                return a[key] === b[key] && prevResult;
            });
        };

        Subscription.prototype.fire = function (e) {
            this.cb.call(this.ctx, String.fromCharCode(e.which), e, this);
        };

        Subscription.prototype.match = function (event) {
            var match = false;
            if (!event instanceof KeyboardEvent) return match;
            var specialsMatch = Subscription.hasEqualProperties(this, event, ["altKey", "ctrlKey", "shiftKey", "metaKey"]);
            if (Keyboard.SpecialKeys[event.which] || this.code) {
                return specialsMatch === true && this.code == event.which;
            } else {
                var str = String.fromCharCode(event.which);
                return specialsMatch === true && (new RegExp(this.pattern)).test(str) === true;
            }
        };

        Subscription.prototype.equals = function (sub) {
            return Subscription.hasEqualProperties(this, sub,
                ["ctrlKey", "altKey", "shiftKey", "metaKey", "pattern", "code", "cb"]);
        };

        /**
         * Subscribes callback for specific key value pattern
         * @param value [String, Number, Regex]
         * @param cb Function
         * @param ctx Object optional function context
         */
        Keyboard.on = function (value, cb, ctx) {
            subs.push(new Subscription(value, cb, ctx));
        };

        Keyboard.off = function (value, cb) {
            var subToOff = new Subscription(value, cb);
            for (var i = 0, sub = subs[i]; i < subs.length; i++) {
                if (sub.equals(subToOff)) {
                    delete subs[i];
                    subs.splice(i, 1);
                }
            }
        };

        window.addEventListener("keydown", function (e) {
            subs.forEach(function (sub) {
                if (sub.match(e)) {
                    sub.fire(e);
                }
            });
        });

        return Keyboard;
    }]);