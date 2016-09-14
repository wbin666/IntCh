/**
 * Created by alex on 6/8/16.
 */
(function(){
    'use strict';

    var myMongo = require('../dbConnect.js');
    var logger = require('../../util/logger.js');
    var ObjectId = require('mongodb').ObjectId;
    var async = require('async');

    var Const60Mins = 60 * 60 *1000;  //milliseconds for 60 minutes

    module.exports.getAvailTimeForBookingByPage = getAvailTimeForBookingByPage;
    module.exports.availTimeDeleteByDelTimeSlot = availTimeDeleteByDelTimeSlot;
    module.exports.cancelBookedSessionById = cancelBookedSessionById;
    module.exports.getBookedSessionDetailById = getBookedSessionDetailById;
    module.exports.updateAvailTimeAsBooked = updateAvailTimeAsBooked;
    module.exports.getAvailTimeByDateRange = getAvailTimeByDateRange;
    module.exports.insertOneAvailSchedule = insertOneAvailSchedule;
    module.exports.insertManyGenPhysicalRecords = insertManyGenPhysicalRecords;
    //module.exports.getAvailTimeForBooking = getAvailTimeForBooking;

    function getAvailTimeForBookingByPage(earliestStartTime, latestEndTime, unitNumber, preferredInstructorName,
                                          itemsPerPage, newPageNumber, oldPageNumber, idOf1stRecordOnCurrentPage, cb){
        //refer to: http://www.ovaistariq.net/404/mysql-paginated-displays-how-to-kill-performance-vs-how-to-improve-performance/#.V9YxLnV94xM
        //https://docs.mongodb.com/manual/reference/method/cursor.skip/
        //http://stackoverflow.com/questions/28377404/return-count-before-limit-and-skip-applied-with-mongoose
        //http://stackoverflow.com/questions/9703319/mongodb-ranged-pagination?noredirect=1&lq=1


        // logger.info('the passed parameters in availTime.dataService.js is : ' +
        //     'earliestStartTime : %s, ' +
        //     'latestEndTime : %s, ' +
        //     'unitNumber : %s, ' +
        //     'preferredInstructorName : %s, ' +
        //     'itemsPerPage : %s, ' +
        //     'newPageNumber : %s, ' +
        //     'oldPageNumber : %s, ' +
        //     'idOf1stRecordOnCurrentPage : %s, ',
        //     earliestStartTime, latestEndTime, unitNumber, preferredInstructorName,
        //     itemsPerPage, newPageNumber, oldPageNumber, idOf1stRecordOnCurrentPage
        // );
        //
        // logger.info("the type of earliestStartTime is : %s and JSON : " + JSON.stringify(earliestStartTime), typeof earliestStartTime);
        // logger.info("the type of latestEndTime is : %s and JSON : " + JSON.stringify(latestEndTime), typeof latestEndTime);
        // logger.info('the type of new Date() is : ' + typeof (new Date()));

        //todo: need to handle 'unitNumber' and 'instructor' when enabling it later.
        var total_count = 0;
        var queryObj;

        // if(preferredInstructorName){
        //     queryObj.username
        // }

        //http://stackoverflow.com/questions/9703319/mongodb-ranged-pagination?noredirect=1&lq=1
        if(newPageNumber >= oldPageNumber){               //forwards navigator
            //here js date object is provided instead of ISO string with UTC
            queryObj = {
                _id: {$gte: ObjectId(idOf1stRecordOnCurrentPage)},
                timeStart : {$lte: earliestStartTime},
                timeEnd : {$gte: latestEndTime},
                status: {$in: [null, 'cancelled']}
            };

            // myMongo.langExDB.collection("availableTimeRecords")
            //     .find({_id: {$gte: ObjectId('000000000000000000000000')}, timeStart: {$lte: new Date('2016-09-16T11:00:00+08:00')}, timeEnd:{$gte: new Date('2016-09-16T12:00:00+08:00')}})
            //     .skip(0)
            //     .limit(10)
            //     .sort({'_id':1})
            //     .toArray(function (err, postPageData) {
            //         logger.info("the test 002 page data is : " + JSON.stringify(postPageData));
            //     });

            async.parallel([getPostPageData, getTotalCount],asyncCallback);

        }else if(newPageNumber < oldPageNumber){            //backwards navigator
            queryObj = {
                _id: {$lt: ObjectId(idOf1stRecordOnCurrentPage)},
                timeStart : {$lte: earliestStartTime},
                timeEnd : {$gte: latestEndTime},
                status: {$in: [null, 'cancelled']}
            };

            async.parallel([getPrePageData, getTotalCount], asyncCallback);
        }

        //newPageNumber > oldPageNumber
        //         // go to page current+N
        //         db.collection.find({_id: {$gte: current_id}}).
        //         skip(N * page_size).
        //         limit(page_size).
        //         sort({_id: 1});
        function getPostPageData(callback) {
            myMongo.langExDB.collection("availableTimeRecords")
                .find(queryObj, {timeStart: 1, timeEnd: 1})
                .skip((newPageNumber - oldPageNumber) * itemsPerPage)
                .limit(itemsPerPage)
                .sort({'_id': 1})
                .toArray(function (err, postPageData) {
                    logger.info("the post page data is : " + JSON.stringify(postPageData));
                    return callback(err, postPageData);
                });
        }
        //newPageNumber < oldPageNumber
        // // go to page current-N
        // // note that due to the nature of skipping back,
        // // this query will get you records in reverse order
        // // (last records on the page being first in the resultset)
        // // You should reverse them in the app.
        function getPrePageData(callback) {
            myMongo.langExDB.collection("availableTimeRecords")
                .find(queryObj, {timeStart:1, timeEnd:1})
                .skip((oldPageNumber - newPageNumber-1) * itemsPerPage)
                .limit(itemsPerPage)
                .sort({'_id': -1})
                .toArray(function(err, prePageData){
                    logger.info("the previous page data is : " + JSON.stringify(prePageData));
                    prePageData.reverse();
                    return callback(err, prePageData);
                });
        }

        function getTotalCount(callback){
            getTotalCount = myMongo.langExDB.collection("availableTimeRecords")
                .find(queryObj)
                .count(function(err, count){
                    return callback(err, count);
                });
        }

        function asyncCallback(err, results){
            if(err){
                return cb(err, null);
            }

            return cb(null, {pageData: results[0], totalCount: results[1]});
        }
    }

    //todo: enable 'userId' in filter after enabling the security
    function availTimeDeleteByDelTimeSlot(deleteByOneTimeSlot, delSelectionTrack, cb){
        var bulkActionArray=[];
        var i;
        //var Const60Mins = 60 * 60 *1000;  //milliseconds for 60 minutes
        var delTimeStartInt = deleteByOneTimeSlot.timeStart.getTime();
        var delTimeEndInt = deleteByOneTimeSlot.timeEnd.getTime();
        var recordTimeStartInt;
        var recordTimeEndInt;
        var filter4ConcurrencyCtrl;

        deleteByOneTimeSlot.delStatus = "Deleting";

        if(delTimeStartInt >= delTimeEndInt){
            deleteByOneTimeSlot.delStatus = "Failed: invalid interval";

            return cb(new Error("Error : Start Time should be earlier than End Time when requesting to remove some opened available times. "), null);
        }

        //http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
        //Q: Given two date ranges, what is the simplest or most efficient way to determine whether the two date ranges overlap?
        //    As an example, suppose we have ranges denoted by DateTime variables StartDate1 to EndDate1 and StartDate2 to EndDate2.
        //A: (StartA <= EndB) and (EndA >= StartB).
        // Here let take 'Avail Time Range in db' as A and  'Delete Range (passed-in parameters)' as B,

        //to find all the docs that are overlap with passed delete range
        //todo: use hint('index_name') to improve the query performance after creating the index on (timeStart, timeEnd)
        myMongo.langExDB.collection("availableTimeRecords")
            .find(
                {
                    timeStart : {$lte: deleteByOneTimeSlot.timeEnd},
                    timeEnd : {$gte: deleteByOneTimeSlot.timeStart},
                    status: {$in: [null, 'cancelled']}
                },
                {timeStart:1, timeEnd:1})
            .toArray(function(err, docs){
                if(err){
                    return cb(err, null);
                }

                //refer to 'Allen's Interval Algebra' section of the link: http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
                // or the 'PeriodRelation' section
                //deleting range is A
                //record range is B and Bx
                for(i=0; i< docs.length; i++){
                    recordTimeStartInt = docs[i].timeStart.getTime();
                    recordTimeEndInt = docs[i].timeEnd.getTime();

                    //concurrency control: https://docs.mongodb.com/manual/core/write-operations-atomicity/
                    //Another approach is to specify the expected current value of a field in the query predicate for the write operations.
                    //In my understanding, add the key current values to query/filter string. If the record is changed in the key fields, so no update will be performed.
                    //the keys are _id, timeStart, timeEnd, status
                    filter4ConcurrencyCtrl = {
                        _id: docs[i]._id,
                        timeStart: docs[i].timeStart,
                        timeEnd: docs[i].timeEnd,
                        status: {$in: [null, 'cancelled']}
                    };

                    //"recordTimeStartInt >= recordTimeEndInt" means it's not an valid range in record, so it should be removed
                    //B7 (same range), B6, B9 B10
                    if((recordTimeStartInt >= recordTimeEndInt) || ((recordTimeStartInt >= delTimeStartInt) && (recordTimeEndInt <= delTimeEndInt))){
                        bulkActionArray.push({
                            deleteOne: {
                                filter: filter4ConcurrencyCtrl
                            }
                        });
                        continue;
                    }
                    // range B3 & B4
                    if((recordTimeStartInt < delTimeStartInt) && (recordTimeEndInt > delTimeStartInt) && (recordTimeEndInt <=delTimeEndInt)){
                        if((delTimeStartInt - recordTimeStartInt)>= Const60Mins) {
                            bulkActionArray.push({
                                updateOne: {
                                    filter: filter4ConcurrencyCtrl,
                                    update: {$set: {timeEnd: deleteByOneTimeSlot.timeStart}}
                                }
                            });
                        }else{
                            bulkActionArray.push({
                                deleteOne: {
                                    filter: filter4ConcurrencyCtrl
                                }
                            });
                        }
                        continue;
                    }
                    //range B5
                    if((recordTimeStartInt < delTimeStartInt) && (recordTimeEndInt > delTimeEndInt)){
                        //2 sides:  difference >=60 mins  to  reserve it.  otherwise to remove it
                        if((delTimeStartInt - recordTimeStartInt)>= Const60Mins) {
                            bulkActionArray.push({
                                updateOne: {
                                    filter: filter4ConcurrencyCtrl,
                                    update: {$set: {timeEnd: deleteByOneTimeSlot.timeStart}}
                                }
                            });
                            if((recordTimeEndInt - delTimeEndInt) >= Const60Mins) {
                                bulkActionArray.push({
                                    insertOne: {  // Todo: is there a method to clone the original record and update its _id, timeStart, timeEnd, etc
                                        document: {timeStart: deleteByOneTimeSlot.timeEnd, timeEnd: docs[i].timeEnd, userId: delSelectionTrack.username}     // add userId for any new records
                                    }
                                });
                            }
                        } else if((recordTimeEndInt - delTimeEndInt) >= Const60Mins) {
                            bulkActionArray.push({
                                updateOne: {
                                    filter: filter4ConcurrencyCtrl,
                                    update: {$set: {timeStart: deleteByOneTimeSlot.timeEnd}}
                                }
                            });
                        }else{
                            bulkActionArray.push({
                                deleteOne: {
                                    filter: filter4ConcurrencyCtrl
                                }
                            });
                        }

                        continue;
                    }
                    //range B8, B11
                    if((recordTimeStartInt >= delTimeStartInt) && (recordTimeStartInt < delTimeEndInt) && (recordTimeEndInt > delTimeEndInt)){
                        //time difference >=60,   reserve(delTimeEndInt, recordTimeEndInt)
                        if((recordTimeEndInt > delTimeEndInt) >=Const60Mins){
                            bulkActionArray.push({
                                updateOne: {
                                    filter: filter4ConcurrencyCtrl,
                                    update: {$set: {timeStart: deleteByOneTimeSlot.timeEnd}}
                                }
                            });
                        }else{
                            bulkActionArray.push({
                                deleteOne: {
                                    filter: filter4ConcurrencyCtrl
                                }
                            });
                        }

                        continue;
                    }
                    //Notes: B1, B2, B12, B13 is out of the deleting range A
                }

                //execute the bulkWrite in parallel via {ordered: false}
                //refer to : https://docs.mongodb.com/manual/core/bulk-write-operations/
                myMongo.langExDB.collection("availableTimeRecords")
                    .bulkWrite(
                        bulkActionArray,
                        {ordered: false},
                        function(err, result){
                            if(err){
                                deleteByOneTimeSlot.delStatus='Failed';
                                return cb(err, result, delSelectionTrack);
                            }

                            deleteByOneTimeSlot.delStatus='Deleted';
                            return cb(null, result, delSelectionTrack);
                        }
                    );
            });
    }

    function cancelBookedSessionById(_id, cb){
        //todo:  need to check and merge the released timeslot with its neighoubors. but keep the cancelled record for tracking purpose, and not shown in myCalendar
        //todo: need to send a notification to both instructor and student for the cancelling with cancel reason.
        myMongo.langExDB.collection("availableTimeRecords")
            .findOneAndUpdate({_id: ObjectId(_id)},
                {
                    $set: {
                        status : 'cancelled'
                    }
                })
            .then(function(response){
                logger.info("the response of cancelling a booked record is : " + JSON.stringify(response));
                return cb(null, 'Cancelled successfully');
            })
            .catch(function(err){
                logger.info('Failed to update the record for booking : ' + err.stack);
                return cb(err, null);
            });
    }

    function getBookedSessionDetailById(_id, cb){
        //todo: need to split the timeslot if the opened timeslot is bigger than the booked timeslot
        logger.info('start to query a session detail with _id : ' + _id);
        myMongo.langExDB.collection("availableTimeRecords")
            .find({_id: ObjectId(_id)})
            .limit(1)
            .next(function(err, doc){
                cb(err, doc);
            });
    }

    function updateAvailTimeAsBooked(recordId, recordTimeStart, recordTimeEnd, studentName, reqExactTimeStart, reqExactTimeEnd, cb) {
        var recordTimeStartInt = recordTimeStart.getTime();
        var recordTimeEndInt = recordTimeEnd.getTime();
        var reqTimeStartInt = reqExactTimeStart.getTime();
        var reqTimeEndInt = reqExactTimeEnd.getTime();

        var filter4ConcurrencyCtrl = {
            _id: ObjectId(recordId),
            timeStart: recordTimeStart,
            timeEnd: recordTimeEnd,
            status: {$in: [null, 'cancelled']}
        };

        var updateOperatorObj = {
            $set: {
                //timeStart: reqExactTimeStart
                //timeEnd: reqExactTimeEnd,
                studentName : studentName,
                status : 'booked'
            }
        };

        var insertOperatorArray = [];

        //http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
        //A as request time range, B as available time range in physical record
        //B4, B5, B7, B8 is valid for this case
        if((recordTimeStartInt < reqTimeStartInt) && (recordTimeEndInt > reqTimeEndInt)){    //B5
            //more fields and values should be updated
            updateOperatorObj.$set.timeStart = reqExactTimeStart; // change 'timeStart'
            updateOperatorObj.$set.timeEnd = reqExactTimeEnd;     // change 'timeEnd'

            if((reqTimeStartInt - recordTimeStartInt) > Const60Mins) {    // to split the original record range and insert a new one after booking
                insertOperatorArray.push({
                    //username:
                    //scheduleId
                    timeStart: recordTimeStart,
                    timeEnd: reqExactTimeStart
                });
            }

            if((recordTimeEndInt - reqTimeEndInt) > Const60Mins) {    // to split the original record range and insert a new one after booking
                insertOperatorArray.push({
                    //username:
                    //scheduleId
                    timeStart: reqExactTimeEnd,
                    timeEnd: recordTimeEnd
                });
            }

        }else if((recordTimeStartInt < reqTimeStartInt) && (recordTimeEndInt === reqTimeEndInt)){  //B4
            //more field and value should be updated
            updateOperatorObj.$set.timeStart = reqExactTimeStart; // change 'timeStart'

            if((reqTimeStartInt - recordTimeStartInt) > Const60Mins) {    // to split the original record range and insert a new one after booking
                insertOperatorArray.push({
                    //username:
                    //scheduleId:
                    timeStart: recordTimeStart,
                    timeEnd: reqExactTimeStart
                });
            }

        }else if((recordTimeStartInt === reqTimeStartInt) && (recordTimeEndInt > reqTimeEndInt)) {  //B8
            //more field and value should be updated
            updateOperatorObj.$set.timeEnd = reqExactTimeEnd;  // change 'timeEnd'

            if((recordTimeEndInt - reqTimeEndInt) > Const60Mins) {    // to split the original record range and insert a new one after booking
                insertOperatorArray.push({
                    //username:
                    //scheduleId
                    timeStart: reqExactTimeEnd,
                    timeEnd: recordTimeEnd
                });
            }

        }else if((recordTimeStartInt === reqTimeStartInt) && (recordTimeEndInt === reqTimeEndInt)){   // B7
            // updateOperatorObj has included the fields to be updated:  studentName and status
            // updateOperatorObj = {
            //     $set: {
            //         studentName : studentName,
            //         status : 'booked'
            //     }
            // };
        }

        myMongo.langExDB.collection("availableTimeRecords")
            .findOneAndUpdate(
                filter4ConcurrencyCtrl,
                updateOperatorObj,
                {
                    returnOriginal: false
                })
            .then(function(response){
                logger.info("the booked record is : " + JSON.stringify(response));

                //to insert the split records if any.
                if(insertOperatorArray.length > 0) {
                    myMongo.langExDB.collection("availableTimeRecords")
                        .insertMany(insertOperatorArray, function(insertErr, result){
                            if(insertErr){
                                logger.info('Error occurred while inserting new split records after booking : ' + insertErr.stack);
                            }
                        });
                }

                return cb(null, response.value);  //response.value is the updated record for detailed page to show
            })
            .catch(function(err){
                logger.info('Failed to update the record for booking : ' + err.stack);
                return cb(err, null);
            });

        // myMongo.langExDB.collection("availableTimeRecords")
        //     .findOneAndUpdate(filter4ConcurrencyCtrl,
        //         {
        //             $set: {
        //                 studentName : postData.studentName,
        //                 status : 'booked'
        //             }
        //         },
        //         {
        //             returnOriginal: false
        //         })
        //     .then(function(response){
        //         logger.info("the booked record is : " + JSON.stringify(response));
        //         return cb(null, response.value);  //response.value is the updated record for detailed page to show
        //     })
        //     .catch(function(err){
        //         logger.info('Failed to update the record for booking : ' + err.stack);
        //         return cb(err, null);
        //     });
    }

    function getAvailTimeByDateRange(startDate, endDate, cb){
        myMongo.langExDB.collection("availableTimeRecords")
            .find({timeStart : {$gte: startDate}, timeEnd : {$lte: endDate}}, {timeStart:1, timeEnd:1, status:1})
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

    // function getAvailTimeForBooking(earlistStartTime, latestEndTime, unitNumber, preferredInstructorName, cb){
    //     logger.info("the passed parameters are : earlistStartTime=%s : latestEndTime=%s : unitNumber=%s", earlistStartTime, latestEndTime, unitNumber);
    //
    //     //todo: need to handle unitNumber when enabling it later.
    //
    //     //here js date object is provided instead of ISO string with UTC
    //     var queryObj = { timeStart : {$lte: earlistStartTime}, timeEnd : {$gte: latestEndTime}};
    //     // if(preferredInstructorName){
    //     //     queryObj.username
    //     // }
    //
    //     myMongo.langExDB.collection("availableTimeRecords")
    //         .find({timeStart : {$lte: earlistStartTime}, timeEnd : {$gte: latestEndTime}}, {timeStart:1, timeEnd:1})
    //         .toArray()
    //         .then(function(docs){
    //             logger.info("all of availableTimeRecords for booking are : " + JSON.stringify(docs));
    //             return cb(null, docs);
    //         })
    //         .catch(function(err){
    //             logger.info("Failed to get the availableTimeRecords and the error detail is : " + err.stack);
    //             return cb(err, null);
    //         });
    // }

})();