'use strict';

/**
 * @ngdoc overview
 * @name CareChat
 * @description
 * # CareChat
 *
 * Main module of the application.
 */
angular
        .module('CareChat', [
            'ngAnimate',
            'ngCookies',
            'ngResource',
            'ngRoute',
            'ngSanitize',
            'ngTouch',
            'firebase'
        ])
        .config(function ($routeProvider) {
            $routeProvider
                    .when('/', {
                        name: 'login',
                        templateUrl: 'views/login.html',
                        controller: 'LoginCtrl',
                        controllerAs: 'login'
                    })
                    .when('/register', {
                        name: 'register',
                        templateUrl: 'views/register.html',
                        controller: 'RegisterCtrl',
                        controllerAs: 'register'
                    })
                    .when('/dashboard', {
                        name: 'dashboard',
                        templateUrl: 'views/dashboard.html',
                        controller: 'DashboardCtrl',
                        controllerAs: 'dashboard',
                        resolve: {
                            resolvedProfile: ['FirebaseService', function (FirebaseService) {
                                    var user = FirebaseService.auth.$getAuth();
                                    var $promise = FirebaseService.get('users', user.uid);
                                    return $promise;
                                }]
                        }
                    })
                    .when('/error', {
                        name: 'error',
                        templateUrl: '404.html',
                    })
                    .when('/profile', {
                        name: 'profile',
                        templateUrl: 'views/profile.html',
                        controller: 'ProfileCtrl',
                        controllerAs: 'profile',
                        resolve: {
                            resolvedProfile: ['FirebaseService', function (FirebaseService) {
                                    var user = FirebaseService.auth.$getAuth();
                                    var $promise = FirebaseService.get('users', user.uid);
                                    return $promise;
                                }]
                        }
                    })
                    .when('/chats', {
                        name: 'chats',
                        templateUrl: 'views/chats.html',
                        controller: 'ChatsCtrl',
                        controllerAs: 'chats',
                        resolve: {
                            resolvedUser: ['FirebaseService', function (FirebaseService) {
                                    return FirebaseService.auth.$getAuth();
                                }],
                            resolvedChannels: ['FirebaseService', function (FirebaseService) {
                                    return FirebaseService.query("channels");
                                }],
                            resolvedUsers: ['FirebaseService', function (FirebaseService) {
                                    var $promise = FirebaseService.get('users');
                                    return $promise;
                                }],
                            resolvedProfile: ['FirebaseService', function (FirebaseService) {
                                    var user = FirebaseService.auth.$getAuth();
                                    var $promise;
                                    if(user && user.uid){
                                        $promise = FirebaseService.get('users', user.uid);
                                    }
                                    return $promise;
                                }]
                            
                        }
                    })
                    .otherwise({
                        redirectTo: '/'
                    });
        })
        .run(function ($rootScope, $location, FirebaseService) {
            $rootScope.$on('$routeChangeSuccess', function (event, next) {
                if (next.$$route) {
                    $rootScope.view = next.$$route.name;
                }
            });

            $rootScope.$on('$auth:unauthenticated', function () {
                $rootScope.authenticated = false;
                $location.path('/');
            });

            $rootScope.$on('$auth:authenticated', function () {
                $rootScope.authenticated = true;
            });

            $rootScope.$on('$auth:unauthorized', function () {
                $location.path('/error');
            });
        });
