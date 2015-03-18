$(function () {
    angular.module('standups', ['ng', 'standups.ctrl', 'standups.directives', 'standups.helpers', 'standups.locales']);
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.cmd == "bootstrap") {
            chrome.extension.sendRequest({ cmd: "read_file", file: "templates/index.html" }, function (html) {
                var extension = document.getElementById('extension-standups');
                if (!extension) {
                    document.body.innerHTML += html;
                    angular.bootstrap(document.getElementById('extension-standups'), ['standups']);
                }
            });
        }
    });
});
