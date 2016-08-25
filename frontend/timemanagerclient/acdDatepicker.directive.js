/**
 * Created by alex on 5/14/16.
 */
(function() {
    angular.module('timeManager')
        .directive('acdDatepicker', acdDatepicker)
        .controller('DatepickerCtrl', DatepickerCtrl);

    function acdDatepicker() {
        return {
            restrict: 'E',
            scope: {
                baseDateModel: '=',
                baseLabelText: '@'
            },
            templateUrl: 'timemanagerclient/acdDatepicker.html',
            replace: true,
            bindToController: true,
            controller: 'DatepickerCtrl as baseDateCtrl'
        };
    }


    DatepickerCtrl.$inject = [];
    function DatepickerCtrl() {
        var vm = this;
        
        var numOfDaysLater = 3;   // hard code as default value if no setting

        var firstDate = firstAllowedDate();
        if (vm.baseDateModel === undefined || vm.baseDateModel === null || vm.baseDateModel < firstDate) {
            //to define the first allowed date to be opened,  BTW, by default, it's 3 days later of current date
            vm.baseDateModel = firstDate;
        }

        vm.open2 = function () {
            vm.popup2.opened = true;
        };

        vm.popup2 = {
            opened: false
        };

        vm.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yyyy',
            maxDate: new Date(2099, 12, 31),   // hard code for syncing with the date pattern applied in template
            minDate: firstDate,
            //initDate: firstDate,
            startingDay: 1

        };

        function setNumOfDaysLater(daysOffSet) {
            numOfDaysLater = daysOffSet;
        }

        function firstAllowedDate() {
            var firstAllowedDate = new Date();
            firstAllowedDate.setDate(firstAllowedDate.getDate() + numOfDaysLater);

            return firstAllowedDate;
        }

        function disabled(data) {
            var date = data.date,
                mode = data.mode;

            //Disable weekend selection
            //return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);

            //var compareDate=firstAllowedDate();
            //return mode === 'day' && (date.getMonth() <= compareDate.getMonth() && date.getDate() < compareDate.getDate())

            return mode === 'day' && (date.getMonth() <= firstDate.getMonth() && date.getDate() < firstDate.getDate())
        }
    }
   
// Attention: original file of acdDatepicker.directive.js before replacing '$scope' with 'vm'
// and work with the commented codes following.
//
//     <ng-form name="baseDateForm">
//         <div class="row" ng-class="{'has-error': baseDateForm.baseDateInput.$touched && baseDateForm.baseDateInput.$invalid }">
//         <p>
//         <div class="col-md-2" style="text-align: right">
//         <label>{{::baseLabelText}}</label>
//     </div>
//     <div class="col-md-2">
//         <span class="input-group">
//         <!-- The pattern checks that
//     1) the year is numeric and starts with 19 or 20,
//     2) the month is numeric and between 01-12, and
// 3) the day is numeric between 01-29, or
// 3) the day is numeric between 01-29, or
// b) 30 if the month value is anything other than 02, or
// c) 31 if the month value is one of 01,03,05,07,08,10, or 12.
// Notes: the reference url:  http://html5pattern.com/Dates
//     -->
//     <input name="baseDateInput" type="text" class="form-control" placeholder="YYYY-MM-DD"
// ng-model="baseDateModel"
// uib-datepicker-popup
// is-open="popup2.opened" datepicker-options="dateOptions" show-button-bar="false"
// maxlength="10"
// pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))"
// required="required">
//     <span class="input-group-btn">
//     <button type="button" class="btn btn-default" ng-click="open2()"><i class="glyphicon glyphicon-calendar"></i></button>
//     </span>
//     </span>
//     </div>
//     <div class="help-block" ng-messages="baseDateForm.baseDateInput.$error" ng-if="baseDateForm.baseDateInput.$touched">
//     <p ng-message="date">Please input the valid date with the format: YYYY-MM-DD that starts with 19 or 20, e.g. 2016-06-16</p>
// <p ng-message="required">The date is required</p>
// </div>
// </p>
// </div>
// </ng-form>
    

// //just for test purpose, mainCtrl is used to feed the test data
// angular.module('acdDatepicker').controller('mainCtrl', ['$scope', function($scope){
//      $scope.startDateLabel="Starting";
//     //$scope.startDateModel = new Date("2016-06-16");
//     //$scope.startDateModel;
//     $scope.startDateModel = null;
//
//     $scope.endDateLabel="To";
//      $scope.endDateModel= new Date("2016-08-18");
// }]);

    // DatepickerCtrl.$inject = ['$scope'];
    // function DatepickerCtrl($scope) {
    //     var numOfDaysLater = 3;   // hard code as default value if no setting
    //     function setNumOfDaysLater(daysOffSet) {
    //         numOfDaysLater = daysOffSet;
    //     }
    //
    //     function firstAllowedDate() {
    //         var firstAllowedDate = new Date();
    //         firstAllowedDate.setDate(firstAllowedDate.getDate() + numOfDaysLater);
    //
    //         return firstAllowedDate;
    //     }
    //
    //     var firstDate = firstAllowedDate();
    //     if ($scope.baseDateModel === undefined || $scope.baseDateModel === null || $scope.baseDateModel < firstDate) {
    //         //to define the first allowed date to be opened,  BTW, by default, it's 3 days later of current date
    //         $scope.baseDateModel = firstDate;
    //     }
    //
    //     // $scope.inlineOptions = {
    //     //     customClass: getDayClass,
    //     //     minDate: firstDate,
    //     //     showWeeks: true
    //     // };
    //
    //     $scope.dateOptions = {
    //         dateDisabled: disabled,
    //         formatYear: 'yyyy',
    //         maxDate: new Date(2099, 12, 31),   // hard code for syncing with the date pattern applied in template
    //         minDate: firstDate,
    //         //initDate: firstDate,
    //         startingDay: 1
    //
    //     };
    //
    //
    //     function disabled(data) {
    //         var date = data.date,
    //             mode = data.mode;
    //
    //         //Disable weekend selection
    //         //return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    //
    //         //var compareDate=firstAllowedDate();
    //         //return mode === 'day' && (date.getMonth() <= compareDate.getMonth() && date.getDate() < compareDate.getDate())
    //
    //         return mode === 'day' && (date.getMonth() <= firstDate.getMonth() && date.getDate() < firstDate.getDate())
    //     }
    //
    //     // $scope.toggleMin = function() {
    //     //     $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    //     //     $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    //     // };
    //     //
    //     // $scope.toggleMin();
    //
    //
    //     $scope.open2 = function () {
    //         $scope.popup2.opened = true;
    //     };
    //
    //     // $scope.setDate = function(year, month, day) {
    //     //     $scope.baseDateModel = new Date(year, month, day);
    //     // };
    //
    //     $scope.popup2 = {
    //         opened: false
    //     };
    //
    //     // var tomorrow = new Date();
    //     // tomorrow.setDate(tomorrow.getDate() + 1);
    //     // var afterTomorrow = new Date();
    //     // afterTomorrow.setDate(tomorrow.getDate() + 1);
    //     // $scope.events = [
    //     //     {
    //     //         date: tomorrow,
    //     //         status: 'full'
    //     //     },
    //     //     {
    //     //         date: afterTomorrow,
    //     //         status: 'partially'
    //     //     }
    //     // ];
    //     //
    //     // function getDayClass(data) {
    //     //     var date = data.date,
    //     //         mode = data.mode;
    //     //     if (mode === 'day') {
    //     //         var dayToCheck = new Date(date).setHours(0,0,0,0);
    //     //
    //     //         for (var i = 0; i < $scope.events.length; i++) {
    //     //             var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
    //     //
    //     //             if (dayToCheck === currentDay) {
    //     //                 return $scope.events[i].status;
    //     //             }
    //     //         }
    //     //     }
    //     //
    //     //     return '';
    //     // }
    // }
})();