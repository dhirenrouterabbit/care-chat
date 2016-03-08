'use strict';

/**
 * @ngdoc service
 * @name CareChat.FirebaseService
 * @description
 * # FirebaseService
 * Factory in the CareChat.
 */
angular.module('CareChat')
        .factory('FirebaseService', function ($q, $firebaseAuth, $firebaseObject,$firebaseArray) {
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
        });


