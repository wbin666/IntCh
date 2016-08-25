/**
 * Created by alex on 5/12/16.
 */
(function(){
    angular.module('timeManager')
        .controller('OpenAvailTimeCtrl', OpenAvailTimeCtrl);

    OpenAvailTimeCtrl.$inject = ['$http', '$location', 'openAvailTime'];
    function OpenAvailTimeCtrl($http, $location, openAvailTime) {
        var vm = this;
        
        vm.days = [
            {"name": "Sunday", "value": 1, "selected": false},
            {"name": "Monday", "value": 2, "selected": false},
            {"name": "Tuesday", "value": 4, "selected": false},
            {"name": "Wednesday", "value": 8, "selected": false},
            {"name": "Thursday", "value": 16, "selected": false},
            {"name": "Friday", "value": 32, "selected": false},
            {"name": "Saturday", "value": 64, "selected": false}
        ];
    
        var tempDate = new Date();
        vm.days[tempDate.getDay()].selected = true;
        
        vm.startTimeLabel = "Start time";
        vm.startTimeModel = "09:00";
        vm.endTimeLabel = "End time";
        vm.endTimeModel = "18:00";
    
        vm.startDateLabel = "Starting";
        vm.startDateModel = new Date();
        //$scope.startDateModel;
        //$scope.startDateModel = null;
    
        vm.endDateLabel = "To";
        tempDate.setDate(tempDate.getDate() + 90);
        vm.endDateModel = tempDate;  //by default, it's for 3 months
    
        vm.repeatFreq = "daily";
    
        vm.dailyRepeatInterval = "1";
        vm.weeklyRepeatInterval = "1";

        vm.openTime = function openTime(){
            return openAvailTime.publishTime(vm);
        };

        // $scope.dailyRepeatOptions=[
        //     {"name": "Every day", "value": 1},
        //     {"name": "Every other day", "value": 2},
        //     {"name": "Every 3rd day", "value": 3},
        //     {"name": "Every 4th day", "value": 4}
        // ];
        //
        // $scope.weeklyRepeatOptions=[
        //     {"name": "Every ", "value": 1},
        //     {"name": "Every other", "value": 2},
        //     {"name": "Every 3rd", "value": 3},
        //     {"name": "Every 4th", "value": 4}
        // ];
    
    
        //vm.openTime = publishAvailTime;

        // function publishAvailTime() {
        //     console.log("starting to submit the avail time plan.");
        //     console.log("repeatFreq is :" + vm.repeatFreq);
        //
        //     var startTimeCopy, endTimeCopy;
        //     var startDateCopy, endDateCopy;
        //     var recurInterval = null;
        //     var recurByDay = 0;
        //     if (vm.repeatFreq === "daily") {
        //         recurInterval = vm.dailyRepeatInterval;
        //         console.log("It's dailyRepeatInterval : " + vm.dailyRepeatInterval);
        //     } else if (vm.repeatFreq === "weekly") {
        //         recurInterval = vm.weeklyRepeatInterval;
        //         console.log("It's weeklyRepeatInterval : " + vm.weeklyRepeatInterval);
        //
        //         for (var i = 0; i < vm.days.length; i++) {
        //             if (vm.days[i].selected) {
        //                 recurByDay = recurByDay | vm.days[i].value;
        //             }
        //         }
        //
        //         console.log("the selected days of week are : " + recurByDay);
        //     } else {
        //         alert("repeatFreq error. It must be either 'daily' or 'weekly'.");
        //         return;
        //     }
        //
        //     //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
        //     startTimeCopy = vm.startTimeModel.split(":");   // convert "09:30" to an array [09, 30]
        //     startDateCopy = new Date(vm.startDateModel.getTime());
        //     startDateCopy.setHours(startTimeCopy[0], startTimeCopy[1]);    //setHours(hh,mm);
        //
        //     //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
        //     endTimeCopy = vm.endTimeModel.split(":");
        //     endDateCopy = new Date(vm.endDateModel.getTime());
        //     endDateCopy.setHours(endTimeCopy[0], endTimeCopy[1]);
        //
        //     var postData = {
        //         "timeStart": startDateCopy.toISOString().substring(11, 16),      //string, "09:30", UTC
        //         "timeEnd": endDateCopy.toISOString().substring(11, 16),         //string, "18:30", UTC
        //         "recurFreq": vm.repeatFreq,                                //string, "daily" or "weekly"
        //         "recurInterval": parseInt(recurInterval, 10),                  //integer, 1,2,3,4
        //         "recurByDay": recurByDay,                                      //integer, bitwise for operation
        //         "schDateStart": startDateCopy.toISOString().substring(0, 10),   //string, "2016-06-16", UTC
        //         "schDateEnd": endDateCopy.toISOString().substring(0, 10)         //string, "2016-09-16", UTC
        //     };
        //
        //     console.log("the post data is : JSON.stringify(postData) " + JSON.stringify(postData));
        //
        //     $http.post('/api/openAvailTime', postData)
        //         .then(function(){
        //             console.log("Insert the available Schedule successfully ! ");
        //             console.log("redirecting to the myCalendar");
        //             $location.url('/myCalendar?gotoDate=' + postData.schDateStart);
        //     });
        //}
    }
    
    //seems not redundant now
    // angular.module('openAvailTime').controller('datepickerInlineCtrl', ['$scope', function ($scope) {
    //     $scope.today = function () {
    //         $scope.dateSelected = new Date();
    //     };
    //     $scope.today();
    //
    //     $scope.options = {
    //         //customClass: getDayClass,
    //         minDate: new Date(),
    //         showWeeks: true
    //     };
    //
    //     // // Disable weekend selection
    //     // function disabled(data) {
    //     //     var date = data.date,
    //     //         mode = data.mode;
    //     //     return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    //     // }
    // }]);
    
    
    // Attention: backup before replacing '$scope' with 'vm'
    // BTW, related html file backup is named 'openAvailTime_backupBeforeReplacingScopeWith_vm.html'
    
    // OpenAvailTimeCtrl.$inject = ['$scope', '$http', '$location'];
    // function OpenAvailTimeCtrl($scope, $http, $location) {
    //     $scope.days = [
    //         {"name": "Sunday", "value": 1, "selected": false},
    //         {"name": "Monday", "value": 2, "selected": false},
    //         {"name": "Tuesday", "value": 4, "selected": false},
    //         {"name": "Wednesday", "value": 8, "selected": false},
    //         {"name": "Thursday", "value": 16, "selected": false},
    //         {"name": "Friday", "value": 32, "selected": false},
    //         {"name": "Saturday", "value": 64, "selected": false}
    //     ];
    //
    //     var tempDate = new Date();
    //     $scope.days[tempDate.getDay()].selected = true;
    //
    //     // $scope.postData={
    //     //     timeStart : "09:00",
    //     //     timeEnd : "18:00",
    //     //     recurFreq : "daily",
    //     //     recurInterval : 1,
    //     //     recurByDay : 0,
    //     //     dateStart : today,
    //     //     dateEnd : today.setDate(today.getDate()+ 90)
    //     // };
    //
    //     $scope.startTimeLabel = "Start time";
    //     $scope.startTimeModel = "09:00";
    //     $scope.endTimeLabel = "End time";
    //     $scope.endTimeModel = "18:00";
    //
    //     $scope.startDateLabel = "Starting";
    //     $scope.startDateModel = new Date();
    //     //$scope.startDateModel;
    //     //$scope.startDateModel = null;
    //
    //     $scope.endDateLabel = "To";
    //     tempDate.setDate(tempDate.getDate() + 90);
    //     $scope.endDateModel = tempDate;  //by default, it's for 3 months
    //
    //     $scope.repeatFreq = "daily";
    //
    //     $scope.dailyRepeatInterval = "1";
    //     $scope.weeklyRepeatInterval = "1";
    //
    //     // $scope.dailyRepeatOptions=[
    //     //     {"name": "Every day", "value": 1},
    //     //     {"name": "Every other day", "value": 2},
    //     //     {"name": "Every 3rd day", "value": 3},
    //     //     {"name": "Every 4th day", "value": 4}
    //     // ];
    //     //
    //     // $scope.weeklyRepeatOptions=[
    //     //     {"name": "Every ", "value": 1},
    //     //     {"name": "Every other", "value": 2},
    //     //     {"name": "Every 3rd", "value": 3},
    //     //     {"name": "Every 4th", "value": 4}
    //     // ];
    //
    //
    //     $scope.openTime = publishAvailTime;
    //
    //     function publishAvailTime() {
    //         console.log("starting to submit the avail time plan.");
    //         console.log("repeatFreq is :" + $scope.repeatFreq);
    //
    //         var startTimeCopy, endTimeCopy;
    //         var startDateCopy, endDateCopy;
    //         var recurInterval = null;
    //         var recurByDay = 0;
    //         if ($scope.repeatFreq === "daily") {
    //             recurInterval = $scope.dailyRepeatInterval;
    //             console.log("It's dailyRepeatInterval : " + $scope.dailyRepeatInterval);
    //         } else if ($scope.repeatFreq === "weekly") {
    //             recurInterval = $scope.weeklyRepeatInterval;
    //             console.log("It's weeklyRepeatInterval : " + $scope.weeklyRepeatInterval);
    //
    //             for (var i = 0; i < $scope.days.length; i++) {
    //                 if ($scope.days[i].selected) {
    //                     recurByDay = recurByDay | $scope.days[i].value;
    //                 }
    //             }
    //
    //             console.log("the selected days of week are : " + recurByDay);
    //         } else {
    //             alert("repeatFreq error. It must be either 'daily' or 'weekly'.");
    //             return;
    //         }
    //
    //         //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
    //         startTimeCopy = $scope.startTimeModel.split(":");   // convert "09:30" to an array [09, 30]
    //         startDateCopy = new Date($scope.startDateModel.getTime());
    //         startDateCopy.setHours(startTimeCopy[0], startTimeCopy[1]);    //setHours(hh,mm);
    //
    //         //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
    //         endTimeCopy = $scope.endTimeModel.split(":");
    //         endDateCopy = new Date($scope.endDateModel.getTime());
    //         endDateCopy.setHours(endTimeCopy[0], endTimeCopy[1]);
    //
    //         var postData = {
    //             "timeStart": startDateCopy.toISOString().substring(11, 16),      //string, "09:30", UTC
    //             "timeEnd": endDateCopy.toISOString().substring(11, 16),         //string, "18:30", UTC
    //             "recurFreq": $scope.repeatFreq,                                //string, "daily" or "weekly"
    //             "recurInterval": parseInt(recurInterval, 10),                  //integer, 1,2,3,4
    //             "recurByDay": recurByDay,                                      //integer, bitwise for operation
    //             "schDateStart": startDateCopy.toISOString().substring(0, 10),   //string, "2016-06-16", UTC
    //             "schDateEnd": endDateCopy.toISOString().substring(0, 10)         //string, "2016-09-16", UTC
    //         };
    //
    //         console.log("the post data is : JSON.stringify(postData) " + JSON.stringify(postData));
    //
    //         $http.post('/api/openAvailTime', postData)
    //             .then(function(){
    //                 console.log("Insert the available Schedule successfully ! ");
    //                 console.log("redirecting to the myCalendar");
    //                 $location.url('/myCalendar?gotoDate=' + postData.schDateStart);
    //         });
    //     }
    //
    // }
    //
    // //seems not redundant now
    // // angular.module('openAvailTime').controller('datepickerInlineCtrl', ['$scope', function ($scope) {
    // //     $scope.today = function () {
    // //         $scope.dateSelected = new Date();
    // //     };
    // //     $scope.today();
    // //
    // //     $scope.options = {
    // //         //customClass: getDayClass,
    // //         minDate: new Date(),
    // //         showWeeks: true
    // //     };
    // //
    // //     // // Disable weekend selection
    // //     // function disabled(data) {
    // //     //     var date = data.date,
    // //     //         mode = data.mode;
    // //     //     return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    // //     // }
    // // }]);
})();