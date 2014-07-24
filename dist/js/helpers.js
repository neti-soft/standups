var helpers = angular.module('standups.helpers', []);

helpers.service("Screen", function () {

    var extensionEl = $('#extension-standups');

    $.fn.scrollStopped = function (callback) {
        $(this).scroll(function () {
            var self = this, $this = $(self);
            if ($this.data('scrollTimeout')) {
                clearTimeout($this.data('scrollTimeout'));
            }
            $this.data('scrollTimeout', setTimeout(callback, 250, self));
        });
    };

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
        },

        scroll: function (cb) {
            $(document).scroll(cb.bind(document, extensionEl));
        },

        scrollStopped: function (cb) {
            $(document).scrollStopped(cb.bind(document, extensionEl))
        }
    }
});
