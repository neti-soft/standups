var directives = angular.module('standups.directives', ["standups.ctrl"]);

directives.directive("timer", function() {
    return {
        restrict: "AE",
        controller: "TimerCtrl",
        templateUrl: "templates/timer.html"
    }
})