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

    window.addEventListener("keydown", function (e) {
        subs.forEach(function(sub) {
            if (sub.prevent) {
                e.preventDefault();
            }
            var str = String.fromCharCode(e.keyCode);
            if(sub.pattern.test(str)) sub.callback(e, str);
        });
    });

    return {
        on: function (pattern, cb, prevent) {
            subs.push({
                pattern: pattern,
                callback: cb,
                prevent: prevent || false
            });
        }
    }
}]);
