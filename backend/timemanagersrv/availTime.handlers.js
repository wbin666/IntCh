/**
 * Created by alex on 6/14/16.
 */
'use strict';

var myMongo = require('../dbConnect.js');
var logger = require('../../util/logger.js');
var dataService = require('./availTime.dataService.js');

module.exports.availTimePostHandler=availTimePostHandler;
module.exports.availTimeGetHandler=availTimeGetHandler;

function availTimeGetHandler(req, res){
    dataService.getAvailTimeByDateRange(req.query.start, req.query.end, getAvailTimeCallback);

    function getAvailTimeCallback(err, docs){
        if(err){
            return res.status(500).send({error: err.message});
        }
        return res.send(docs);
    }
}

// function availTimePostHandler(req, res){
//     if(!req.body) return res.sendStatus(400);
//
//     logger.info("the received PostData is : " + JSON.stringify(req.body));
//
//     myMongo.langExDB.collection("availableSchedules").insertOne(req.body, function(err, result){
//         if(err) {
//             throw new Error("Failed to insert a schedule : " + JSON.stringify(req.body));
//         }
//         logger.info("Number of the inserted schedule : %s and the insertedId : %s or insertedIds : %s", result.insertedCount, result.insertedId, result.insertedIds);
//         logger.info("Inserted a schedule : " + JSON.stringify(req.body));
//
//         var physicalRecords = genPhysicalRecords(req.body, result.insertedId);
//         myMongo.langExDB.collection("availableTimeRecords").insertMany(physicalRecords, function(err, result){
//             if(err){
//                 throw new Error("Failed to insert a generated physicsl records of a schedule : " + JSON.stringify(req.body));
//             }
//
//             logger.info("Number of the inserted physical records : %s and the insertedId : %s or insertedIds : %s", result.insertedCount, result.insertedId, result.insertedIds);
//             logger.info("Inserted the generated physical records" + JSON.stringify(physicalRecords));
//
//             res.send("Successfully inserted the schedule and physical records");
//         });
//     });
//
// }

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
        
        dataService.insertManyGenPhysicalRecords(physicalRecords, insertPhysicalRecordsCallback);
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
        individualRecord={availableDate: dateList[i].toISOString().substring(0,10), timeStart: schedule.timeStart, timeEnd: schedule.timeEnd, scheduelId: scheduleId};
        physicalRecords.push(individualRecord);
    }

    logger.info("generated physical records before inserting: " + JSON.stringify(physicalRecords));

    return physicalRecords;
}

function getDateList(schedule){
    var dateList = [];
    var weekSeedList = [];
    var dateToBe, dateEnd;
    var dateStartArray, dateEndArray;
    var i, j, Days;

    //just as a reference, copied from front-end/OpenAvailTimeCtrl.js
    // var postData= {
    //     "timeStart" : startDateCopy.toISOString().substring(11,16),      //string, "09:30", UTC
    //     "timeEnd" : endDateCopy.toISOString().substring(11,16),         //string, "18:30", UTC
    //     "recurFreq" : $scope.repeatFreq,                                //string, "daily" or "weekly"
    //     "recurInterval" : parseInt(recurInterval, 10),                  //integer, 1,2,3,4
    //     "recurByDay" : recurByDay,                                      //integer, bitwise for operation
    //     "schDateStart" : startDateCopy.toISOString().substring(0,10),   //string, "2016-06-16", UTC
    //     "schDateEnd" : endDateCopy.toISOString().substring(0,10)         //string, "2016-09-16", UTC
    // };

    dateStartArray = schedule.schDateStart.split("-");
    dateEndArray = schedule.schDateEnd.split("-");

    // Month:  An integer between 0 and 11 representing the month
    dateToBe = new Date(Date.UTC(dateStartArray[0], parseInt(dateStartArray[1])-1, dateStartArray[2]));    // to create a UTC date with zero time  2016-06-21T00:00:00.000Z
    dateEnd = new Date(Date.UTC(dateEndArray[0], parseInt(dateEndArray[1])-1, dateEndArray[2]));

    logger.info("dateStartArray is : " + dateStartArray);
    logger.info("dateEndArray is : " + dateEndArray);

    logger.info("dateToBe is : typeof: %s, value: %s, JSON.stringify(dateEnd): %s", typeof dateEnd, dateEnd, JSON.stringify(dateEnd));
    if(schedule.recurFreq === 'daily'){
        for(i=1; dateToBe <= dateEnd; i++) {
            logger.info("dateToBe is : typeof: %s, value: %s, JSON.stringify(dateToBe): %s", typeof dateToBe, dateToBe, JSON.stringify(dateToBe));
            dateList.push(dateToBe);

            //make a date copy to ensure the time is T00:00:00 000Z, so to include the date of dateEnd
            dateToBe = new Date(dateToBe.getTime());
            dateToBe.setUTCDate(dateList[dateList.length - 1].getUTCDate() + schedule.recurInterval);
        }
    }else if(schedule.recurFreq === 'weekly') {
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

        for (j = 0; j < Days.length; j++) {
            if ((schedule.recurByDay & Days[j].value) === Days[j].value) {
                Days[j].selected = true;
            }
        }

        //schedule.recurInterval

        //first Week,  may not start from Sunday,  maybe start from the middle of week, i.e. Wednesday
        j = dateToBe.getDay();
        for (; (dateToBe <= dateEnd) && (j < Days.length); j++) {
            if (Days[j].selected === true) {
                dateList.push(dateToBe);
            }

            dateToBe = new Date(dateToBe.getTime());
            dateToBe.setUTCDate(dateToBe.getUTCDate() + 1);
            //when finally exit, the dateToBe will next Sunday
        }

        // ======= Approach 1: next available week,  dateToBe start from Sunday

        //look for 1st day (Sunday) of the next available week via schedule.recurInterval
        dateToBe.setUTCDate(dateToBe.getUTCDate() + (schedule.recurInterval - 1) * 7);

        j = dateToBe.getDay();   //j=0 since it's sunday now)
        for (; (dateToBe <= dateEnd) && (j < Days.length); j++) {
            if (Days[j].selected === true) {
                weekSeedList.push(dateToBe);   // keep a seed of a week's selected days.
                dateList.push(dateToBe);
            }

            dateToBe = new Date(dateToBe.getTime());
            dateToBe.setUTCDate(dateToBe.getUTCDate() + 1);
            //when finally exit, the dateToBe will next Sunday
        }

        for(j=1; dateToBe <= dateEnd; j++) {
            for (i = 0; i < weekSeedList.length; i++) {
                dateToBe = new Date(weekSeedList[i].getTime());
                dateToBe.setUTCDate(dateToBe.getUTCDate() + j * schedule.recurInterval * 7);

                if (dateToBe <= dateEnd) {
                    dateList.push(dateToBe);
                }
            }
        }

        // =======Approach 1:  next available week, dateToBe start from Sunday
        // while (dateToBe <= dateEnd) {
        //     //look for 1st day (Sunday) of the next available week via schedule.recurInterval
        //     dateToBe.setUTCDate(dateToBe.getUTCDate() + (schedule.recurInterval - 1) * 7);
        //
        //     j = dateToBe.getDay();   //j=0 since it's sunday now)
        //     for (; (dateToBe <= dateEnd) && (j < Days.length); j++) {
        //         if (Days[j].selected === true) {
        //             dateList.push(dateToBe);
        //         }
        //
        //         dateToBe = new Date(dateToBe.getTime());
        //         dateToBe.setUTCDate(dateToBe.getUTCDate() + 1);
        //         //when finally exit, the dateToBe will next Sunday
        //     }
        // }
    }

    logger.info("calculated seed days for a weekly event : " + JSON.stringify(weekSeedList));
    logger.info("calculated days for a recurring event : " + JSON.stringify(dateList));

    return dateList;
}

