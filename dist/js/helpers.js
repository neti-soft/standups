var helpers = angular.module('standups.helpers', []);

helpers.service("Screen", function () {

    var extensionEl = $('#extension-standups');

    $.fn.scrollStopped = function (callback) {
        $(this).scroll(function () {
            var self = this, $this = $(self);
            if ($this.data('scrollTimeout')) {
                clearTimeout($this.data('scrollTimeout'));
            }
            $this.data('scrollTimeout', setTimeout(callback, 250, self));
        });
    };

    return {

        requestFullScreen: function (elSelector) {
            var elem = document.querySelector(elSelector);
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        },

        scroll: function (cb) {
            $(document).scroll(cb.bind(document, extensionEl));
        },

        scrollStopped: function (cb) {
            $(document).scrollStopped(cb.bind(document, extensionEl))
        }
    }
});

helpers.factory("Timer", function () {

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

    Timer.format = {
        to2digit: function (n) {
            return ("0" + n).slice(-2);
        }
    };

    return Timer;
});

helpers.service("Keyboard", [function () {

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
