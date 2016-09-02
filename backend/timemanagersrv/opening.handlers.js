/**
 * Created by alex on 6/14/16.
 */
(function(){
    'use strict';

    var myMongo = require('../dbConnect.js');
    var logger = require('../../util/logger.js');
    var dataService = require('./availTime.dataService.js');
    var moment = require('moment');

    module.exports.availTimePostHandler=availTimePostHandler;
    module.exports.availTimeGetHandler=availTimeGetHandler;

    function availTimeGetHandler(req, res){
        logger.info("Calendar request provides the startDate : %s and endDate : %s ", req.query.start, req.query.end);
        dataService.getAvailTimeByDateRange(req.query.start, req.query.end, getAvailTimeCallback);

        function getAvailTimeCallback(err, docs){
            if(err){
                return res.status(500).send({error: err.message});
            }
            return res.send(docs);
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
        var dateList, individualRecord, i;

        dateList=getDateList(schedule);

        for(i=0; i< dateList.length; i++){
            //individualRecord={availableDate: dateList[i].toISOString().substring(0,10), timeStart: schedule.timeStart, timeEnd: schedule.timeEnd, scheduelId: scheduleId};

            //date is included in timeStart and timeEnd ISOString
            individualRecord={timeStart: dateList[i].timeStart, timeEnd: dateList[i].timeEnd, scheduelId: scheduleId};
            physicalRecords.push(individualRecord);
        }

        logger.info("generated physical records before inserting: " + JSON.stringify(physicalRecords));

        return physicalRecords;
    }

    function getDateList(schedule){
        var dateList = [];
        var weekSeedList = [];
        var Days;
        var currentDay;
        var i;

        // var postData = {
        //     timeStart: startTime,                               //example: 2016-06-16T09:45:00+08:00
        //     timeEnd: endTime,
        //     recurFreq: recurData.recurFreqStr,                                //string, "daily" or "weekly"
        //     recurInterval: recurData.recurIntervalInteger,                  //integer, 1,2,3,4
        //     recurByDay: recurData.recurByDayBitwise,                         //integer, bitwise for operation
        //     schDateStart: schDateStart,                         //example: 2016-06-16T09:45:00+08:00
        //     schDateEnd: schDateEnd
        // };

        //start to use Moment to handle the date
        //moment.parseZone parses the time and then sets the zone according to the input string.
        var localTimeStart = moment.parseZone(schedule.timeStart);
        var localTimeEnd = moment.parseZone(schedule.timeEnd);
        var dateEnd = moment.parseZone(schedule.schDateEnd);
        logger.info("dateEnd is : typeof: %s, value: %s, dateEnd.format(): %s", typeof dateEnd, dateEnd, dateEnd.format());

        if(schedule.recurFreq === 'daily'){
            for(i=1; localTimeEnd.isSameOrBefore(dateEnd); i++) {
                logger.info("localTimeEnd is : typeof: %s, value: %s, localTimeEnd.format: %s", typeof localTimeEnd, localTimeEnd, localTimeEnd.format());
                pushTimeSlotToList(dateList, localTimeStart, localTimeEnd);

                //Don't need to make a clone sine the string is produced above
                //timeStartWithDate = timeStartWithDate.clone();
                localTimeStart.add(schedule.recurInterval, 'days');
                //timeEndwithDate = timeEndwithDate.clone();
                localTimeEnd.add(schedule.recurInterval, 'days');
            }
        }else if(schedule.recurFreq === 'weekly') {
            //Todo:  extract the definition of 'Days' to a type/class and it's able to be created by 'new Days()' and the 'selected' field will be modified in both frontend angularjs and backend nodejs
            // schedule.recurByDay
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
                if ((schedule.recurByDay & Days[i].value) === Days[i].value) {
                    weekSeedList.push(i);   // keep a seed of a week's selected days to reduce the times of next "for" loop
                }
            }

            //first Week,  may not start from Sunday,  maybe start from the middle of week, i.e. Wednesday
            currentDay = localTimeEnd.getDay();
            for (i=0; (currentDay <= weekSeedList[i]) && (i < weekSeedList.length); i++) {
                localTimeStart.day(weekSeedList[i]);
                localTimeEnd.day(weekSeedList[i]);

                if(localTimeEnd.isSameOrBefore(dateEnd)) {
                    pushTimeSlotToList(dateList, localTimeStart, localTimeEnd);
                }else{
                    return dateList;
                }
            }

            //next scheduled week
            do {
                localTimeStart.add(schedule.recurInterval, 'weeks'); //go to the next scheduled week via schedule.recurInterval
                localTimeEnd.add(schedule.recurInterval, 'weeks');

                //notes: localTimeStart and localTimeEnd may start from any days of the next scheduled week
                localTimeStart.day(weekSeedList[0]);   //need to go back to first scheduled day of next scheduled week
                localTimeEnd.day(weekSeedList[0]);

                for (i = 0; (i < weekSeedList.length) && (localTimeEnd.isSameOrBefore(dateEnd));) {
                    pushTimeSlotToList(dateList, localTimeStart, localTimeEnd);

                    localTimeStart.day(weekSeedList[i++]);
                    localTimeEnd.day(weekSeedList[i++]);
                }
            }while(localTimeEnd.isSameOrBefore(dateEnd));

        }

        logger.info("calculated seed days for a weekly event : " + JSON.stringify(weekSeedList));
        logger.info("calculated days for a recurring event : " + JSON.stringify(dateList));

        return dateList;
    }

    function pushTimeSlotToList(dList, startT, endT){
        dList.push({
            timeStart: startT.toISOString(),
            timeEnd: endT.toISOString()
        });
    }
})();

