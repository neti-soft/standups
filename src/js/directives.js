var directives = angular.module('standups.directives', ["standups.ctrl", "standups.helpers"]);

directives.directive("timer", ["Timer", function (Timer) {
    return {
        restrict: "AE",
        templateUrl: "templates/timer.html",
        link: function (scope, el, attr) {

            var els = {};
            var timer = new Timer();

            angular.forEach(["h1", "h2", "m1", "m2", "s1", "s2", 'hsep', 'msep', 'ssep'], function (cls) {
                els[cls] = $('.standups-timer .' + cls);
            });

            scope.isEdit = false;

            scope.start = function () {
                scope.isEdit = false;
                timer.start();
            };

            scope.stop = function () {
                timer.stop();
            };

            scope.setDate = function () {
                timer.setAsTime(0, 0, 99); //99 secs
                scope.update();
            };

            scope.update = function () {

                var to2digit = function (n) {
                    return ("0" + n).slice(-2);
                };

                var h1 = to2digit(timer.time.h)[0],
                    h2 = to2digit(timer.time.h)[1],
                    m1 = to2digit(timer.time.m)[0],
                    m2 = to2digit(timer.time.m)[1],
                    s1 = to2digit(timer.time.s)[0],
                    s2 = to2digit(timer.time.s)[1];

                if (h1 > 0) {
                    els.h1.show().html(h1);
                } else {
                    els.h1.hide();
                }

                if (h2 > 0) {
                    els.h2.show().html(h2);
                    els.hsep.show();
                } else if (h1 <= 0) {
                    els.h2.hide();
                    els.hsep.hide();
                }

                if (m1 > 0) {
                    els.m1.show().html(m1);
                } else if (h2 <= 0) {
                    els.m1.hide();
                }

                if (m2 > 0) {
                    els.m2.show().html(m2);
                    els.msep.show();
                } else if (m1 <= 0) {
                    els.m2.hide();
                    els.msep.hide();
                }

                if (s1 > 0) {
                    els.s1.show().html(s1);
                } else if (m2 <= 0) {
                    els.s1.hide();
                }

                els.s2.show().html(s2);
            };

            scope.timeout = function () {
                alert('Timeout');
            };

            scope.reset = function () {
                timer.reset();
                scope.update();
            };

            scope.toggleEdit = function () {
                scope.isEdit = !scope.isEdit;
            };

            timer.on('change', scope.update);

            timer.on('timeout', scope.timeout);

            scope.update();
        }
    }
}])
