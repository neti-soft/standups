'use strict';
angular.module('standups.services', ['standups.helpers'])

    // Service for storing data using the Chrome extension storage API.
    .service("Store", ['$q', '$h', function ($q, $h) {

        var cache = {};

        return {

            get: function (key) {
                if (!key) {
                    return $q.reject("Error: No 'key' parameter specified.");
                }

                if (!$h.isString(key) || key.trim() === "") {
                    return $q.reject("Error: Parameter 'key' is not valid string or empty.");
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
                    return $q.reject("Error: No 'key' parameter specified.");
                }

                if (!$h.isString(key) || key.trim() === "") {
                    return $q.reject("Error: Parameter 'key' is not valid string or empty.");
                }

                if ($h.isUndefined(value)) {
                    return $q.reject("Error: No 'value' parameter specified.");
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

    .service('Projects', ['$h', 'Store', function ($h, Store) {

        var projects = [];

        return {

            load: function () {
                return Store.get('projects').then(function (data) {
                    if ($h.isArray(data)) {
                        projects = data;
                    }
                });
            },

            addUser: function (id, user) {
                var project = this.findIndexById(id);
                project.users.push(user);
                Projects.save(project);
            },

            removeUser: function (id, $index) {
                var project = this.findIndexById(id);
                project.users.splice($index, 1);
                Projects.save(project);
            },

            save: function (p) {
                var project = projects[this.findIndexById(p.id)];
                project.users = p.users;
                project.name = p.name;
                project.active = p.active;
                delete project.isEdited;
                Store.set("projects", projects);
            },

            findIndexById: function (id) {
                return _.findIndex(projects, function (p) {
                    return p.id === id;
                });
            },

            getActive: function () {
                return _.findWhere(projects, {active: true});
            },

            add: function (projectName) {
                projects.push({
                    id: Math.max.apply(null, projects.map(function (p) {
                        return p.id
                    })) + 1,
                    name: projectName,
                    users: []
                })
            },

            setActive: function (project) {
                if ($h.isUndefined(project)) {
                    throw new Error("Error: project is undefined.");
                }
                this.getActive().active = false;
                _.findWhere(projects, {id: project.id}).active = true;
            },

            remove: function (id) {
                var index = _.findIndex(projects, function (p) {
                    return p.id = id;
                });
                projects.splice(index, 1);
                Store.set("projects", projects);
            },

            getList: function () {
                return projects;
            }
        }
    }])

    .service("Extension", function () {

        var el = $('#extension-standups');

        $.fn.scrollStopped = function (callback) {
            $(this).scroll(function () {
                var self = this, $this = $(self);
                if ($this.data('scrollTimeout')) {
                    clearTimeout($this.data('scrollTimeout'));
                }
                $this.data('scrollTimeout', setTimeout(callback, 250, self));
            });
        };

        var Ext = {

            toggleSound: function () {
                Ext.Settings.enableSound = !Ext.Settings.enableSound;
            },

            quit: function () {
                el.remove();
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

    .factory("Timer", function () {

        function Timer(h, m, s) {
            this.started = false;
            this.timeout = false;
            this.time = {};
            this._events = {};
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
            this._fire('change', this.time);
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
                this._fire('change', this.time);
            } else {
                this.stop();
                this._fire('timeout', this.time);
            }
        };

        Timer.prototype._update = function (date) {
            this.time.h = date.getHours() + ((date.getDate() - 1) * 24);
            this.time.m = date.getMinutes();
            this.time.s = date.getSeconds();
        }

        Timer.prototype.on = function (e, cb) {
            this._events[e] = cb;
        };

        Timer.prototype._fire = function (e) {
            var args = [].splice(1, arguments);
            this._events[e] && this._events[e].apply(this, args);
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

        return Timer;
    })

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

            var parts = value.split('+');
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