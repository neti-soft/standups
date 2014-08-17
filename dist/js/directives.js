var directives = angular.module('standups.directives', ["standups.ctrl", "standups.helpers"]);

directives.directive("timer", ["Timer", function (Timer) {
    return {
        restrict: "AE",
        templateUrl: "templates/timer.html",
        link: function (scope, el, attr) {

            var els = {};
            var timer = new Timer();

            angular.forEach(["h1", "h2", "m1", "m2", "s1", "s2"], function (cls) {
                els[cls] = document.getElementById(cls);
            });

            var format = function (timer) {
                var to2digit = function (n) {
                    return ("0" + n).slice(-2);
                };

                return {
                    h1: to2digit(timer.time.h)[0],
                    h2: to2digit(timer.time.h)[1],
                    m1: to2digit(timer.time.m)[0],
                    m2: to2digit(timer.time.m)[1],
                    s1: to2digit(timer.time.s)[0],
                    s2: to2digit(timer.time.s)[1]
                }
            };

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
                var time = format(timer);
                angular.forEach(els, function (el, key) {
                    el.innerHTML = time[key];
                });
            };

            scope.timeout = function () {
                alert('Timeout');
            };

            timer.on('change', scope.update);

            timer.on('timeout', scope.timeout);

            scope.reset = function () {
                timer.reset();
                scope.update();
            };

            scope.toggleEdit = function () {
                scope.isEdit = !scope.isEdit;
            };

            scope.update();
        }
    }
}])