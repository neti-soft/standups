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
        this.timeout = false;
        this.time = {};
        this._events = {};
        this.setAsTime(h, m, s);
        this.h = this.time.h;
        this.m = this.time.m;
        this.s = this.time.s;
    }

    Timer.prototype.start = function () {
        if (!this.timeout && !this.interval) {
            this.interval = setInterval(this.tick.bind(this), 1000);
        }
    };

    Timer.prototype.tick = function () {
        if (!this.timeout) {
            this.degrees();
            this.fire('change', this.time);
        } else {
            this.stop();
            this.fire('timeout', this.time);
        }
    };

    Timer.prototype.on = function (e, cb) {
        this._events[e] = cb;
    };

    Timer.prototype.fire = function (e) {
        var args = [].splice(1, arguments);
        this._events[e] && this._events[e].apply(this, args);
    };

    Timer.prototype.degrees = function () {
        var d = new Date(1, 1, 1, this.time.h, this.time.m, this.time.s);
        d.setSeconds(d.getSeconds() - 1);
        this.setAsDate(d);
        this.checkTimeout();
    };

    Timer.prototype.checkTimeout = function () {
        this.timeout = this.time.h == 0 && this.time.m == 0 && this.time.s == 0;
        return this.timeout;
    };

    Timer.prototype.stop = function () {
        clearInterval(this.interval);
        this.interval = null;
    };

    Timer.prototype.reset = function () {
        this.time.h = this.h;
        this.time.m = this.m;
        this.time.s = this.s;
        this.checkTimeout();
    };

    Timer.prototype.setAsDate = function (d) {
        this.time.h = d.getHours() + ((d.getDate() - 1) * 24);
        this.time.m = d.getMinutes();
        this.time.s = d.getSeconds();
        this.h = this.time.h;
        this.m = this.time.m;
        this.s = this.time.s;
        this.checkTimeout();
    };

    Timer.prototype.toArray = function () {
        var to2digit = function (n) {
            return ("0" + n).slice(-2);
        };

        return [
            to2digit(this.time.h)[0],
            to2digit(this.time.h)[1],
            to2digit(this.time.m)[0],
            to2digit(this.time.m)[1],
            to2digit(this.time.s)[0],
            to2digit(this.time.s)[1]
        ]
    }

    Timer.format = {
        to2digit : function (n) {
            return ("0" + n).slice(-2);
        }
    };

    Timer.prototype.setAsTime = function (h, m, s) {
        this.setAsDate(new Date(1, 1, 1, h || 0, m || 0, s || 0)); // Fri Feb 01 1901
    };

    return Timer;
});
