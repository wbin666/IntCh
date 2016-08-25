/**
 * Created by alex on 8/23/16.
 */
(function() {
    angular.module('langExApp', ['ngRoute', 'timeManager', 'PassportApp'])
        .config(defaultRouter);

    defaultRouter.$inject= ['$routeProvider', '$locationProvider'];
    function defaultRouter($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './home.html',
            })
            .otherwise({
                redirectTo: '/'
            });

        // configure html5 to get links working on jsfiddle
        $locationProvider.html5Mode(true);
    }
})();