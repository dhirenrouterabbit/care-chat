'use strict';

/**
 * @ngdoc directive
 * @name CareChat.directive:autofocus
 * @description
 * # autofocus
 */
angular.module('CareChat')
        .directive('autofocus', function ($timeout) {
            return {
                restrict: 'A',
                link: function postLink(scope, element, attrs) {
                    scope.$watch(attrs.autofocus, function (doFocus, earlier) {
                        if (doFocus && doFocus !== earlier) {
                            $timeout(function () {
                                element.focus();
                            },20);
                        }
                    });
                }
            };
        });