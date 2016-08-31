/**
 * Created by alex on 8/26/16.
 */
(function() {
    angular.module('booking')
        .factory('bookingDataClient', bookingDataClient);

    bookingDataClient.inject = ['$http', '$location'];
    function bookingDataClient($http, $location) {
        return {
            queryAvailTime: queryAvailTime
        };

        function queryAvailTime(queryCriteria) {
            console.log("starting to query the available time for booking.");
            console.log("query criteria is :" + JSON.stringify(queryCriteria));

            return $http.get('/api/booking/availTime', queryCriteria )
                .then(function (response) {
                    console.log("Query the available time successfully ! " + JSON.stringify(response));
                    return response.data;
                })
                .catch(function (response) {
                    console.log("Error occurred while querying the available time! and the detail error is : " + JSON.stringify(response));
                });
        }
    }
    
})();