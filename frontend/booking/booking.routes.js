/**
 * Created by alex on 8/26/16.
 */
(function() {
    angular.module('booking')
        .config(bookingRouter);

    bookingRouter.$inject= ['$routeProvider', '$locationProvider'];
    function bookingRouter($routeProvider, $locationProvider) {
        $routeProvider
            .when('/queryAvailTime', {
                templateUrl: 'booking/queryAvailTime.html',
                controller: 'QueryAvailTimeCtrl',
                controllerAs: 'queryAvailTimeVm'
            })
            .when('/availTimeCandidates', {
                templateUrl: 'booking/availTimeList.html',
                controller: 'AvailTimeCandidateCtrl',
                controllerAs: 'availTimeCandidatesVm',
                resolve: {
                    firstPageData: getAvailTimeForBooking
                }
            })
            .when('/bookedSessionDetail', {
                templateUrl: 'booking/bookedSessionDetail.html'
            });

        // configure html5 to get links working on jsfiddle
        $locationProvider.html5Mode(true);

    }

    ////////////////////////////////////////////////////////
    //Todo:  how to get data for first page only instead of all the data
    getAvailTimeForBooking.$inject = ['$route', 'bookingDataClient'];
    function getAvailTimeForBooking($route, bookingDataClient){
        console.log("$route.current.params is : " + JSON.stringify($route.current.params));

        return bookingDataClient.queryAvailTime($route.current.params);
    }

    
})();