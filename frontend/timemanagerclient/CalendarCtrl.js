/**
 * Created by alex on 6/21/16.
 */
(function() {
    angular.module('timeManager')
        .controller('CalendarCtrl', CalendarCtrl);

    CalendarCtrl.$inject = ['$routeParams'];

    function CalendarCtrl($routeParams) {
        var vm = this;

        /* config object */
        vm.uiConfig = {
            calendar: {
                height: 450,
                header: {
                    left: 'month basicWeek basicDay',
                    center: 'title',
                    right: 'today prev,next'
                },

                timezone: 'local',
                //timeFormat: 'H:mm',
                timeFormat: 'H(:mm)',
                displayEventEnd: true,
                //eventLimit: true,

                //Todo:  to be defined for the close/remove button
                eventRender: function (event, element) {
                    element.append("<span class='closeon'>X</span>");
                    element.find(".closeon").click(function () {
                        console.log("the event is clicked to close : " + event._id);
                        //$scope.uiConfig.calendars['myCalendar'].fullCalendar('removeEvents', event._id);
                        //$('#myCalendar').fullCalendar('removeEvents',event._id);
                        //$('.langExcalendar').fullCalendar('removeEvents',event._id);
                        vm.langExCalendar.fullCalendar('removeEvents', event._id);

                    });
                }
            }
        };

        vm.removeEv = function () {
            alert("removing the event");
        };

        vm.availTimeFeedTrsf = function (rawData) {
            // the date time are stored as UTC
            //Here moment take an ISO/UTC string to a local time by default.
            var startMoment = moment(rawData.availableDate+"T"+rawData.timeStart+":00.000Z");
            var endMoment = moment(rawData.availableDate+"T"+rawData.timeEnd+":00.000Z");

            //to check if endMoment is a next date
            if(startMoment > endMoment) {
                endMoment.add(1, 'days');
            }

            return {
                id: rawData._id,
                title: 'testTitle',
                start: startMoment,
                end: endMoment,
                //start: rawData.availableDate + "T" + rawData.timeStart + ":00.000Z",   // Doesn't cover the story that the endMoment is next date.
                //end: rawData.availableDate + "T" + rawData.timeEnd + ":00.000Z",      // Must-have or prerequesites in config:  timezone : 'local'
                url: 'http://cn.bing.com'
                //allDay: false
            };
        };

        vm.availTimeJSON = {
            url: '/api/openAvailTime',
            type: 'GET',
            data: {
                userId: '001test'
            },
            color: 'green',
            textColor: 'white',
            cache: true,
            eventDataTransform: vm.availTimeFeedTrsf
        };

        vm.eventSources = [
            //$scope.eventArray,
            vm.availTimeJSON
        ];

        //Todo:  here is an issue "uiCalendarConfig.calendars["langExCalendar"] is undefined"
        console.log("$routeParams.gotoDate is : " + $routeParams.gotoDate);
        // if($routeParams.gotoDate) {
        //     //$scope.langExCalendar.fullCalendar('gotoDate', $routeParams.gotoDate);
        //     console.log("uiCalendarConfig instance is " + uiCalendarConfig);
        //     console.log("uiCalendarConfig.calendars instance is " + uiCalendarConfig.calendars);
        //     console.log("uiCalendarConfig.calendars['langExCalendar'] instance is " + uiCalendarConfig.calendars["langExCalendar"]);
        //     //uiCalendarConfig.calendars.langExCalendar.fullCalendar('gotoDate', $routeParams.gotoDate);
        //     uiCalendarConfig.calendars["langExCalendar"].fullCalendar('gotoDate', $routeParams.gotoDate);
        // }
    }


    //Attention: original file of myCalendar.directive.js before replacing '$scope' with 'vm'
    // and work with the commented codes following.
    
    // <div class="page-header">
    //     <h3>Please review your available time</h3>
    // </div>
    //
    // <div>
    // <div ui-calendar="uiConfig.calendar" ng-model="eventSources" calendar="langExCalendar"></div>
    //     </div>
    
    // CalendarCtrl.$inject = ['$scope', '$routeParams', 'uiCalendarConfig'];
    //
    // function CalendarCtrl($scope, $routeParams, uiCalendarConfig) {
    //     /* config object */
    //     $scope.uiConfig = {
    //         calendar: {
    //             height: 450,
    //             header: {
    //                 left: 'month basicWeek basicDay',
    //                 center: 'title',
    //                 right: 'today prev,next'
    //             },
    //
    //             timezone: 'local',
    //             //timeFormat: 'H:mm',
    //             timeFormat: 'H(:mm)',
    //             displayEventEnd: true,
    //             //eventLimit: true,
    //
    //             //Todo:  to be defined for the close/remove button
    //             eventRender: function (event, element) {
    //                 element.append("<span class='closeon'>X</span>");
    //                 element.find(".closeon").click(function () {
    //                     console.log("the event is clicked to close : " + event._id);
    //                     //$scope.uiConfig.calendars['myCalendar'].fullCalendar('removeEvents', event._id);
    //                     //$('#myCalendar').fullCalendar('removeEvents',event._id);
    //                     //$('.langExcalendar').fullCalendar('removeEvents',event._id);
    //                     $scope.langExCalendar.fullCalendar('removeEvents', event._id);
    //
    //                 });
    //             }
    //         }
    //     };
    //
    //     $scope.removeEv = function () {
    //         alert("removing the event");
    //     };
    //
    //     $scope.availTimeFeedTrsf = function (rawData) {
    //         // the date time are stored as UTC
    //         //Here moment take an ISO/UTC string to a local time by default.
    //         var startMoment = moment(rawData.availableDate+"T"+rawData.timeStart+":00.000Z");
    //         var endMoment = moment(rawData.availableDate+"T"+rawData.timeEnd+":00.000Z");
    //
    //         //to check if endMoment is a next date
    //         if(startMoment > endMoment) {
    //             endMoment.add(1, 'days');
    //         }
    //
    //         return {
    //             id: rawData._id,
    //             title: 'testTitle',
    //             start: startMoment,
    //             end: endMoment,
    //             //start: rawData.availableDate + "T" + rawData.timeStart + ":00.000Z",   // Doesn't cover the story that the endMoment is next date.
    //             //end: rawData.availableDate + "T" + rawData.timeEnd + ":00.000Z",      // Must-have or prerequesites in config:  timezone : 'local'
    //             url: 'http://cn.bing.com'
    //             //allDay: false
    //         };
    //     };
    //
    //     //just for test purpose
    //     // $scope.eventArray = {
    //     //     events: [
    //     //         {
    //     //             id: '1',
    //     //             title: 'event1',
    //     //             start: '2016-06-23'
    //     //         },
    //     //         {
    //     //             id: '2',
    //     //             title: 'event2',
    //     //             start: '2016-06-23',
    //     //             end: '2016-06-24'
    //     //         },
    //     //         {
    //     //             id: '3',
    //     //             title: 'event3',
    //     //             start: '2016-06-23T12:30:00',
    //     //             allDay: false // will make the time show
    //     //         },
    //     //         {
    //     //             id: '57689e6b3f3824b05cf6fa95',
    //     //             title: 'staticTest',
    //     //             start: '2016-06-24T02:30:00',
    //     //             end: '2016-06-24T11:30:00',
    //     //             url: 'http://www.baidu.com',
    //     //         }
    //     //     ],
    //     //     color: 'blue',
    //     //     textColor: 'white'
    //     // };
    //
    //     $scope.availTimeJSON = {
    //         url: '/api/openAvailTime',
    //         type: 'GET',
    //         data: {
    //             userId: '001test'
    //         },
    //         color: 'green',
    //         textColor: 'white',
    //         cache: true,
    //         eventDataTransform: $scope.availTimeFeedTrsf
    //     };
    //
    //     $scope.eventSources = [
    //         //$scope.eventArray,
    //         $scope.availTimeJSON
    //     ];
    //
    //     //Todo:  here is an issue "uiCalendarConfig.calendars["langExCalendar"] is undefined"
    //     console.log("$routeParams.gotoDate is : " + $routeParams.gotoDate);
    //     // if($routeParams.gotoDate) {
    //     //     //$scope.langExCalendar.fullCalendar('gotoDate', $routeParams.gotoDate);
    //     //     console.log("uiCalendarConfig instance is " + uiCalendarConfig);
    //     //     console.log("uiCalendarConfig.calendars instance is " + uiCalendarConfig.calendars);
    //     //     console.log("uiCalendarConfig.calendars['langExCalendar'] instance is " + uiCalendarConfig.calendars["langExCalendar"]);
    //     //     //uiCalendarConfig.calendars.langExCalendar.fullCalendar('gotoDate', $routeParams.gotoDate);
    //     //     uiCalendarConfig.calendars["langExCalendar"].fullCalendar('gotoDate', $routeParams.gotoDate);
    //     // }
    // }
})();