/**
 * Created by alex on 5/12/16.
 */
(function() {
    angular.module('timeManager')
        .config(timeManagerRouter)
        .controller('LangExController', LangExController);

    timeManagerRouter.$inject= ['$routeProvider', '$locationProvider'];
    function timeManagerRouter($routeProvider, $locationProvider) {
        $routeProvider
            .when('/myCalendar', {
                templateUrl: 'timemanagerclient/myCalendar.html',
                controller: 'CalendarCtrl',
                controllerAs: 'myCalendarCtrl'
            })
            .when('/publishAvailTime', {
                templateUrl: 'timemanagerclient/openAvailTime.html',
                controller: 'OpenAvailTimeCtrl',
                controllerAs: 'openTimeCtrl'
            });

        // configure html5 to get links working on jsfiddle
        $locationProvider.html5Mode(true);
    }

    //Todo: it doesn't show the information
    //Open in plunker:  https://code.angularjs.org/1.5.4/docs/api/ngRoute/service/$route
    //https://code.angularjs.org/1.5.5/docs/api/ngRoute/service/$route
    //https://code.angularjs.org/1.5.7/docs/api/ngRoute/service/$route
    //https://segmentfault.com/q/1010000000605884
    LangExController.$inject =['$scope', '$route', '$routeParams', '$location'];
    function LangExController($scope, $route, $routeParams, $location){
        $scope.route = $route;
        $scope.routeParams = $routeParams;
        $scope.location = $location;
    }
})();