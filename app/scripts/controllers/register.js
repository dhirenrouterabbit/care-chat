'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('RegisterCtrl', function ($scope, $location, FirebaseService) {
            $scope.init = function () {
                $scope.user = {
                    name: null,
                    email: null,
                    password: null,
                    admin: false
                };
                console.log(FirebaseService);
            };

            $scope.clear = function () {
                $scope.user.name = null;
                $scope.user.email = null;
                $scope.user.password = null;
                $scope.user.admin = false;
            };

            $scope.submit = function (userDetails) {
                console.log(userDetails);
                var user = {
                    email: userDetails.email,
                    password: userDetails.password
                };
                $scope.showError = false;
                $scope.showSuccess = false;
                FirebaseService.auth.$createUser(user).then(function (userData) {
                    //success
                    FirebaseService.auth.$authWithPassword(user).then(function () {
                        FirebaseService.set("users", userData.uid, {name: userDetails.name, email: userDetails.email, admin: userDetails.admin, sessions:1, online:true});
                        $scope.$emit('$auth:authenticated');
                        $location.path('/dashboard');
                    });
                    //$scope.showSuccess = true;
                    //$scope.successMessage = "User " + user.email + " registered successfully!";
                }).catch(function (error) {
                    //error
                    $scope.showError = true;
                    $scope.errorMessage = error.message;
                });
            };
        });
