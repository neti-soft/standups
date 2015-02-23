'use strict';
angular.module('standups.helpers', [])

    .service('$h', [function () {

        var api = {

            ID_LENGTH: 10,

            ALPHABET: '23456789abdegjkmnpqrvwxyz',

            generateId: function () {
                var rtn = '';
                for (var i = 0; i < this.ID_LENGTH; i++) {
                    rtn += this.ALPHABET.charAt(Math.floor(Math.random() * this.ALPHABET.length));
                }
                return rtn;
            },

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
            },

            removeFromArray: function (array, item, field) {
                var q = {};
                q[field] = item[field];
                var index = _.findIndex(array, q);
                if (index >= 0) {
                    array.splice(index, 1);
                }
                return array;
            }
        };

        ["undefined", "string", "object", "function", "boolean", "number", "null", "array"].forEach(function (type) {
            api["is" + api.capitalise(type)] = function (o) {
                return api.is(o, type);
            }
        });

        return api;
    }]);
