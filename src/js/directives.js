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

            scope.start = function () {
                timer.start();
            };

            scope.stop = function () {
                timer.stop();
            };

            scope.setDate = function (h, m, s) {
                timer.setAsTime(h, m, s);
                scope.update();
            };

            scope.update = function () {

                var h1 = Timer.format.to2digit(timer.time.h)[0],
                    h2 = Timer.format.to2digit(timer.time.h)[1],
                    m1 = Timer.format.to2digit(timer.time.m)[0],
                    m2 = Timer.format.to2digit(timer.time.m)[1],
                    s1 = Timer.format.to2digit(timer.time.s)[0],
                    s2 = Timer.format.to2digit(timer.time.s)[1];

                els.hsep.show();
                els.msep.show();

                els.h1.html(h1).show();
                els.h2.html(h2).show();
                els.m1.html(m1).show();
                els.m2.html(m2).show();
                els.s1.html(s1).show();
                els.s2.html(s2).show();

                if(h1 == 0) {
                    els.h1.hide();
                }

                if(h2 == 0 && h1 == 0) {
                    els.hsep.hide();
                    els.h2.hide();
                }

                if(m1 == 0) {
                    els.m1.hide();
                }

                if(m2 == 0 && h2 == 0 && h1 == 0) {
                    els.m2.hide();
                    els.msep.hide();
                }

                if(s1 == 0) {
                    els.s1.hide();
                }

            };

            scope.timeout = function () {
                alert('Timeout');
            };

            scope.reset = function () {
                timer.reset();
                scope.update();
            };

            scope.toggleEdit = function () {

            };

            timer.on('change', scope.update);

            timer.on('timeout', scope.timeout);

            scope.update();
        }
    }
}])
