/**
 * Created by alex on 8/26/16.
 */
(function() {
    'use strict';

    var myMongo = require('../dbConnect.js');
    var logger = require('../../util/logger.js');
    var dataService = require('./availTime.dataService.js');
    var moment= require('moment');

    module.exports.queryAvailTimeListByPageGetHandler = queryAvailTimeListByPageGetHandler;
    module.exports.cancelBookedSessionById=cancelBookedSessionById;
    //module.exports.queryAvailTimeGetHandler = queryAvailTimeGetHandler;
    module.exports.bookSessionPostHandler=bookSessionPostHandler;
    module.exports.bookedSessionDetailGetHandler=bookedSessionDetailGetHandler;

    function queryAvailTimeListByPageGetHandler(req, res){
        logger.info("Step into the queryAvailTimeGetHandler and the req query string is " + JSON.stringify(req.query));

        // earliestStartTime: startDateTimeLocalIsoStr,
        // latestEndTime: endDateTimeLocalIsoStr,
        // unitNumber: vm.unitNumber,
        // preferredInstructorName: vm.preferredInstructorName
        // vm.queryCriteria.newPageNumber = newPageNumber;
        // vm.queryCriteria.oldPageNumber = oldPageNumber;
        // vm.queryCriteria.itemsPerPage = vm.itemsPerPage;
        // vm.queryCriteria.idOf1stRecordOnCurrentPage = null;  if it's first time to load the data

        //Todo:  unitNumber should be enable for better users' convenience later
        //thought (earliestStarTime, latestEndTime, unitNumber),  check if unitNumber is less than the duration between earliestStarTime and latestEndTime,
        // ===> (earliestStartTime, earliestEndTime) and (latestStartTime, latestEndTime)
        // earliestEndTime is earliestStartTime plus unitNumber * unitMinutes
        // latestStartTime is latestEndTime subtract unitNumber * unitMinutes
        // BTW,  maybe consider 'interval tree', and some bookmarks in Chrome under 'interval search' folder
        dataService.getAvailTimeForBookingByPage(
            moment.utc(req.query.earliestStartTime).toDate(),
            moment.utc(req.query.latestEndTime).toDate(),
            parseInt(req.query.unitNumber),
            req.query.preferredInstructorName,
            parseInt(req.query.itemsPerPage),
            parseInt(req.query.newPageNumber),
            parseInt(req.query.oldPageNumber),
            req.query.idOf1stRecordOnCurrentPage,
            getAvailTimeCallback);

        function getAvailTimeCallback(err, result){
            if(err){
                return res.status(500).send({error: err.message});
            }

            logger.info("before req.send() in booking handlers, the available time records for booking is " + JSON.stringify(result));
            // var timeSlotList = generateTimeSlotList(docs);
            // return res.send(timeSlotList);
            return res.status(200).json(result);  //{pageData: docsArray by page, totalCount: integer}
        }
    }

    function cancelBookedSessionById(req, res){
        dataService.cancelBookedSessionById(req.params._id, cancelBookedSessionCb);

        function cancelBookedSessionCb(err, bookedRecord){
            if(err){
                return res.status(500).send({error: err.message});
            }

            return res.status(200);
        }
    }

    function bookedSessionDetailGetHandler(req, res){
        dataService.getBookedSessionDetailById(req.params._id, getSessionDetailCallback);

        function getSessionDetailCallback(err, doc){
            if(err){
                return res.status(500).send({error: err.message});
            }

            return res.status(200).json(doc);
        }
    }

    function bookSessionPostHandler(req, res){
        // definition of postData
        // {
        // recordId: confirmedRecord._id,
        // recordTimeStart: confirmedRecord.timeStart,
        // recordTimeEnd: confirmedRecord.timeEnd,
        // studentName: studentName,
        // reqExactTimeStart: reqExactTimeStart,
        // reqExactTimeEnd: reqExactTimeEnd
        // }
        logger.info('req.body in bookSessionHandler is : ' + JSON.stringify(req.body));

        dataService.updateAvailTimeAsBooked(
            req.body.recordId,
            moment.utc(req.body.recordTimeStart).toDate(),
            moment.utc(req.body.recordTimeEnd).toDate(),
            req.body.studentName,
            moment.utc(req.body.reqExactTimeStart).toDate(),
            moment.utc(req.body.reqExactTimeEnd).toDate(),
            bookSessionCb);
        
        function bookSessionCb(err, bookedRecord){
            if(err){
                return res.status(500).send({error: err.message});
            }

            return res.status(200).json(bookedRecord);
        }
    }

    // function queryAvailTimeGetHandler(req, res){
    //     logger.info("Step into the queryAvailTimeGetHandler and the req query string is " + JSON.stringify(req.query));
    //     logger.info("the passed req.query strings are : earliestStartTime=%s : latestEndTime=%s : unitNumber=%s : preferredInstructorName=%s ", req.query.earliestStartTime, req.query.latestEndTime, req.query.unitNumber, req.query.preferredInstructorName);
    //
    //     // earliestStartTime: startDateTimeUtcStr,
    //     // latestEndTime: endDateTimeUtcStr,
    //     // unitNumber: vm.unitNumber,
    //     // preferredInstructorName: vm.preferredInstructorName
    //
    //     //Todo:  unitNumber should be enable for better users' convenience
    //     //thought (earliestStarTime, latestEndTime, unitNumber),  check if unitNumber is less than the duration between earliestStarTime and latestEndTime,
    //     // ===> (earliestStartTime, earliestEndTime) and (latestStartTime, latestEndTime)
    //     // earliestEndTime is earliestStartTime plus unitNumber * unitMinutes
    //     // latestStartTime is latestEndTime subtract unitNumber * unitMinutes
    //     // BTW,  maybe consider 'interval tree', and some bookmarks in Chrome under 'interval search' folder
    //     dataService.getAvailTimeForBooking(
    //         moment(req.query.earliestStartTime).toDate(),
    //         moment(req.query.latestEndTime).toDate(),
    //         req.query.unitNumber,
    //         req.query.preferredInstructorName,
    //         getAvailTimeCallback);
    //
    //     function getAvailTimeCallback(err, docs){
    //         if(err){
    //             return res.status(500).send({error: err.message});
    //         }
    //
    //         logger.info("before req.send() in booking handlers, the available time records for booking is " + JSON.stringify(docs));
    //         // var timeSlotList = generateTimeSlotList(docs);
    //         // return res.send(timeSlotList);
    //         return res.status(200).json(docs);
    //     }
    // }

})();