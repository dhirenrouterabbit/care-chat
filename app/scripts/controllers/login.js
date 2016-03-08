'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('LoginCtrl', function ($scope, $location, $routeParams, FirebaseService) {
            $scope.init = function () {
                $scope.redirectUrl = $routeParams.redirectUrl;
                $scope.user = {
                    email: null,
                    password: null
                };
                console.log(FirebaseService);
            };

            $scope.clear = function () {
                $scope.user.email = null;
                $scope.user.password = null;
            };

            $scope.submit = function (user) {
                //console.log(user);
                FirebaseService.auth.$authWithPassword(user).then(function () {
                    //success
                    console.log("User " + user.email + " logged in successfully!");
                    $scope.createSession();
                    $scope.$emit('$auth:authenticated');
                    if ($scope.redirectUrl) {
                        $location.search('redirectUrl', null);
                        $location.path($scope.redirectUrl);
                    } else {
                        $location.path('/dashboard');
                    }
                }).catch(function (error) {
                    //error
                    $scope.showError = true;
                    $scope.errorMessage = error.message;
                });
            };

            $scope.createSession = function () {
                var auth = FirebaseService.auth.$getAuth();
                FirebaseService.get("users", auth.uid).then(function (user) {
                    if (user.sessions) {
                        user.sessions++;
                    } else {
                        user.sessions = 1;
                    }
                    user.online = true;
                    FirebaseService.update(user);
                });
            };
        });
