/**
 * Created by alex on 8/26/16.
 */
(function() {
    'use strict';
    
    angular.module('booking')
        .controller('QueryAvailTimeCtrl', QueryAvailTimeCtrl);

    QueryAvailTimeCtrl.$inject = ['$location', 'bookingDataClient'];
    function QueryAvailTimeCtrl($location, bookingDataClient) {
        var vm = this;

        var tempDate = new Date();
        tempDate.setDate(tempDate.getDate() + 2);
        vm.dateModel = tempDate;
        vm.dateLabel = "Date";

        vm.earliestStartTimeLabel = "Earliest Start time";
        vm.earliestStartTimeModel = "09:00";
        vm.latestEndTimeLabel = "Latest End time";
        vm.latestEndTimeModel = "11:00";

        vm.unitNumber=1;

        vm.queryTime = function queryTime(){
            //return bookingDataClient.queryAvailTime(dataFilter4Submit(vm));
            //$location.url('/availTimeCandidates').search({params: dataFilter4Submit(vm)});
            console.log("start to search the time slot .... ")
            $location.url('/availTimeCandidates').search({params: dataFilter4Submit(vm)});
        };

        function dataFilter4Submit(vm){
            return {
                date: vm.dateModel.toISOString().substring(0, 10),
                earlistStartTime: vm.earliestStartTimeModel,
                latestEndTime: vm.latestEndTimeModel,
                unitNumber: vm.unitNumber
            };
        }
    }

})();