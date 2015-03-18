"use strict";
angular.module("standups.locales", [])

    .value("Langs", {
        en_US: {
            language: "English",
            start: "Start",
            settings: "Settings",
            about: "About"
        }
    })

    .service("Locales", ["Langs", function (Langs) {
        var currentLang = "en_US";
        return {
            setLang: function (lang) {
                currentLang = lang;
            },
            get: function (key) {
                return Langs[currentLang][key] || key;
            }
        }
    }])

    .directive('i18nKey', ["Locales", function (Locales) {
        return function (scope, el, attr) {
            el.html(Locales.get(attr.i18nKey));
        }
    }]);