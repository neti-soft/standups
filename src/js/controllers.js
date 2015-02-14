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

/* Controller for teams view */
ctrlrs.controller('TeamsCtrl', ["$scope", "$rootScope", "$timeout", function ($scope, $rootScope, $timeout) {

    $scope.model = {
        tempTeamName: "",
        selectedUser: null,
        teams : [ { name: "My Team", users: [
            { name: "Max" },
            { name: "Marry"}
        ]}],
        selectedTeam : null
    };

    $scope.init = function() {
        $scope.model.selectedTeam = $scope.model.teams[0];
        $scope.model.selectedTeam.selected = true;
    };

    $scope.editTeamClick = function(team) {
        $scope.editTeam = true;
        $scope.model.tempTeamName = team.name;
        $scope.focusInput('standups-team-name');
    };

    $scope.focusInput = function(id) {
        $timeout(function() {
            document.getElementById(id).focus();
        });
    };

    $scope.updateTeamName = function(selectedTeam, tempTeamName) {
       if(tempTeamName.trim()) {
           selectedTeam.name = tempTeamName;
           $scope.editTeam = false;
       }
    };

    $scope.addTeamClick = function() {
        $scope.showTeams = true;
        $scope.showNewTeam = true;
    };

    $scope.createNewTeam = function(teamName) {
        if(teamName.trim()) {
            var team = {
                name: teamName,
                users: []
            };
            $scope.model.tempTeamName = "";
            $scope.model.teams.push(team);
        }
    }

    $scope.selectTeam = function(team) {
        team.selected = true;
        $scope.model.selectedTeam.selected = false;
        $scope.model.selectedTeam = team;
    }
}]);

/* Controller for Settings view */
ctrlrs.controller('SettingsCtrl', ["$scope", function ($scope) {

}]);
