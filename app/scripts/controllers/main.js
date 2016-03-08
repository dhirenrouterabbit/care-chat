'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('MainCtrl', function ($scope, FirebaseService, $location) {
            $scope.$on('$locationChangeSuccess', function () {
                var user = FirebaseService.auth.$getAuth();
                if (user && user.uid) {
                    $scope.profileEmail = user.password.email;
                    $scope.profileImage = user.password.profileImageURL;
                    var $promise = FirebaseService.get('users', user.uid);
                    $promise.then(function(profile){
                        //success
                        if(profile){
                            $scope.profileName = profile.name;
                        }else{
                            $scope.profileName = null;
                        }
                    },function(error){
                        //error
                        console.log(error.message);
                    });
                    $scope.$emit('$auth:authenticated');
                    if($location.path() === '/'){
                        $location.path('/dashboard');
                    }
                }
            });
            
            $scope.destroySession = function () {
                var auth = FirebaseService.auth.$getAuth();
                FirebaseService.get("users",auth.uid).then(function(user){
                    user.sessions--;
                    if(!user.sessions){
                        user.sessions = 0;
                        user.online = false;
                    }
                    user.$save();
                    FirebaseService.auth.$unauth();
                });
            };

            $scope.logout = function () {
                $scope.destroySession();
                $scope.$emit('$auth:unauthenticated');
            };
        });
