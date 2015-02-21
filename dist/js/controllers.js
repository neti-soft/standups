'use strict';
angular.module('standups.ctrl', ['standups.helpers', 'standups.services'])

    /* Global view port controller. Handles all views */
    .controller('ViewportCtrl', ["$scope", "Extension", function ($scope, Extension) {

        $scope.Extension = Extension;

        Extension.Screen.scroll(function (extEl) {
            extEl.css('opacity', 0.3);
        });

        Extension.Screen.scrollStopped(function (extEl) {
            extEl.css('opacity', 1);
        });
    }])

    /* Controller for main view */
    .controller('MainTimerCtrl', ["$scope", "$rootScope", function ($scope, $rootScope) {

        $scope.startClick = function (e) {
            e.stopPropagation();
            $rootScope.$broadcast('timer-start');
        };

        $scope.stopClick = function (e) {
            e.stopPropagation();
            $rootScope.$broadcast('timer-stop');
        };

        $scope.resetClick = function (e) {
            e.stopPropagation();
            $rootScope.$broadcast('timer-reset');
        };

        $rootScope.$on('timer-timeout', function () {
            alert('Time is out!')
        });

    }])


    /* Controller for projects view */
    .controller('ProjectCtrl', ["$scope", "$h", "Projects", 'Store', function ($scope, $h, Projects) {

        //subview
        $scope.view = null;
        $scope.temp = {};

        $scope.init = function () {
            Projects.load().then(function () {
                $scope.details();
            });
        };

        $scope.getProjects = function () {
            return Projects.getList();
        };

        $scope.activeProject = function () {
            return Projects.getActive();
        };

        $scope.selectProject = function (project) {
            Projects.setActive(project);
        };

        $scope.addProject = function (projectName) {
            projectName = projectName.trim();
            if (projectName) {
                var project = Projects.add(projectName);
                if (!this.activeProject()) {
                    Projects.setActive(project);
                }
                $scope.temp.projectName = "";
            }
        };

        $scope.details = function () {
            $scope.view = "details";
        };

        $scope.addUser = function (userName) {
            userName = userName.trim();
            if (userName) {
                Projects.addUser(Projects.getActive().id, {
                    id: $h.generateId(),
                    name: userName
                });
                $scope.temp.userName = "";
            }
        };

        $scope.removeUser = function ($index) {
            Projects.removeUser(Projects.getActive().id, $index);
        };

        $scope.removeProject = function (project) {
            Projects.remove(project.id);
        };

        $scope.save = function () {
            var project = Projects.getActive();
            Projects.save(project);
            project.isEdited = false;
        };

        $scope.list = function () {
            $scope.view = "list";
        };

        $scope.editProject = function (project) {
            if (project) {
                Projects.setActive(project);
                project.isEdited = !project.isEdited;
                $scope.view = "details";
            }
        };

    }])

    /* Controller for Settings view */
    .controller('SettingsCtrl', ["$scope", function ($scope) {

    }]);
