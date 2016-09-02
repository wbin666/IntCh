/**
 * Created by alex on 6/8/16.
 */
(function(){
    'use strict';

    var myMongo = require('../dbConnect.js');
    var logger = require('../../util/logger.js');

    module.exports.getAvailTimeByDateRange = getAvailTimeByDateRange;
    module.exports.insertOneAvailSchedule = insertOneAvailSchedule;
    module.exports.insertManyGenPhysicalRecords = insertManyGenPhysicalRecords;
    module.exports.getAvailTimeForBooking = getAvailTimeForBooking;

    function getAvailTimeByDateRange(startDate, endDate, cb){
        myMongo.langExDB.collection("availableTimeRecords")
            .find({timeStart : {$gte: startDate}, timeEnd : {$lte: endDate}}, {timeStart:1, timeEnd:1})
            .toArray()
            .then(function(docs){
                logger.info("all of availableTimeRecords are : " + JSON.stringify(docs));
                return cb(null, docs);
            })
            .catch(function(err){
                logger.info("Failed to get the availableTimeRecords and the error detail is : " + err.stack);
                return cb(err, null);
            });
    }

    function insertOneAvailSchedule(availSchedule, cb){
        myMongo.langExDB.collection("availableSchedules")
            .insertOne(availSchedule, function(err, result){
                if(err) {
                    logger.info("Failed to insert a schedule : " + JSON.stringify(availSchedule));
                    logger.info("the detail error is : " + err.stack);
                    return cb(err, result);
                }

                logger.info("Number of the inserted schedule : %s and the insertedId : %s or insertedIds : %s", result.insertedCount, result.insertedId, result.insertedIds);
                logger.info("Inserted a schedule : " + JSON.stringify(availSchedule));

                return cb(null, result);
        });
    }

    function insertManyGenPhysicalRecords(physicalRecords, cb){
        myMongo.langExDB.collection("availableTimeRecords")
            .insertMany(physicalRecords, function(err, result){
                if(err){
                    logger.info("Failed to insert the generated physicsl records of a schedule and the error is : " + err.stack);
                    return cb(err, result);
                }

                logger.info("Number of the inserted physical records : %s and the insertedId : %s or insertedIds : %s", result.insertedCount, result.insertedId, result.insertedIds);
                logger.info("Inserted the generated physical records" + JSON.stringify(physicalRecords));

                return cb(null, result); // Successfully inserted the schedule and physical records
            });
    }

    function getAvailTimeForBooking(earlistStartTime, latestEndTime, unitNumber, preferredInstructorName, cb){
        logger.info("the passed parameters are : earlistStartTime=%s : latestEndTime=%s : unitNumber=%s", earlistStartTime, latestEndTime, unitNumber);

        //todo: need to handle unitNumber when enabling it later.

        var queryObj = { timeStart : {$lte: earlistStartTime}, timeEnd : {$gte: latestEndTime}};
        // if(preferredInstructorName){
        //     queryObj.username
        // }

        myMongo.langExDB.collection("availableTimeRecords")
            .find({timeStart : {$lte: earlistStartTime}, timeEnd : {$gte: latestEndTime}}, {timeStart:1, timeEnd:1})
            .toArray()
            .then(function(docs){
                logger.info("all of availableTimeRecords for booking are : " + JSON.stringify(docs));
                return cb(null, docs);
            })
            .catch(function(err){
                logger.info("Failed to get the availableTimeRecords and the error detail is : " + err.stack);
                return cb(err, null);
            });
    }

})();