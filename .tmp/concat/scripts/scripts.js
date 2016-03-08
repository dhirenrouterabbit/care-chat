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
        .config(["$routeProvider", function ($routeProvider) {
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
        }])
        .run(["$rootScope", "$location", "FirebaseService", function ($rootScope, $location, FirebaseService) {
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
        }]);

'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('LoginCtrl', ["$scope", "$location", "$routeParams", "FirebaseService", function ($scope, $location, $routeParams, FirebaseService) {
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
        }]);

'use strict';

/**
 * @ngdoc service
 * @name CareChat.FirebaseService
 * @description
 * # FirebaseService
 * Factory in the CareChat.
 */
angular.module('CareChat')
        .factory('FirebaseService', ["$q", "$firebaseAuth", "$firebaseObject", "$firebaseArray", function ($q, $firebaseAuth, $firebaseObject,$firebaseArray) {
            // Service logic
            // ...
            var APP_URL = 'https://care-chat.firebaseio.com/';
            var APP_REF = new Firebase(APP_URL);
            var APP_AUTH = $firebaseAuth(APP_REF);
            var SCHEMA_REF = function (SCHEMA) {
                return APP_REF.child(SCHEMA);
            };
            
            var SCHEMA_OBJ = function (SCHEMA,UID) {
                if(SCHEMA && UID){
                    return new Firebase(APP_URL + '/' + SCHEMA + '/' + UID);
                }else if(SCHEMA && !UID){
                    return new Firebase(APP_URL + '/' + SCHEMA);
                }else{
                    return new Firebase(APP_URL);
                }
            };

            var service = {
                url: APP_URL,
                ref: APP_REF,
                auth: APP_AUTH,
                set: function (SCHEMA, UID, RECORD) {
                    var $promise = $q(function(resolve,reject){
                        SCHEMA_REF(SCHEMA).child(UID).set(RECORD).then(function(){
                            //success
                            resolve();
                        },function(error){
                            //error
                            reject(error);
                        });
                    });
                    
                    return $promise;
                },
                query: function (SCHEMA,UID) {
                    var $promise = $q(function (resolve, reject) {
                        $firebaseArray(SCHEMA_OBJ(SCHEMA,UID)).$loaded(function ($db) {
                            //success
                            resolve($db);
                        }, function (error) {
                            //error
                            reject(error);
                        });
                    });

                    return $promise;
                },
                get: function (SCHEMA, UID) {
                    var $promise = $q(function (resolve, reject) {
                        $firebaseObject(SCHEMA_OBJ(SCHEMA,UID)).$loaded(function ($db) {
                            //success
                            resolve($db);
                        }, function (error) {
                            //error
                            reject(error);
                        });
                    });

                    return $promise;
                },
                update:function(RECORD){
                    var $promise = $q(function (resolve, reject) {
                        RECORD.$save().then(function(ref){
                            resolve(ref.key() === RECORD.$id);
                        },reject);
                    });
                    
                    return $promise;
                },
                add:function(SCHEMA,RECORD){
                    var $promise = $q(function (resolve, reject) {
                    SCHEMA.$add(RECORD).then(function(ref){
                            resolve();
                        },reject);
                    });
                    
                    return $promise;
                }
            };

            return service;
        }]);



'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('RegisterCtrl', ["$scope", "$location", "FirebaseService", function ($scope, $location, FirebaseService) {
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
        }]);

'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('DashboardCtrl', ["$scope", "resolvedProfile", function ($scope,resolvedProfile) {
            $scope.init = function () {
                $scope.profile = resolvedProfile;
            };
        }]);

'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('MainCtrl', ["$scope", "FirebaseService", "$location", function ($scope, FirebaseService, $location) {
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
        }]);

'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('ProfileCtrl', ["$scope", "$window", "$anchorScroll", "resolvedProfile", "FirebaseService", function ($scope, $window,$anchorScroll, resolvedProfile,FirebaseService) {
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

        }]);

'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:ChatsCtrl
 * @description
 * # ChatsCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('ChatsCtrl', ["$scope", "resolvedUser", "resolvedUsers", "resolvedProfile", "resolvedChannels", "FirebaseService", "$q", function ($scope, resolvedUser, resolvedUsers, resolvedProfile, resolvedChannels, FirebaseService, $q) {
            $scope.init = function () {
                $scope.user = resolvedUser;
                $scope.profile = resolvedProfile;
                $scope.channels = resolvedChannels;
                console.log(resolvedChannels);
                $scope.senders = [];
                $scope.users = resolvedUsers;
                FirebaseService.query("users").then(function (users) {
                    var senders = [];
                    console.log(users);
                    angular.forEach(users, function (user) {
                        if ($scope.user.uid !== user.$id && ($scope.profile.admin || user.admin)) {
                            var sender = {
                                uid: user.$id,
                                name: user.name,
                                admin: user.admin,
                                chats: [],
                                unread: 0,
                                online: user.online,
                                inbox: false
                            };
                            $scope.getChannelId($scope.user.uid, sender.uid).then(function (cid) {
                                //success
                                var $promise = FirebaseService.query('chats', cid);
                                $promise.then(function (chats) {
                                    sender.chats = chats;
                                    $scope.countUnread(sender);
                                    sender.chats.$watch(function () {
                                        $scope.countUnread(sender);
                                    });
                                    senders.push(sender);
                                });
                            }, function () {
                                //error
                                console.log('Error');
                            });
                        }
                    });
                    $scope.senders = senders;
                });
            };

            $scope.countUnread = function (sender) {
                if (!sender.inbox) {
                    sender.unread = 0;
                    angular.forEach(sender.chats, function (chat) {
                        if (chat.sid === sender.uid && !chat.read) {
                            //received chats
                            sender.unread++;
                        }
                    });
                }
            };

            $scope.chatBox = function (sender) {
                sender.inbox = !sender.inbox;
                if (sender.inbox) {
                    angular.forEach($scope.senders, function (user) {
                        if(user.uid !== sender.uid){
                            user.inbox = false;
                        }
                    });
                    sender.unread = 0;
                    angular.forEach(sender.chats, function (chat) {
                        if (chat.sid === sender.uid && !chat.read) {
                            chat.read = true;
                            sender.chats.$save(chat);
                        }
                    });
                }
            };

            $scope.getChannelId = function (uid, sid) {
                var $promise = $q(function (resolve, reject) {
                    var cid;
                    for (var i = 0; i < $scope.channels.length; i++) {
                        if ($scope.channels[i].$value.indexOf(uid) !== -1 && $scope.channels[i].$value.indexOf(sid) !== -1) {
                            cid = $scope.channels[i].$id;
                            break;
                        }
                    }
                    if (!cid) {
                        $scope.channels.$add(uid + ',' + sid).then(function (ref) {
                            cid = ref.key();
                            resolve(cid);
                        });
                    } else {
                        resolve(cid);
                    }
                });
                return $promise;
            };
            
            $scope.sendWithEnter = function($event,sender,uid){
                if($event.keyCode !== 13) return;
                $scope.send(sender,uid);
            };

            $scope.send = function (sender, uid) {
                var chat = {
                    msg: sender.reply,
                    sid: uid,
                    read: false
                };

                console.log(sender.chats);
                console.log(chat);

                FirebaseService.add(sender.chats, chat).then(function () {
                    //success
                    console.log('Sent');
                    sender.reply = null;
                }, function () {
                    //error
                    console.log('Failed');
                });
                console.log(chat);
            };

            $scope.clear = function (sender) {
                sender.reply = null;
            };
        }]);

'use strict';

/**
 * @ngdoc directive
 * @name CareChat.directive:autofocus
 * @description
 * # autofocus
 */
angular.module('CareChat')
        .directive('autofocus', ["$timeout", function ($timeout) {
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
        }]);
angular.module('CareChat').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/chats.html',
    "<div class=\"main\" ng-init=\"init()\"> <div class=\"chats\"> <div class=\"btn-group\" ng-show=\"profile.admin\"><button type=\"button\" class=\"btn\" ng-class=\"{'btn-primary':sort==undefined,'btn-default':sort!==undefined}\" ng-click=\"sort=undefined\">All</button><button type=\"button\" class=\"btn\" ng-class=\"{'btn-primary':sort===true,'btn-default':sort!==true}\" ng-click=\"sort=true\">Administrators</button><button type=\"button\" class=\"btn\" ng-class=\"{'btn-primary':sort===false,'btn-default':sort!==false}\" ng-click=\"sort=false\">Users</button></div> <ul class=\"list-group chat-list margin-top-15\"> <li class=\"list-group-item chat-item\" ng-repeat=\"sender in senders | filter:{admin:sort} | orderBy:'name'\"> <div class=\"chat-header\" ng-click=\"chatBox(sender)\"><label>{{sender.name}}</label><div class=\"status\" ng-class=\"{'online':users[sender.uid].online,'offline':!users[sender.uid].online}\"></div><span class=\"pull-right badge\" ng-show=\"sender.unread\">{{sender.unread}}</span></div> <div class=\"chat-body collapse\" ng-class=\"{'in':sender.inbox}\"> <div class=\"chat-messages margin-top-15 margin-bottom-20\"> <ul class=\"list-group\"> <li class=\"list-group-item\" ng-class=\"{'user':chat.sid === user.uid,'sender':chat.sid !== user.uid}\" ng-repeat=\"chat in sender.chats\">{{chat.msg}}</li> </ul> </div> <div class=\"chat-input\"> <form class=\"form\" name=\"ChatForm\"> <div class=\"form-group\"> <input type=\"text\" name=\"InputMessage\" ng-model=\"sender.reply\" ng-keypress=\"sendWithEnter($event,sender,user.uid)\" autofocus class=\"form-control\"> </div> <div class=\"form-group\"> <div class=\"text-right\"> <button type=\"button\" ng-click=\"clear(sender)\" class=\"btn btn-default margin-right-10\">Clear</button> <button type=\"button\" ng-click=\"send(sender,user.uid)\" class=\"btn btn-success\">Reply</button> </div> </div> </form> </div> </div> </li> </ul> </div> </div>"
  );


  $templateCache.put('views/dashboard.html',
    "<div ng-init=\"init()\"> Welcome, <b>{{profile.name}}</b> <br> This is a demo chat app based on angular and firebase. <br> You logged in as <b>{{profile.admin?'Administrator':'User'}}</b>. <br> Please go to chats section of this app to enjoy chatting experience. <br> <b>Note:</b> Users can't chat with each other. </div>"
  );


  $templateCache.put('views/login.html',
    "<div class=\"main\" ng-init=\"init()\"> <form class=\"form\" name=\"loginForm\" ng-submit=\"submit(user)\"> <div class=\"form-group alert alert-danger\" ng-show=\"showError\"> <label class=\"\">{{errorMessage}}</label> <span ng-click=\"showError = false\" class=\"close\">X</span> </div> <div class=\"form-group\"> <label class=\"control-label\">Email</label> <div class=\"input-group\"> <input type=\"text\" class=\"form-control\" ng-model=\"user.email\"> <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span> </div> <br> <label class=\"control-label\">Password</label> <div class=\"input-group\"> <input type=\"password\" class=\"form-control\" ng-model=\"user.password\"> <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-lock\"></i></span> </div> <br> <div class=\"row\"> <div class=\"col-xs-12 col-sm-6 col-md-6 col-lg-6\"> <button type=\"submit\" name=\"submit\" class=\"form-control btn btn-primary\">Login</button> </div> <div class=\"col-xs-12 hidden-sm hidden-md hidden-lg\"> <br> </div> <div class=\"col-xs-12 col-sm-6 col-md-6 col-lg-6\"> <button type=\"button\" name=\"submit\" class=\"form-control btn btn-default\" ng-click=\"clear()\">Clear</button> </div> </div> <br> <div class=\"form-group\"> <label class=\"\">Need an account? &nbsp;<a href=\"#/register\">Register here</a></label> </div> </div> </form> </div>"
  );


  $templateCache.put('views/profile.html',
    "<div class=\"main margin-bottom-40\" ng-init=\"init()\"> <h3>Profile Settings</h3> <form name=\"ProfileForm\" class=\"form\" ng-submit=\"save()\"> <div class=\"form-group alert alert-danger\" ng-show=\"showError\"> <label class=\"\">{{errorMessage}}</label> <span ng-click=\"showError = false\" class=\"close\">X</span> </div> <div class=\"form-group alert alert-success\" ng-show=\"showSuccess\"> <label class=\"\">{{successMessage}}</label> <span ng-click=\"showSuccess = false\" class=\"close\">X</span> </div> <hr> <h5 class=\"text-muted\">Personal Information</h5> <div class=\"form-group\"> <label class=\"control-label\">Name</label> <input type=\"text\" ng-model=\"profile.name\" class=\"form-control\" name=\"Name\"> </div> <div class=\"form-group\"> <label class=\"control-label\">Age</label> <input type=\"text\" ng-model=\"profile.age\" class=\"form-control\" name=\"Age\"> </div> <div class=\"form-group\"> <label class=\"control-label\">Mobile</label> <input type=\"text\" ng-model=\"profile.mobile\" maxlength=\"10\" class=\"form-control\" name=\"Mobile\"> </div> <div class=\"form-group\"> <label class=\"control-label\">Email</label> <input type=\"text\" ng-model=\"profile.email\" disabled class=\"form-control\" name=\"Email\"> </div> <hr> <h5 class=\"text-muted\">Address Information</h5> <div class=\"form-group\"> <label class=\"control-label\">Line 1</label> <input type=\"text\" ng-model=\"profile.address.line1\" class=\"form-control\" name=\"Line1\"> </div> <div class=\"form-group\"> <label class=\"control-label\">Line 2</label> <input type=\"text\" ng-model=\"profile.address.line2\" class=\"form-control\" name=\"Line2\"> </div> <div class=\"form-group\"> <label class=\"control-label\">City</label> <input type=\"text\" ng-model=\"profile.address.city\" class=\"form-control\" name=\"City\"> </div> <div class=\"form-group\"> <label class=\"control-label\">State</label> <input type=\"text\" ng-model=\"profile.address.state\" class=\"form-control\" name=\"State\"> </div> <div class=\"form-group\"> <div class=\"pull-right\"> <div class=\"input-group\"> <button type=\"button\" name=\"Cancel\" ng-click=\"cancel()\" class=\"btn btn-default margin-right-10\">Cancel</button> <button type=\"submit\" name=\"Submit\" class=\"btn btn-success\">Save</button> </div> </div> </div> <br> </form> </div>"
  );


  $templateCache.put('views/register.html',
    "<div class=\"main\" ng-init=\"init()\"> <form class=\"form\" name=\"registerForm\" ng-submit=\"submit(user)\"> <div class=\"form-group alert alert-danger\" ng-show=\"showError\"> <label class=\"\">{{errorMessage}}</label> <span ng-click=\"showError = false\" class=\"close\">X</span> </div> <div class=\"form-group alert alert-success\" ng-show=\"showSuccess\"> <label class=\"\">{{successMessage}}</label> <span ng-click=\"showSuccess = false\" class=\"close\">X</span> </div> <div class=\"form-group\"> <label class=\"control-label\">Name</label> <div class=\"input-group\"> <input type=\"text\" class=\"form-control\" ng-model=\"user.name\"> <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span> </div> <br> <label class=\"control-label\">Email</label> <div class=\"input-group\"> <input type=\"text\" class=\"form-control\" ng-model=\"user.email\"> <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-inbox\"></i></span> </div> <br> <label class=\"control-label\">Password</label> <div class=\"input-group\"> <input type=\"password\" class=\"form-control\" ng-model=\"user.password\"> <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-lock\"></i></span> </div> <br> <label class=\"control-label\">Register as</label> <div class=\"input-group\"> <span class=\"radio-span\" ng-click=\"user.admin=true\"><input type=\"radio\" class=\"radio-inline role-radio\" ng-checked=\"user.admin\">Admin</span>&nbsp;&nbsp;&nbsp; <span class=\"radio-span\" ng-click=\"user.admin=false\"><input type=\"radio\" class=\"radio-inline role-radio\" ng-checked=\"!user.admin\">User</span> </div> <label class=\"margin-top-15 small text-info\" ng-show=\"!user.admin\">Note: User can't chat with each other.</label> <label class=\"margin-top-15 small text-info\" ng-show=\"user.admin\">Note: Admin will have all privileges, can chat with other admins as well as users.</label> <br> <br> <div class=\"row\"> <div class=\"col-xs-12 col-sm-6 col-md-6 col-lg-6\"> <button type=\"submit\" name=\"submit\" class=\"form-control btn btn-primary\">Register</button> </div> <div class=\"col-xs-12 hidden-sm hidden-md hidden-lg\"> <br> </div> <div class=\"col-xs-12 col-sm-6 col-md-6 col-lg-6\"> <button type=\"button\" name=\"submit\" class=\"form-control btn btn-default\" ng-click=\"clear()\">Clear</button> </div> </div> <br> <div class=\"form-group\"> <label class=\"\">Already have an account? &nbsp;<a href=\"#/\">Login here</a></label> </div> </div> </form> </div>"
  );

}]);
