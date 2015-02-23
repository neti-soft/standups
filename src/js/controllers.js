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
    .controller('ProjectCtrl', ["$scope", "$h", 'Store', function ($scope, $h, Store) {

        //subview: details, edit, list, wizard
        $scope.view = null;

        // wizard like steps for startup
        $scope.wizardStep = 1;

        // temporary stuff, edited projects, not created stuff
        $scope.temp = {};

        // projects related models
        $scope.data = {};

        $scope.resetTemp = function () {
            $scope.temp = {
                project: {users: []}
            };
        };

        $scope.init = function () {
            $scope.resetTemp();
            $scope.data.projects = [];
            Store.get("projects").then(function (projects) {
                if ($h.isArray(projects)) {
                    $scope.data.projects = projects;
                    $scope.data.project = _.findWhere(projects, {active: true});
                    $scope.details($scope.data.project);
                } else {
                    $scope.wizard();
                }
            });
        };

        $scope.edit = function (project) {
            $scope.resetTemp();
            $scope.temp.project = _.clone(project);
            $scope.view = "edit";
        };

        $scope.cancelEdit = function (project) {
            $scope.resetTemp();
            $scope.details($scope.data.project);
        };

        $scope.wizard = function () {
            $scope.view = "wizard";
        };

        $scope.details = function (project) {
            $scope.data.project = project;
            $scope.view = "details";
        };

        $scope.list = function () {
            $scope.view = "list";
        };

        $scope.select = function (project) {
            if ($scope.data.project) {
                $scope.data.project.active = false;
            }
            $scope.data.project = project;
            $scope.data.project.active = true;
            //todo: save store
        };

        $scope.update = function (project) {
            $scope.data.project = project;
            //todo: save store
        };

        $scope.create = function (project) {
            if (project.name && project.name.trim() !== "") {
                //generate id
                project.id = $h.generateId();
                if (!$scope.data.project) {
                    $scope.data.project = project;
                    $scope.data.project.active = true;
                }
                $scope.data.projects.push(project);
                $scope.resetTemp();

                //todo: save store
            }
        };

        $scope.addUser = function (project, userName) {
            userName = userName.trim();
            if (userName !== "") {
                project.users.push({
                    id: $h.generateId(),
                    name: userName
                });
            }
        };

        $scope.removeUser = function (project, user) {
            if (project && user) {
                project.users = _.without(project.users, _.findWhere(project.users, {id: user.id}));
            }
        };

        $scope.remove = function (project) {
            Projects.remove(project.id);
        };

        $scope.goWizardNext = function () {
            if ($scope.wizardStep == 1 && $scope.temp.project.name && $scope.temp.project.name.trim() !== "") {
                $scope.wizardStep = 2;
            }
            if ($scope.wizardStep == 2 && $scope.temp.project.users.length) {
                $scope.create($scope.temp.project);
                $scope.details($scope.data.project);
            }
        }

        $scope.test = function (va) {
            debugger;
        }

    }])

    /* Controller for Settings view */
    .controller('SettingsCtrl', ["$scope", function ($scope) {

    }]);
