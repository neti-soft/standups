$(function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.cmd == "bootstrap") {
            chrome.extension.sendRequest({ cmd: "read_file", file: "templates/index.html" }, function (html) {
                $("body").append(html);
                angular.module('standups', ['standups.ctrl']);
            });
        }
    });
});