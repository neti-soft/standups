'use strict';
angular.module('standups.helpers', [])

    .service('$h', [function () {

        var api = {

            capitalise: function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            },

            is: function (o, type) {
                type = String(type).toLowerCase();
                return (type == "null" && o === null) ||
                    (type == typeof o) ||
                    (type == "object" && o === Object(o)) ||
                    (type == "array" && Array.isArray && Array.isArray(o)) ||
                    Object.prototype.toString.call(o).slice(8, -1).toLowerCase() == type;
            }
        };

        ["undefined", "string", "object", "function", "boolean", "number", "null", "array"].forEach(function (type) {
            api["is" + api.capitalise(type)] = function (o) {
                return api.is(o, type);
            }
        });

        return api;
    }]);
