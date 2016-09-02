/**
 * Created by alex on 8/23/16.
 */
(function() {
    angular.module('langExApp', ['ngRoute', 'ui.bootstrap', 'timeManager', 'PassportApp', 'booking'])
        .config(defaultRouter);

    defaultRouter.$inject= ['$routeProvider', '$locationProvider'];
    function defaultRouter($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './home.html'
            })
            .otherwise({
                redirectTo: '/'
            });

        // configure html5 to get links working on jsfiddle
        $locationProvider.html5Mode(true);
    }

    angular.module('langExApp').service('loginModalService', ['$modal', '$rootScope',function ($modal, $rootScope) {

        function assignCurrentUser(user) {
            $rootScope.currentUser = user;
            return user;
        }

        return function () {
            var instance = $modal.open({
                templateUrl: 'loginModalTemplate.html',
                controller: 'LoginModalCtrl',
                controllerAs: 'LoginModalCtrl',
                windowClass: 'vertical-center',
                backdrop: true,
                backdrop: 'static',
                sticky: true
            });

            return instance.result.then(assignCurrentUser);
        };

    }]);

//UsersAPI is service to validate on server
    angular.module('langExApp').controller('LoginModalCtrl', ['$scope', 'loginModalService', function ($scope, loginModalService) {

        this.cancel = $scope.$dismiss;
        $scope.showModal = function () {
            loginModalService()
                .then(function () {
                    alert("OK Selected ");
                    //return $state.go(toState.name, toParams);
                })
                .catch(function () {
                    console.log("User Cancelled Login hence Navigation Cancelled ");
                    //return $state.go('home');
                });
        };
        this.submit = function (email, password) {
            //  UsersApi.login(email, password).then(function (user) {
            //      $scope.$close(user);
            //  });
            $scope.$close("abc");
        };

    }]);

})();