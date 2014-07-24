var directives = angular.module('standups.directives', []);


directives.directive("timer", function() {
    return {
        restrict: "AE",
        templateUrl: "templates/timer.html"
    }
})