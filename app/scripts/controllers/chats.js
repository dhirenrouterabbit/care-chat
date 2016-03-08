'use strict';

/**
 * @ngdoc function
 * @name CareChat.controller:ChatsCtrl
 * @description
 * # ChatsCtrl
 * Controller of the CareChat
 */
angular.module('CareChat')
        .controller('ChatsCtrl', function ($scope, resolvedUser, resolvedUsers, resolvedProfile, resolvedChannels, FirebaseService, $q) {
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
        });
