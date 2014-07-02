angular.module('standups.helpers', []);

angular.module('standups.helpers').service("Helpers", function () {
    return {
        requestFullScreen: function (elSelector) {
            var elem = document.querySelector(elSelector);
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        }
    }
});