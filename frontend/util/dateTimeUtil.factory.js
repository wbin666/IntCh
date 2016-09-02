/**
 * Created by alex on 8/31/16.
 */
(function(){
    'use strict';
    angular.module('frontUtility')
        .factory('dateTimeUtil', dateTimeUtil);

    //dateTimeUtil.$inject = [];
    function dateTimeUtil(){
        return {
            getUtcDateTimeStr: getUtcDateTimeStr,
            //getLocalMoment: getLocalMoment,
            getLocalDateTimeWithUtcoffset: getLocalDateTimeWithUtcoffset,
            getRecurData: getRecurData
        };

        //moment("2014-04-25T01:32:21.196Z");  // iso string, utc timezone
        //moment("2014-04-25T01:32:21.196+0600");  // iso string with timezone
        //moment().format();  //if it's in local mode (not utc mode), the output is 2016-06-16T21:45:00+08:00

        function getUtcDateTimeStr(localDateJsObj, localTimeHHmmStr){
            //localDateJsObj and localTimeHHmmStr are from a "local time"
            //localDateJsObj is a javescript "Date" object
            //localTimeHHmmStr is a string of "HH:mm" in 24 hours

            //to combine the startDate and startTime together to produce UTC datetime via ISO string or JSON.stringify.
            var timeCopy = localTimeHHmmStr.split(":");   // convert "09:30" to an array [09, 30]
            var dateCopy = new Date(localDateJsObj.getTime());
            dateCopy.setHours(timeCopy[0], timeCopy[1]);    //setHours(hh,mm);
            console.log("date time to ISO String is : " + dateCopy.toISOString());

            // var utcDateStr = dateCopy.toISOString().substring(0, 10);  //string, "2016-06-16", UTC
            // var utcTimeStr=dateCopy.toISOString().substring(11, 16);     //string, "09:30", UTC

            dateCopy.setSeconds(0);
            dateCopy.setMilliseconds(0);
            console.log("date time to ISO String with zero Seconds and Milliseconds is : " + dateCopy.toISOString());

            return dateCopy.toISOString();   //returniso string, utc timezone, i.e. 2016-06-16T02:45:00.000Z
        }

        // function getLocalMoment(utcDateStr, utcTimeStr){
        //     // the date and time strings are stored as UTC, i.e date string is 2016-08-27,  time string is '17:45' in 24h
        //     //Here moment take an ISO/UTC string to a local time by default.
        //     return moment(utcDateStr+"T"+utcTimeStr+":00.000Z");
        // }

        function getLocalDateTimeWithUtcoffset(localDateJsObj, localTimeHHmmStr){
            //localDateJsObj and localTimeHHmmStr are from a "local time"
            //localDateJsObj is a javescript "Date" object
            //localTimeHHmmStr is a string of "HH:mm" in 24 hours

            var localTimeIsoStr = localDateJsObj.getFullYear() + '-'
                + localDateJsObj.getMonth() + '-'
                + localDateJsObj.getDate() + 'T'
                + localTimeHHmmStr + ":00";   //00 is seconds;  no utc offset appended,  so moment will take it as a local date time by default.

            //leverage a moment.format() to get Uts Offset appended, i.e. +08:00,  instead of getting minutes difference by Date.getTimezoneOffset()
            var result = moment(localDateJsObj);

            console.log("Expected local datetime string with UTC offset is : " + result.format());

            //return a ISO string with local date time and its UTC Offset. i.e. 2016-06-16T21:45:00+08:00 with  00 seconds and without milliseconds
            return result.format();
        }
        
        function getRecurData(vm){
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
            }
            
            return {
                recurFreqStr: vm.repeatFreq,                                //string, "daily" or "weekly"
                recurIntervalInteger: parseInt(recurInterval, 10),              //integer, 1,2,3,4
                recurByDayBitwise: recurByDay                                  //integer, bitwise for operation
            };
        }
        
    }
})();