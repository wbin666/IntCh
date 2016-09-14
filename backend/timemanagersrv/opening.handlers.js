/**
 * Created by alex on 6/14/16.
 */
(function(){
    'use strict';

    var myMongo = require('../dbConnect.js');
    var logger = require('../../util/logger.js');
    var dataService = require('./availTime.dataService.js');
    var ObjectId = require('mongodb').ObjectId;
    var moment = require('moment');

    //just keep a track (getting status) for a long running deleting request
    var requestArrayOfDeleteMultipleAvailTimes = [];

    module.exports.deleteAvailTimeByWholeDayDeleteHandler =deleteAvailTimeByWholeDayDeleteHandler;
    module.exports.deleteMultipleAvailTimePostHandler = deleteMultipleAvailTimePostHandler;
    module.exports.availTimePostHandler=availTimePostHandler;
    module.exports.availTimeGetHandler=availTimeGetHandler;

    function deleteAvailTimeByWholeDayDeleteHandler(req, res){
        logger.info("the req.params is : " + JSON.stringify(req.params));
        var dateStart = moment(req.params.localDateStart).toDate();
        var dateEnd = moment(req.params.localDateEnd).toDate();

        dataService.deleteAvailTimeByWholeDayRange(dateStart, dateEnd, deleteWholeDaysCallback);

        function deleteWholeDaysCallback(err, results){
            if(err){
                return res.status(500).send('Error occurred while deleting the available times by whole days : ' + err.message);
            }

            return res.status(200).send('Successfully removed the available times by the request whole days.');
        }
    }
    //module.exports.resultOfDeleteMultipleAvailTimesGetHandler = resultOfDeleteMultipleAvailTimesGetHandler;
    // function resultOfDeleteMultipleAvailTimesGetHandler(req, res) {
    //     logger.log('the passed resource id is' + req.params.resourceId);
    //     var delRequestTrack = findDelRequestTrack(req.params.resourceId);
    //
    //     if(delRequestTrack){
    //         res.location('/myCalendar');
    //         return res.status(303).send('No deleting request in the queue. Please check your calendar.');
    //     }
    //
    //     return res.status(202).send(delRequestTrack.delTimeSlotList);
    // }
    //
    // function findDelRequestTrack(resourceId){
    //     var i;
    //     for(i = 0; i < arrayContainer.length; i++) {
    //         //if ((requestArrayOfDeleteMultipleAvailTimes[i].resourceId === resourceId) && (requestArrayOfDeleteMultipleAvailTimes[i].username === req.username)) {
    //         if (requestArrayOfDeleteMultipleAvailTimes[i].resourceId === resourceId) {
    //             return requestArrayOfDeleteMultipleAvailTimes[i];
    //         }
    //     }
    //
    //     return null;
    // }

    function removeItemFromArray(item, arrayContainer){
        var i;
        for(i = 0; i < arrayContainer.length; i++) {
            //if ((arrayContainer[i].resourceId === item.resourceId) && (arrayContainer[i].username === item.username)) {  //enable the username after security enabled
            if(arrayContainer[i].resourceId === item.resourceId) {
                arrayContainer.splice(i, 1);
                return true;
            }
        }
    }

    //(Not adopt) refer to: http://stackoverflow.com/questions/2421595/restful-way-for-deleting-a-bunch-of-items?noredirect=1&lq=1
    //(Not adopt) refer to: http://stackoverflow.com/questions/21863326/delete-multiple-records-using-rest?noredirect=1&lq=1
    function deleteMultipleAvailTimePostHandler(req, res){
        var deleteTimeSlotList= genDailyUtcTimeSlotList(req.body.localTimeStart, req.body.localTimeEnd, req.body.localDateEnd, 1);  //set dailyRecurInterval = 1 by default
        //var dateStart = moment(req.body.localTimeStart).startOf('date');
        //var dateEnd = moment(req.body.localDateEnd).endOf('date');
        
        //generate an unique Id (via mongo ObjectId) and add to an array (resourceId, username, deleteList), so as a resource for http get
        //use resourceId and username to identify the unique track for a user's deleting request with multiple time slots
        // if key.value(deleteList) is null or undefine, means the deleting action is finished, redirect to calendar with goto date for double-check
        // if key.value(deleteList) is there, res.send('the deleting is on-going, please wait for a moment')
        var delSelectionTrack = {
            resourceId: ObjectId().valueOf(),   //leverage mongodb.ObjectId to generate the unique id.  refer to: https://docs.mongodb.com/manual/reference/method/ObjectId/#ObjectId
            username: 'test001',  //todo: to enable the username
            delTimeSlotList: deleteTimeSlotList,
            callbackCounter: 0,
            delError: null
        };
        requestArrayOfDeleteMultipleAvailTimes.push(delSelectionTrack);

        //dataService.availTimeDeleteSelection(dateStart.toDate(), dateEnd.toDate(), deleteTimeSlotList, delSelectionCb);
        for(i=0; deleteTimeSlotList.length > 0; i++){
            deleteTimeSlotList[i].delStatus = "To Be Deleted";
            
            dataService.availTimeDeleteByDelTimeSlot(deleteTimeSlotList[i], delSelectionTrack, delSelectionCb);
        }

        // res.location('/api/availTime/deletes/' + delSelectionTrack.resourceId);
        // res.status(303).end();
        return res.status(200).send({resourceId: delSelectionTrack.resourceId});

        function delSelectionCb(err, response, delTrack){
            delTrack.callbackCounter++;
            
            if(err && (delTrack.delError===null)){
                //delTrack.delError = new Error('Error occurred while deleting some time slots. Please check your calendar and try again if needed.');
                delTrack.delError = err;
            }
            if(delTrack.callbackCounter === delTrack.delTimeSlotList.length){
                removeItemFromArray(delTrack, requestArrayOfDeleteMultipleAvailTimes);

                if(delTrack.delError !== null){
                    //return res.status(409).statusText(delTrack.delError.message);  //statusText for angularjs response ???
                    return res.status(409).send(delTrack.delError.message);
                }
                return res.statumessages(200).send('Successfully removed the available time slots.');
            }
        }
    }

    function availTimeGetHandler(req, res){
        logger.info("Calendar request provides the startDate : %s and endDate : %s ", req.query.start, req.query.end);
        //the example of Logger output:  Calendar request provides the startDate : 2016-08-28 and endDate : 2016-10-09
        //leverage req.query object to provide the local date ISO string with UTC Offset
        logger.info('Calendar request query provides the userId : %s and utcOffset/minuts : %s and type of utcOffset : ', req.query.userId, req.query.utcOffset, typeof req.query.utcOffset);

        //build a local date (moment object) with the local date string (req.query.start/end) with their UTC offset
        var dateStart= genMomentWithOffSet(req.query.start, req.query.utcOffset);
        var dateEnd = genMomentWithOffSet(req.query.end, req.query.utcOffset);
        
        //set time with startOfDate or endOfDate
        dateStart.startOf('date');
        dateEnd.endOf('date');
        logger.info('built local dateStart : %s and local dateEnd : %s ', dateStart.format(), dateEnd.format());
        
        //Moment.toDate() to get internal js date object with UTC as default
        dataService.getAvailTimeByDateRange(dateStart.toDate(), dateEnd.toDate(), getAvailTimeCallback);

        function getAvailTimeCallback(err, docs){
            if(err){
                return res.status(500).send({error: err.message});
            }
            return res.send(docs);
        }

        function genMomentWithOffSet(dateStr, offsetInt){
            var dateMomentObj= moment().utcOffset(offsetInt);
            var dateStrArray= dateStr.split("-");
        
            dateMomentObj.year(dateStrArray[0])
                .month(parseInt(dateStrArray[1]-1))
                .date(dateStrArray[2]);
        
            return dateMomentObj;
        }
    }

    function availTimePostHandler(req, res) {
        if (!req.body){
            return res.sendStatus(400);
        }

        return dataService.insertOneAvailSchedule(req.body, insertAvailSchCallback);

        //////////////////////////////////////
        function insertAvailSchCallback(err, result){
            if(err){
                return res.status(500).send({error: err.message});
            }

            var physicalRecords = genPhysicalRecords(req.body, result.insertedId);

            return dataService.insertManyGenPhysicalRecords(physicalRecords, insertPhysicalRecordsCallback);
        }

        function insertPhysicalRecordsCallback(error, results){
            if(error){
                return res.status(500).send({error: error.message});
            }
            return res.status(200).send("Successfully inserted the schedule and physical records");
        }

    }

    function genPhysicalRecords(schedule, scheduleId){
        //individual time slots
        var physicalRecords = [];
        var individualRecord;
        var i;

        var availTimeSlotList= getUtcTimeSlotList(schedule);

        for(i=0; i< availTimeSlotList.length; i++){
            //individualRecord={availableDate: dateList[i].toISOString().substring(0,10), timeStart: schedule.timeStart, timeEnd: schedule.timeEnd, scheduelId: scheduleId};

            individualRecord={timeStart: availTimeSlotList[i].timeStart, timeEnd: availTimeSlotList[i].timeEnd, scheduleId: scheduleId};
            physicalRecords.push(individualRecord);
        }

        logger.info("generated physical records before inserting: " + JSON.stringify(physicalRecords));

        return physicalRecords;
    }

    function getUtcTimeSlotList(schedule){
        var timeSlotList;

        // var postData = {
        //     timeStart: startTime,                               //example: 2016-06-16T09:45:00+08:00
        //     timeEnd: endTime,
        //     recurFreq: recurData.recurFreqStr,                                //string, "daily" or "weekly"
        //     recurInterval: recurData.recurIntervalInteger,                  //integer, 1,2,3,4
        //     recurByDay: recurData.recurByDayBitwise,                         //integer, bitwise for operation
        //     schDateStart: schDateStart,                         //example: 2016-06-16T09:45:00+08:00
        //     schDateEnd: schDateEnd
        // };

        if(schedule.recurFreq === 'daily'){
            timeSlotList = genDailyUtcTimeSlotList(schedule.timeStart, schedule.timeEnd, schedule.schDateEnd, schedule.recurInterval);
        }else if(schedule.recurFreq === 'weekly') {
            timeSlotList = genWeeklyUtcTimeSlotList(schedule.timeStart, schedule.timeEnd, schedule.schDateEnd, schedule.recurInterval, schedule.recurByDay);
        }

        logger.info("calculated days for a recurring event : " + JSON.stringify(timeSlotList));

        return timeSlotList;
    }

    //localTimeStartMoment, localTimeEndMoment and localDateEndMoment are moment objects
    function genDailyUtcTimeSlotList(localTimeStartStr, localTimeEndStr, localDateEndStr, dailyRecurInterval) {
        var dailyTimeSlotList = [];
        var i;

        //start to use Moment to handle the date
        //moment.parseZone parses the time and then sets the zone according to the input string.
        var localTimeStart = moment.parseZone(localTimeStartStr);
        var localTimeEnd = moment.parseZone(localTimeEndStr);
        var dateEnd = moment.parseZone(localDateEndStr);
        logger.info("dateEnd is : typeof: %s, value: %s, dateEnd.format(): %s", typeof dateEnd, dateEnd, dateEnd.format());

        //if recurInterval is null or undefined, then set the default value as 1;
        if(dailyRecurInterval === null || dailyRecurInterval.isUndefined){
            dailyRecurInterval = 1;
        }

        for(i=1; localTimeEnd.isSameOrBefore(dateEnd); i++) {
            logger.info("localTimeEnd is : typeof: %s, value: %s, localTimeEnd.format: %s", typeof localTimeEnd, localTimeEnd, localTimeEnd.format());
            pushTimeSlotToList(dailyTimeSlotList, localTimeStart, localTimeEnd);

            //Don't need to make a clone sine the string is produced above
            //timeStartWithDate = timeStartWithDate.clone();
            localTimeStart.add(dailyRecurInterval, 'days');
            //timeEndwithDate = timeEndwithDate.clone();
            localTimeEnd.add(dailyRecurInterval, 'days');
        }

        return dailyTimeSlotList;
    }

    function genWeeklyUtcTimeSlotList(localTimeStartStr, localTimeEndStr, localDateEndStr, weeklyRecurInterval, weeklyRecurByDay){
        var weeklyTimeSlotList = [];
        var weekSeedList = [];
        var Days;
        var currentDay;
        var i;

        //use moment.js to handle the date
        //moment.parseZone parses the time and then sets the zone according to the input string.
        var localTimeStart = moment.parseZone(localTimeStartStr);
        var localTimeEnd = moment.parseZone(localTimeEndStr);
        var dateEnd = moment.parseZone(localDateEndStr);
        logger.info("dateEnd is : typeof: %s, value: %s, dateEnd.format(): %s", typeof dateEnd, dateEnd, dateEnd.format());

        //Todo:  extract the definition of 'Days' to a type/class and it's able to be created by 'new Days()' and the 'selected' field will be modified in both frontend angularjs and backend nodejs
        Days = [
            {"name": "Sunday", "value": 1, "selected": false},
            {"name": "Monday", "value": 2, "selected": false},
            {"name": "Tuesday", "value": 4, "selected": false},
            {"name": "Wednesday", "value": 8, "selected": false},
            {"name": "Thursday", "value": 16, "selected": false},
            {"name": "Friday", "value": 32, "selected": false},
            {"name": "Saturday", "value": 64, "selected": false}
        ];


        for (i = 0; i < Days.length; i++) {
            if ((weeklyRecurByDay & Days[i].value) === Days[i].value) {
                weekSeedList.push(i);   // keep a seed of a week's selected days to reduce the times of next "for" loop
            }
        }

        //first Week,  may not start from Sunday,  maybe start from the middle of week, i.e. Wednesday
        currentDay = localTimeEnd.getDay();
        for (i=0; (currentDay <= weekSeedList[i]) && (i < weekSeedList.length); i++) {
            localTimeStart.day(weekSeedList[i]);
            localTimeEnd.day(weekSeedList[i]);

            if(localTimeEnd.isSameOrBefore(dateEnd)) {
                pushTimeSlotToList(weeklyTimeSlotList, localTimeStart, localTimeEnd);
            }else{
                return weeklyTimeSlotList;
            }
        }

        //next scheduled week
        do {
            localTimeStart.add(weeklyRecurInterval, 'weeks'); //go to the next scheduled week via schedule.recurInterval
            localTimeEnd.add(weeklyRecurInterval, 'weeks');

            //notes: localTimeStart and localTimeEnd may start from any days of the next scheduled week
            localTimeStart.day(weekSeedList[0]);   //need to go back to first scheduled day of next scheduled week
            localTimeEnd.day(weekSeedList[0]);

            for (i = 0; (i < weekSeedList.length) && (localTimeEnd.isSameOrBefore(dateEnd));) {
                pushTimeSlotToList(weeklyTimeSlotList, localTimeStart, localTimeEnd);

                localTimeStart.day(weekSeedList[i++]);
                localTimeEnd.day(weekSeedList[i++]);
            }
        }while(localTimeEnd.isSameOrBefore(dateEnd));

        logger.info("calculated seed days for a weekly event : " + JSON.stringify(weekSeedList));
    }

    //***** add the js date (ISO with UTC by default) to the list
    function pushTimeSlotToList(dList, startTimeMoment, endTimeMoment){
        return dList.push({
            // timeStart: startTimeMoment.toISOString(),
            // timeEnd: endTimeMoment.toISOString()
            timeStart: startTimeMoment.toDate(),
            timeEnd: endTimeMoment.toDate()
        });
    }
})();

