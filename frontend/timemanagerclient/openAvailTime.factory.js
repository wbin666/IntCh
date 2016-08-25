/**
 * Created by alex on 8/24/16.
 */
(function(){
    angular.module('timeManager')
        .factory('openAvailTime', openAvailTime);

    openAvailTime.inject = ['$http', '$location'];
    function openAvailTime($http, $location) {
        return {
            publishTime: publishTime
        };

        function publishTime(vm){
            console.log("starting to submit the avail time plan.");
            console.log("repeatFreq is :" + vm.repeatFreq);

            var startTimeCopy, endTimeCopy;
            var startDateCopy, endDateCopy;
            var recurInterval = null;
            var recurByDay = 0;
            if (vm.repeatFreq === "daily") {
                recurInterval = vm.dailyRepeatInterval;
                console.log("It's dailyRepeatInterval : " + vm.dailyRepeatInterval);
            } else if (vm.repeatFreq === "weekly") {
                recurInterval = vm.weeklyRepeatInterval;
                console.log("It's weeklyRepeatInterval : " + vm.weeklyRepeatInterval);

                for (var i = 0; i < vm.days.length; i++) {
                    if (vm.days[i].selected) {
                        recurByDay = recurByDay | vm.days[i].value;
                    }
                }

                console.log("the selected days of week are : " + recurByDay);
            } else {
                alert("repeatFreq error. It must be either 'daily' or 'weekly'.");
                return;
            }

            //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
            startTimeCopy = vm.startTimeModel.split(":");   // convert "09:30" to an array [09, 30]
            startDateCopy = new Date(vm.startDateModel.getTime());
            startDateCopy.setHours(startTimeCopy[0], startTimeCopy[1]);    //setHours(hh,mm);

            //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
            endTimeCopy = vm.endTimeModel.split(":");
            endDateCopy = new Date(vm.endDateModel.getTime());
            endDateCopy.setHours(endTimeCopy[0], endTimeCopy[1]);

            var postData = {
                "timeStart": startDateCopy.toISOString().substring(11, 16),      //string, "09:30", UTC
                "timeEnd": endDateCopy.toISOString().substring(11, 16),         //string, "18:30", UTC
                "recurFreq": vm.repeatFreq,                                //string, "daily" or "weekly"
                "recurInterval": parseInt(recurInterval, 10),                  //integer, 1,2,3,4
                "recurByDay": recurByDay,                                      //integer, bitwise for operation
                "schDateStart": startDateCopy.toISOString().substring(0, 10),   //string, "2016-06-16", UTC
                "schDateEnd": endDateCopy.toISOString().substring(0, 10)         //string, "2016-09-16", UTC
            };

            console.log("the post data is : JSON.stringify(postData) " + JSON.stringify(postData));

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