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

}]);

ctrlrs.service('Projects', [function () {

    var projects = [
        {
            id: 1,
            name: "Biologics Registration",
            users: [
                {name: "Max", active: true},
                {name: "Krzysiek"},
                {name: "Szymon"},
                {name: "Pawel"},
                {name: "Marcin"},
                {name: "Piotr"},
                {name: "Adam"}
            ]
        },
        {
            id: 2,
            name: "IMS",
            users: [
                {name: "Kamil"},
                {name: "Richard"},
                {name: "Jarek"},
                {name: "Maciej"},
                {name: "Max"},
                {name: "Radek"}

            ]
        },
        {
            id: 3,
            name: "Patient Check",
            users: [
                {name: "Karol"},
                {name: "Slawek"},
                {name: "Max"}
            ]
        }
    ];

    var activeProject = projects[0];

    return {

        getActive: function () {
            return activeProject;
        },

        add: function (projectName) {
            projects.push({
                id: Math.max.apply(null, projects.map(function(p) { return p.id })) + 1,
                name: projectName,
                users: []
            })
        },

        setActive: function (project) {
            activeProject = project;
        },

        toggleEdit: function (project) {
            project.isEdited = !project.isEdited;
        },

        remove: function(project) {
            var index = projects.indexOf(function(p) {
                return project.id === p.id;
            });
            projects.splice(index, 1);
        },

        getList: function () {
            return projects;
        }
    }
}]);

/* Controller for projects view */
ctrlrs.controller('ProjectCtrl', ["$scope", "Projects", function ($scope, Projects) {

    //subview
    $scope.view = null;
    $scope.temp = {};

    $scope.init = function () {
        $scope.details($scope.project);
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
            Projects.add(projectName);
            $scope.temp.projectName = "";
        }
    };

    $scope.details = function () {
        $scope.view = "details";
    };

    $scope.addUser = function (userName) {
        userName = userName.trim();
        if (userName) {
            Projects.getActive().users.push({name: userName});
            $scope.temp.userName = "";
        }
    };

    $scope.removeUser = function ($index) {
        Projects.getActive().users.splice($index, 1);
    };

    $scope.removeProject = function (project) {
        Projects.remove(project);
    };

    $scope.save = function () {
        Projects.getActive().isEdited = false;
    };

    $scope.list = function () {
        $scope.view = "list";
    };



    $scope.toggleEdit = function (project) {
        if(project) {
            Projects.setActive(project);
        }
        Projects.toggleEdit(Projects.getActive());
        $scope.view = "details";
    };

}]);

/* Controller for Settings view */
ctrlrs.controller('SettingsCtrl', ["$scope", function ($scope) {

}]);
