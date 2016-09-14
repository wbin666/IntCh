/**
 * Created by alex on 8/26/16.
 */
(function() {
    angular.module('booking')
        .factory('bookingDataClient', bookingDataClient);

    bookingDataClient.inject = ['$http', '$location', '$q'];
    function bookingDataClient($http, $location, $q) {
        return {
            cancelBookedSessionById: cancelBookedSessionById,
            getBookedSessionById: getBookedSessionById,
            toBookRecord: toBookRecord,
            queryAvailTimeByPage: queryAvailTimeByPage
        };

        function cancelBookedSessionById(_id){
            return $http.patch('/api/bookedSession/cancel/' + _id)
                .then(function(response){
                    console.log('The response.data of cancelling a booked session is : ' + JSON.stringify(response.data));
                    return $q.resolve("Cancelled a booked session successfully");
                })
                .catch(function(errResponse){
                    console.log('Error found when cancelling the booked session : ' + errResponse.message);
                    return $q.reject(errResponse);
                })
        }

        function getBookedSessionById(_id){
            return $http.get('/api/bookedSession/' + _id)
                .then(function(response){
                    console.log('The booked session detail is response.data : ' + JSON.stringify(response.data));
                    return response.data;
                })
                .catch(function(errResponse){
                    console.log('Failed to get the booked session detail : ' + errResponse.message);
                    return $q.reject(errResponse);
                })
        }

        function toBookRecord(confirmedRecord, studentName, reqExactTimeStart, reqExactTimeEnd){
            console.log('Student %s is starting to book from %s to %s with the record : ' + JSON.stringify(confirmedRecord), studentName, reqExactTimeStart, reqExactTimeEnd);
            var postData = {
                recordId: confirmedRecord._id,
                recordTimeStart: confirmedRecord.timeStart,
                recordTimeEnd: confirmedRecord.timeEnd,
                studentName: studentName,
                reqExactTimeStart: reqExactTimeStart,
                reqExactTimeEnd: reqExactTimeEnd
            };

            return $http.post('/api/booking/availTime', postData)
                .then(function(response){
                    return response;
                })
                .catch(function(errResponse){
                    return $q.reject(errResponse);
                });
        }
        
        function queryAvailTimeByPage(queryCriteria) {
            console.log("starting to query the available time for booking.");
            console.log("query params is :" + JSON.stringify(queryCriteria));

            return $http.get('/api/booking/list/page/', {params: queryCriteria})
                .then(function (response) {
                    console.log("Query the available time successfully ! " + JSON.stringify(response));
                    return response.data;
                })
                .catch(function (response) {
                    console.log("Error occurred while querying the available time! and the detail error is : " + JSON.stringify(response));
                });
        }

        // function queryAvailTime(queryParams) {
        //     console.log("starting to query the available time for booking.");
        //     console.log("query params is :" + JSON.stringify(queryParams));
        //
        //     return $http.get('/api/booking/availTime', queryParams)
        //         .then(function (response) {
        //             console.log("Query the available time successfully ! " + JSON.stringify(response));
        //             return response.data;
        //         })
        //         .catch(function (response) {
        //             console.log("Error occurred while querying the available time! and the detail error is : " + JSON.stringify(response));
        //         });
        // }
    }
    
})();