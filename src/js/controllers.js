var ctrlrs = angular.module('standups.ctrl', ['standups.helpers']);

/* Global view port controller. Handles all views */
ctrlrs.controller('ViewportCtrl', ["$scope", "Extension", function ($scope, Extension) {

    $scope.Extension = Extension;

    Extension.Screen.scroll(function (extEl) {
        extEl.css('opacity', 0.3);
    });

    Extension.Screen.scrollStopped(function (extEl) {
        extEl.css('opacity', 1);
    });
}]);

/* Controller for main view */
ctrlrs.controller('MainTimerCtrl', ["$scope", "$rootScope", function ($scope, $rootScope) {

    $scope.startClick = function(e) {
        e.stopPropagation();
        $rootScope.$broadcast('timer-start');
    };

    $scope.stopClick = function(e) {
        e.stopPropagation();
        $rootScope.$broadcast('timer-stop');
    };

    $scope.resetClick = function(e) {
        e.stopPropagation();
        $rootScope.$broadcast('timer-reset');
    };

    $rootScope.$on('timer-timeout', function() {
        alert('Time is out!')
    });

}]);

/* Controller for Settings view */
ctrlrs.controller('SettingsCtrl', ["$scope", function ($scope) {

}]);
