'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('ProfileCtrl', function ($scope, $window,$anchorScroll, resolvedProfile,FirebaseService) {
            $scope.init = function () {
                $scope.user = FirebaseService.auth.$getAuth();
                if($scope.user){
                    $scope.profile = resolvedProfile;
                    $scope.profile.email = $scope.user.password.email;
                    $scope.$emit('$auth:authenticated');
                }
            };

            $scope.save = function () {
                $scope.showSuccess = false;
                $scope.showError = false;
                $anchorScroll();
                FirebaseService.update($scope.profile).then(function(status){
                    //success
                    if(status){
                        $scope.showSuccess = true;
                        $scope.successMessage = 'Profile updated successfully.';
                    }else{
                        $scope.showError = true;
                        $scope.errorMessage = 'Error updating profile.';
                    }
                },function(error){
                    //error
                    $scope.showError = true;
                    $scope.errorMessage = error.message;
                });
            };

            $scope.cancel = function () {
                $window.history.back();
            };

        });
