var directives = angular.module('standups.directives', ["standups.ctrl", "standups.helpers"]);

directives.directive("timer", ["Timer", "Keyboard", function (Timer, Keyboard) {
    return {
        restrict: "AE",
        templateUrl: "templates/timer.html",
        link: function (scope, el, attr) {

            var els = {};
            var timer = new Timer();

            angular.forEach(["h1", "h2", "m1", "m2", "s1", "s2", 'hsep', 'msep', 'ssep', 'cntr'], function (cls) {
                els[cls] = $('.standups-timer .' + cls);
            });

            scope.defaults = {
                hour: 0,
                minutes: 5,
                seconds: 0
            };

            scope.cursorAt = "s2";

            scope.start = function () {
                scope.cancelEdit();
                timer.start();
                scope.update();
            };

            scope.timerStarted = function () {
                return timer.started;
            };

            scope.stop = function () {
                timer.stop();
            };

            scope.setDate = function (h, m, s) {
                timer.set(h, m, s);
                scope.update();
            };

            scope.update = function () {

                var t = Timer.to2digits(timer.time);

                els.hsep.show();
                els.msep.show();

                els.h1.html(t.h1).show();
                els.h2.html(t.h2).show();
                els.m1.html(t.m1).show();
                els.m2.html(t.m2).show();
                els.s1.html(t.s1).show();
                els.s2.html(t.s2).show();

                if(scope.isEdit) return;

                if (t.h1 == 0) {
                    els.h1.hide();
                }

                if (t.h2 == 0 && t.h1 == 0) {
                    els.hsep.hide();
                    els.h2.hide();
                }

                if (t.m1 == 0) {
                    els.m1.hide();
                }

                if (t.m2 == 0 && t.h2 == 0 && t.h1 == 0) {
                    els.m2.hide();
                    els.msep.hide();
                }

                if (t.s1 == 0) {
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

            scope.edit = function () {
                scope.isEdit = true;
                els.cntr.addClass('cntredit');
                timer.stop();
                els.hsep.show();
                els.msep.show();
                els.h1.show();
                els.h2.show();
                els.m1.show();
                els.m2.show();
                els.s1.show();
                els.s2.show();
                scope.placeCursor('s2');
            };

            scope.cancelEdit = function () {
                scope.isEdit = false;
                angular.forEach(els, function (el) {
                    el.removeClass('cur');
                });
                els.cntr.removeClass('cntredit');
                scope.update();
            };

            scope.stop = function () {
                timer.stop();
            };

            scope.placeCursor = function (t) {
                scope.cursorAt = t;
                angular.forEach(els, function (el) {
                    el.removeClass('cur');
                });
                els[t].addClass('cur');
            };

            scope.onNumberTyped = function (num) {
                if (scope.isEdit) {
                    timer.input(num);
                }
            };

            scope.onEnterTyped = function() {
                if (scope.isEdit) {
                    scope.cancelEdit();
                }
            };

            timer.on('change', scope.update);

            timer.on('timeout', scope.timeout);

            scope.setDate(scope.defaults.hour, scope.defaults.minutes, scope.defaults.seconds);

            Keyboard.on(/[0-9]/gi, scope.onNumberTyped);
            Keyboard.on("Enter", scope.onEnterTyped);
        }
    }
}])
