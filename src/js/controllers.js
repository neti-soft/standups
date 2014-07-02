angular.module('standups.ctrl', ['standups.helpers']);

angular.module('standups.ctrl').controller('ViewportCtrl', ["$scope", "Helpers", function ($scope, Helpers) {

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
        Helpers.requestFullScreen(".viewport");
        $scope.model.isFullScreen = !$scope.model.isFullScreen;
    }

}]);

angular.module('standups.ctrl').controller('MainCtrl', ["$scope", function ($scope) {

}]);

angular.module('standups.ctrl').controller('SettingsCtrl', ["$scope", function ($scope) {

}]);
