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
    .controller('ProjectCtrl', ["$scope", "$h", "Projects", function ($scope, $h, Projects) {

        //subview: details, edit, list, wizard
        $scope.view = null;

        // wizard like steps for startup
        $scope.wizardStep = 1;

        // temporary stuff, edited projects, not created stuff
        $scope.temp = {};

        // projects related models
        $scope.data = Projects.data;

        $scope.resetTemp = function () {
            $scope.temp = {
                project: {users: []}
            };
        };

        $scope.init = function () {
            $scope.resetTemp();
            Projects.load().then(function () {
                if (Projects.data.projects.length) {
                    $scope.goSubView("details");
                } else {
                    $scope.goSubView('wizard');
                }
            });
        };

        $scope.goSubView = function (view) {
            $scope.view = view;
        };

        $scope.goWizardNext = function () {
            if ($scope.wizardStep == 1 && $scope.temp.project.name && $scope.temp.project.name.trim() !== "") {
                $scope.wizardStep = 2;
            }

            if ($scope.wizardStep == 2 && $scope.temp.project.users.length) {
                Projects.create($scope.temp.project);
                $scope.goSubView("details");
                Projects.saveState();
            }
        };

        $scope.selectProject = function (project) {
            Projects.select(project);
            Projects.saveState();
        };

        $scope.createProject = function (project) {
            if (!project.name || project.name.trim() === "" || !$h.isArray(project.users)) return;
            Projects.create(project);
            Projects.saveState();
            $scope.resetTemp();
        };

        $scope.editProject = function (project) {
            $scope.resetTemp();
            $scope.temp.project = _.clone(project);
            $scope.goSubView("edit");
        };

        $scope.cancelEdit = function (project) {
            $scope.resetTemp();
            $scope.data.project = _.findWhere($scope.data.projects, {id: project.id});
            $scope.goSubView("details");
        };

        $scope.updateProject = function (project) {
            Projects.update(project);
            Projects.saveState();
            $scope.goSubView("details");
        };

        $scope.removeProject = function (project) {
            //todo: add r u sure logic
            Projects.remove(project);
            Projects.saveState();
        };

        $scope.addUser = function (project, userName) {
            if (!project || !userName) return;
            if (!userName.trim()) return;
            Projects.addUser(project, userName.trim());
            Projects.saveState();
            $scope.resetTemp();
        };

        $scope.removeUser = function (project, user) {
            if (!project || !user) return;
            Projects.removeUser(project, user);
            Projects.saveState();
        };

    }])

    /* Controller for Settings view */
    .controller('SettingsCtrl', ["$scope", function ($scope) {

    }]);
