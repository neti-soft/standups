'use strict';
angular.module('standups.directives', ["standups.ctrl", "standups.helpers", "standups.services"])

    .directive("timer", ["$rootScope", "Timer", "Keyboard", function ($rootScope, Timer, Keyboard) {
        return {
            restrict: "AE",
            templateUrl: "templates/timer.html",
            link: function (scope, el, attr) {

                var els = {};
                var timer = new Timer();

                angular.forEach(["h1", "h2", "m1", "m2", "s1", "s2", 'hsep', 'msep', 'ssep', 'cntr'], function (cls) {
                    els[cls] = $(el).find('.' + cls);
                });

                scope.defaults = {
                    hour: 0,
                    minutes: 5,
                    seconds: 0
                };

                scope.cursorAt = "s2";

                $rootScope.$on('timer-start', function () {
                    scope.cancelEdit();
                    timer.start();
                    scope.update();
                });

                $rootScope.$on('timer-reset', function () {
                    timer.reset();
                    scope.update();
                });

                $rootScope.$on('timer-stop', function () {
                    timer.stop();
                });

                $rootScope.$on('timer-set', function (h, m, s) {
                    scope.setDate(h, m, s);
                });

                timer.on('timeout', function () {
                    $rootScope.$emit('timer-timeout', timer);
                });

                scope.timerStarted = function () {
                    return timer.started;
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

                    if (scope.isEdit) return;

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

                    if (t.m1 == 0 && t.m2 == 0 && t.h2 == 0 && t.h1 == 0) {
                        els.m2.hide();
                        els.msep.hide();
                    }

                    if (t.s1 == 0 && t.m1 == 0 && t.m2 == 0 && t.h2 == 0 && t.h1 == 0) {
                        els.s1.hide();
                    }

                };

                scope.edit = function (e) {
                    e.stopPropagation();
                    scope.isEdit = true;
                    scope.canZero = true;
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
                        el.removeClass('cur').removeClass('dirty');
                    });
                    els.cntr.removeClass('cntredit');
                    scope.update();
                };

                scope.placeCursor = function (t) {
                    scope.cursorAt = t;
                    angular.forEach(els, function (el) {
                        el.removeClass('cur');
                    });
                    els[t].addClass('cur');
                };

                scope.dirtyNext = function () {
                    var order = ["ssep", "s2", "s1", "msep", "m2", "m1", "hsep", "h2", "h1"];
                    for (var i = 0; i < order.length; i++) {
                        var el = els[order[i]];
                        if (order[i] == "ssep" || order[i] == "msep" || order[i] == "hsep") {
                            el.addClass("dirty");
                        }
                        if (!el.hasClass("dirty")) {
                            el.addClass("dirty");
                            break;
                        }
                    }
                };

                scope.onNumberTyped = function (num) {
                    if (scope.isEdit) {

                        if (scope.canZero) {
                            scope.canZero = false;
                            timer.zero();
                        }

                        timer.input(num);
                        scope.dirtyNext();
                    }
                };

                scope.onEnterTyped = function () {
                    if (scope.isEdit) {
                        scope.cancelEdit();
                    }
                };

                Keyboard.on(/[0-9]/gi, scope.onNumberTyped);

                Keyboard.on("Enter", scope.onEnterTyped);

                timer.on('change', scope.update);

                scope.setDate(scope.defaults.hour, scope.defaults.minutes, scope.defaults.seconds);

                $('#extension-standups').click(function () {
                    if (scope.isEdit) {
                        scope.cancelEdit();
                    }
                });
            }
        }
    }])


    .directive("teams", ["$rootScope", function ($rootScope) {
        return {
            restrict: "AE",
            templateUrl: "templates/teams.html",
            link: function (scope, el, attr) {

            }
        };
    }])

    .directive('focusOn', ["$timeout", function ($timeout) {
        return function (scope, el, attr) {

            var timeout = function (fn) {
                $timeout(function () {
                    el[0][fn]();
                }, 200);
            };

            scope.$watch(attr.focusOn, function (value) {

                if (value) {
                    timeout("focus");
                } else {
                    timeout("blur");
                }
            })
        }
    }])

    .directive('keypress', ['$parse', function ($parse) {

        var keysByCode = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'insert',
            46: 'delete'
        };

        return function (scope, elm, attrs) {
            var params, combinations = [];

            params = scope.$eval(attrs.keypress);

            // Prepare combinations for simple checking
            angular.forEach(params, function (v, k) {
                var combination, expression;
                expression = $parse(v);

                angular.forEach(k.split(' '), function (variation) {
                    combination = {
                        expression: expression,
                        keys: {}
                    };
                    angular.forEach(variation.split('-'), function (value) {
                        combination.keys[value] = true;
                    });
                    combinations.push(combination);
                });
            });

            // Check only matching of pressed keys one of the conditions
            elm.bind("keypress", function (event) {
                var keyCode = event.keyCode;
                // Iterate over prepared combinations
                angular.forEach(combinations, function (combination) {
                    var mainKeyPressed = combination.keys[keysByCode[keyCode]] || combination.keys[keyCode.toString()];
                    if (mainKeyPressed) {
                        // Run the function
                        scope.$apply(function () {
                            combination.expression(scope, {'$event': event});
                        });
                    }
                });
            });
        }
    }]);
