angular.module('standups.ctrl', []);

angular.module('standups.ctrl').controller('ViewportCtrl', ["$scope", function ($scope) {

    $scope.model = {
        currentView: "main",
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

    $scope.toggleVolume = function () {
        $scope.model.settings.volume = !$scope.model.settings.volume;
    };

    $scope.showSettings = function () {
        this.model.currentView = "settings";
    };

    $scope.closeSettings = function () {
        $scope.model.currentView = "main";
    };

}]);

angular.module('standups.ctrl').controller('MainCtrl', ["$scope", function ($scope) {

}]);

angular.module('standups.ctrl').controller('SettingsCtrl', ["$scope", function ($scope) {

}]);