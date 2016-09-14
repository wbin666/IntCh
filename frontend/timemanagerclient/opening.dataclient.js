/**
 * Created by alex on 8/24/16.
 */
(function(){
    angular.module('timeManager')
        .factory('openingDataClient', openingDataClient);

    openingDataClient.inject = ['$http', '$location', 'dateTimeUtil'];
    function openingDataClient($http, $location, dateTimeUtil) {
        return {
            releaseWholeDay: releaseWholeDay,
            releaseTimeRange: releaseTimeRange,
            publishTime: publishTime
        };

        function releaseWholeDay(vm){
            var localDateStart = moment(vm.startDateModel.toISOString()).startOf('date').format();
            var localDateEnd = moment(vm.endDateModel.toISOString()).endOf('date').format();

            return $http.delete('/api/availTime/deletes/wholeDay/' + localDateStart + '/' + localDateEnd)
                .then(function(response){
                    //add Flash message here
                    //location.url('/api/availTime/deletes/' + response.data.resourceId);
                    location.url('/myCalendar?gotoDate=' + dateTimeUtil.getLocalDateStr(vm.startDateModel));
                })
                .catch(function(errResponse){
                    console.log('Error occurred during picking up the deletion candidates : ' + errResponse.status + ' : '+ errResponse.statusText);
                });
        }

        function releaseTimeRange(vm){
            console.log('starting to delete the opened avail time');
            var deleteTimeRangePeriod = {
                localTimeStart : dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.startDateModel, vm.startTimeModel),
                localTimeEnd : dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.startDateModel, vm.endTimeModel),
                //comment localDateStart variable because it is same to localTimeStart
                //localDateStart : dateTimeUtil.getLocalDateTimeWithUtcoffset(vm.startDateModel, vm.startTimeModel),
                localDateEnd : dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.endDateModel, vm.endTimeModel)
            };

            return $http.post('/api/availTime/deletes/timeRange', deleteTimeRangePeriod)
                .then(function(response){
                    //add Flash message here
                    //location.url('/api/availTime/deletes/' + response.data.resourceId);
                    location.url('/myCalendar?gotoDate=' + dateTimeUtil.getLocalDateStr(vm.startDateModel));
                })
                .catch(function(errResponse){
                    console.log('Error occurred during picking up the deletion candidates : ' + errResponse.status + ' : '+ errResponse.statusText);
                });
        }

        function publishTime(vm){
            console.log("starting to submit the avail time plan.");
            
            if(vm.repeatFreq !== "daily" && vm.repeatFreq !== "weekly"){
                console.log("repeatFreq error. It must be either 'daily' or 'weekly'.");
                //todo: add flash message here
                return;
            }
            var recurData = dateTimeUtil.getRecurData(vm);

            //local startTime to combine the startDate and startTime together to produce ISO-8601 string of local datetime with UTC Offset.
            var startTime = dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.startDateModel, vm.startTimeModel);
            //local endTime with combination the start Date and endTime to produce ISO-8601 string of local datetime with UTC Offset.
            var endTime =dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.startDateModel, vm.endTimeModel);
            
            //local schDateStart with start time to to produce ISO-8601 string of local datetime with UTC Offset.
            var schDateStart = dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.startDateModel, vm.startTimeModel);
            //local schDateEnd with end time to to produce ISO-8601 string of local datetime with UTC Offset.
            var schDateEnd =dateTimeUtil.getLocalDateTimeStrWithUtcOffset(vm.endDateModel, vm.endTimeModel);

            // var postData = {
            //     timeStart: startDateTimeUtcStr.utcTimeString,      //string, "09:30", UTC
            //     timeEnd: endDateTimeUtcStr.utcTimeString,         //string, "18:30", UTC
            //     recurFreq: recurData.recurFreqStr,                                //string, "daily" or "weekly"
            //     recurInterval: recurData.recurIntervalInteger,                  //integer, 1,2,3,4
            //     recurByDay: recurData.recurByDayBitwise,                         //integer, bitwise for operation
            //     schDateStart: startDateTimeUtcStr.utcDateString,    //string, "2016-06-16", UTC
            //     schDateEnd: endDateTimeUtcStr.utcDateString         //string, "2016-09-16", UTC
            // };

            var postData = {
                timeStart: startTime,                               //example: 2016-06-16T09:45:00+08:00
                timeEnd: endTime,
                recurFreq: recurData.recurFreqStr,                                //string, "daily" or "weekly"
                recurInterval: recurData.recurIntervalInteger,                  //integer, 1,2,3,4
                recurByDay: recurData.recurByDayBitwise,                         //integer, bitwise for operation
                schDateStart: schDateStart,                         //example: 2016-06-16T09:45:00+08:00
                schDateEnd: schDateEnd
            };

            console.log("the post data is : JSON.stringify(postData) " + JSON.stringify(postData));

            //Todo: add flash message here
            return $http.post('/api/openAvailTime', postData)
                .then(function (response) {
                    console.log("Insert the available Schedule successfully ! ");
                    console.log("redirecting to the myCalendar");
                    $location.url('/myCalendar?gotoDate=' + postData.schDateStart);
                })
                .catch(function (response) {
                    console.log("Error occured while saving the available schedule! and the detail info is : " + JSON.stringify(response));
                });
        }
    }
})();