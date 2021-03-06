/**
 * Created by alex on 8/26/16.
 */
(function() {
    'use strict';
    
    angular.module('booking')
        .controller('QueryAvailTimeCtrl', QueryAvailTimeCtrl);

    QueryAvailTimeCtrl.$inject = ['$location', 'bookingDataClient', 'dateTimeUtil'];
    function QueryAvailTimeCtrl($location, bookingDataClient, dateTimeUtil) {
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
        vm.preferredInstructorName;

        vm.queryTime = function queryTime(){
            //return bookingDataClient.queryAvailTime(dataFilter4Submit(vm));
            //$location.url('/availTimeCandidates').search({params: dataFilter4Submit(vm)});
            console.log("start to search the time slot .... ");
            $location.url('/availTimeCandidates').search({params: dataFilter4Submit(vm)});
        };

        function dataFilter4Submit(vm) {
            // var startDateTimeUtcStr = dateTimeUtil.getUtcDateTimeStr(vm.dateModel, vm.earliestStartTimeModel);
            // var endDateTimeUtcStr = dateTimeUtil.getUtcDateTimeStr(vm.dateModel, vm.latestEndTimeModel);
            //
            // return {
            //     earliestStartTime: startDateTimeUtcStr,
            //     latestEndTime: endDateTimeUtcStr,
            //     unitNumber: vm.unitNumber,
            //     preferredInstructorName: vm.preferredInstructorName
            // };

            //change to local datetime ISO string with UTC Offset
            var startDateTimeLocalIsoStr = dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.dateModel, vm.earliestStartTimeModel);
            var endDateTimeLocalIsoStr = dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.dateModel, vm.latestEndTimeModel);

            return {
                earliestStartTime: startDateTimeLocalIsoStr,
                latestEndTime: endDateTimeLocalIsoStr,
                unitNumber: vm.unitNumber,
                preferredInstructorName: vm.preferredInstructorName
            };
        }
    }

})();