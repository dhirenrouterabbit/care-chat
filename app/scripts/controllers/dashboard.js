'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('DashboardCtrl', function ($scope,resolvedProfile) {
            $scope.init = function () {
                $scope.profile = resolvedProfile;
            };
        });
