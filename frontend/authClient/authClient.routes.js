(function() {
    'use strict';

    angular.module('PassportApp', ['ngRoute', 'ngFlash', 'ngAutodisable'])
        .config(angularLoginRouteProvider);

    angularLoginRouteProvider.$inject = ['$routeProvider', '$locationProvider'];
    function angularLoginRouteProvider($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'home.html'
            })
            .when('/forgot',{
                templateUrl: 'authClient/forgot.html',
                controller: 'ForgotCtrl',
                controllerAs: 'forgotVm'
            })
            .when('/login', {
                templateUrl: 'authClient/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'loginVm'
            })
            .when('/profile', {
                templateUrl: 'authClient/profile.html',
                resolve: {
                    logincheck: checkLoggedin
                }
            })
            .when('/reset/:token', {
                templateUrl: 'authClient/reset.html',
                controller: 'ResetCtrl',
                controllerAs: 'resetVm'
            })
            .when('/signup', {
                templateUrl: 'authClient/signup.html',
                controller: 'SignUpCtrl',
                controllerAs: 'signupVm'
            })
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);

    }


    // checkLoggedin.$inject = ['$q', '$timeout', '$http', '$location', '$rootScope'];
    // function checkLoggedin($q, $timeout, $http, $location, $rootScope) {
    //     var deferred = $q.defer();
    //
    //     $http.get('/loggedin').success(function (user) {
    //         $rootScope.errorMessage = null;
    //         //User is Authenticated
    //         if (user !== '0') {
    //             $rootScope.currentUser = user;
    //             deferred.resolve();
    //         } else { //User is not Authenticated
    //             $rootScope.errorMessage = 'You need to log in.';
    //             deferred.reject();
    //             $location.url('/login');
    //         }
    //     });
    //     return deferred.promise;
    // }

    checkLoggedin.$inject = ['$q', 'userService', '$location', '$rootScope', 'Flash'];
    function checkLoggedin($q, userService, $location, $rootScope, Flash) {
        // var deferred = $q.defer();
        //
        // userService.loggedinCheck()
        //     .then(loggedinCheckSuccessCb);
        //
        // return deferred.promise;
        //
        // function loggedinCheckSuccessCb(response) {
        //     //$rootScope.errorMessage = null;
        //     //User is Authenticated
        //     if (response.data !== '0') {
        //         $rootScope.currentUser = response.data;
        //         deferred.resolve();
        //     } else { //User is not Authenticated
        //         //$rootScope.errorMessage = 'You need to log in.';
        //         Flash.create("danger", 'You need to log in.');
        //         deferred.reject();
        //         $location.url('/login');
        //     }
        // }


        var newPromise = $q(function newPromiseCb4CheckLoggedin(resolve, reject){
            userService.loggedinCheck()
                .then(loggedinCheckSuccessCb);

            function loggedinCheckSuccessCb(response) {
                //$rootScope.errorMessage = null;
                //User is Authenticated
                if (response.data !== '0') {
                    $rootScope.currentUser = response.data;
                    resolve('You have logged in');
                } else { //User is not Authenticated
                    //$rootScope.errorMessage = 'You need to log in.';
                    Flash.create("danger", 'You need to log in.');
                    reject('You need to log in.');
                    $location.url('/login');
                }
            }
        });

        return newPromise;
    }
    
})();