var ctrlrs = angular.module('standups.ctrl', ['standups.helpers']);

/* Global view port controller. Handles all views */
ctrlrs.controller('ViewportCtrl', ["$scope", "Screen", function ($scope, Screen) {

    $scope.model = {
        currentView: "main",
        isFullScreen: false,
        settings: {
            volume: true
        }
    };

    $scope.isVolume = function (state) {
        return $scope.model.settings.volume == state;
    };

    $scope.isSection = function (view) {

        return $scope.model.currentView == view;
    };

    $scope.isFullScreen = function (state) {
        return $scope.model.isFullScreen == state;
    }

    $scope.toggleVolume = function () {
        $scope.model.settings.volume = !$scope.model.settings.volume;
    };

    $scope.showSettings = function () {
        this.model.currentView = "settings";
    };

    $scope.closeSettings = function () {
        $scope.model.currentView = "main";
    };

    $scope.fullScreen = function () {
        Screen.requestFullScreen(".viewport");
        $scope.model.isFullScreen = !$scope.model.isFullScreen;
    }

    Screen.scroll(function (extEl) {
        extEl.css('opacity', 0.3);
    });

    Screen.scrollStopped(function (extEl) {
        extEl.css('opacity', 1);
    });
}]);

/* Controller for main view */
ctrlrs.controller('MainCtrl', ["$scope", "$rootScope", function ($scope, $rootScope) {


    $scope.start = function(e) {
        e.stopPropagation();
        $rootScope.$broadcast('timer-start');
    };

    $scope.stop = function(e) {
        e.stopPropagation();
        $rootScope.$broadcast('timer-stop');
    };

    $scope.reset = function(e) {
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

/* Controller for toggled extension mode */
ctrlrs.controller('ExtensionMiniCtrl', ["$scope", function ($scope) {

}]);
