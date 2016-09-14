/**
 * Created by alex on 9/3/16.
 */
(function(){
    'use strict';
    angular.module('booking')
        .controller('bookedSessionDetailCtrl', bookedSessionDetailCtrl);

    bookedSessionDetailCtrl.$inject = ['$routeParams', 'bookingDataClient', '$location'];
    function bookedSessionDetailCtrl($routeParams, bookingDataClient, location){
        var vm = this;

        console.log("$routeParams in bookedSessionDetailCtrl is : " + JSON.stringify($routeParams));
        if(angular.isDefined($routeParams.idFromCalendar)){   // the request is from the event of MyCalendar
            bookingDataClient.getBookedSessionById($routeParams.idFromCalendar)
                .then(function(data){
                    vm.bookedRecord = data;
                });
        }else {                                     //the request is from booking completion
            vm.bookedRecord = $routeParams.params;
            console.log("the booked record in bookedSessionDetailCtrl is : " + JSON.stringify(vm.bookedRecord));
        }
        
        vm.cancel = cancelBookedSession;
        
        function cancelBookedSession(){
            bookingDataClient.cancelBookedSessionById(vm.bookedRecord._id)
                .then(function(){
                    $location.url('/myCalendar').search('gotoDate', moment(vm.bookedRecord.timeStart).format('yyyy-mm-dd'));
                })
        }
    }
})();