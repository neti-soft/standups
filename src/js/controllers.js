"use strict";
angular.module("standups.ctrl", ["standups.helpers", "standups.services"])

    /* Global view port controller. Handles all views */
    .controller("ViewportCtrl", ["$scope", "Extension", function ($scope, Extension) {

        $scope.Extension = Extension;

        Extension.Screen.scroll(function (extEl) {
            extEl.css("opacity", 0.3);
        });

        Extension.Screen.scrollStopped(function (extEl) {
            extEl.css("opacity", 1);
        });

        $scope.listStyle = function() {
            return {
                height: window.innerHeight - 240 + "px"
            }
        }
    }])

    /* Controller for main view */
    .controller("TimerCtrl", ["$scope", "$rootScope", "Standup", function ($scope, $rootScope, Standup) {

        $scope.startClick = function () {
            if (Standup.paused) {
                Standup.paused = false;
                $rootScope.$broadcast("timer-resume");
            } else {
                $rootScope.$broadcast("timer-reset");
                $rootScope.$broadcast("timer-start");
                $scope.nextSpeaker();
            }
        };

        $scope.isPaused = function () {
            return Standup.paused;
        };

        $scope.stopClick = function () {
            Standup.paused = true;
            $rootScope.$broadcast("timer-stop");
        };

        $scope.resetClick = function () {
            Standup.paused = false;
            $rootScope.$broadcast("timer-reset");
        };

        $rootScope.$on("user-select", function() {
            $rootScope.$broadcast("timer-reset");
        });

    }])

    /* Controller for projects view */
    .controller("ProjectCtrl",
    ["$scope", "$rootScope", "$h", "Projects", "Standup", function ($scope, $rootScope, $h, Projects, Standup) {

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
                    _.each(Projects.data.projects, Projects.unSelectionAllUsers);
                    $scope.goSubView("details");
                } else {
                    $scope.goSubView("wizard");
                }
            });
        };

        $scope.goSubView = function (view) {
            $scope.view = view;
        };

        $scope.listBack = function () {
            if ($scope.data.project) {
                $scope.goSubView("details");
            } else {
                $scope.goSubView("wizard");
            }
        };

        $scope.goWizardNext = function () {
            if ($scope.wizardStep == 1 && $scope.temp.project.name && $scope.temp.project.name.trim() !== "") {
                $scope.wizardStep = 2;
            }

            if ($scope.wizardStep == 2 && $scope.temp.project.users.length) {
                Projects.create($scope.temp.project);
                $scope.goSubView("details");
                Projects.saveState();
                $scope.resetTemp();
                $scope.wizardStep = 1;
            }
        };

        $scope.selectProject = function (project) {
            Projects.select(project);
            Projects.unSelectionAllUsers(project);
            Projects.saveState();
        };

        $scope.selectUser = function (project, user) {
            Projects.selectUser(project, user);
            $rootScope.$emit("user-select", user);
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
            if($scope.view == "wizard" || !$scope.data.project) return;
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

            if(!Projects.data.projects.length) {
                $scope.goSubView("wizard");
            }
        };

        $scope.addUser = function (project, userName) {
            if (!project || !userName) return;
            if (!userName.trim()) return;
            Projects.addUser(project, userName.trim());
            Projects.saveState();
        };

        $scope.removeUser = function (project, user) {
            if (!project || !user) return;
            Projects.removeUser(project, user);
            Projects.saveState();
        };

        $scope.nextSpeaker = function () {
            var index;
            if (!$scope.data.project.users.length) return;
            index = _.findIndex($scope.data.project.users, function (u) {
                return !!u.active
            });
            Projects.selectUser($scope.data.project, $scope.data.project.users[index + 1] ?
                $scope.data.project.users[index + 1] : $scope.data.project.users[0]);
        };

        $rootScope.$on("timer-start", function () {
            $scope.cancelEdit($scope.data.project);
        });

        $rootScope.$on("timer-timeout", function () {
            $scope.nextSpeaker();
            $rootScope.$broadcast("timer-reset");
            $rootScope.$broadcast("timer-start");
        });
    }])

    /* Controller for Settings view */
    .controller("SettingsCtrl", ["$scope", function ($scope) {

    }]);
