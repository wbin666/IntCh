/**
 * Created by alex on 8/26/16.
 */
(function() {
    'use strict';

    var myMongo = require('../dbConnect.js');
    var logger = require('../../util/logger.js');
    var dataService = require('./availTime.dataService.js');

    module.exports.queryAvailTimeGetHandler = queryAvailTimeGetHandler;

    function queryAvailTimeGetHandler(req, res){
        //return res.status(200).json("alex dummy response");
        logger.info("Step into the queryAvailTimeGetHandler");
        logger.info("Step into the queryAvailTimeGetHandler and the req query string is " + JSON.stringify(req.query));
        logger.info("Step into the queryAvailTimeGetHandler and the req params string is " + JSON.stringify(req.params));

        logger.info("the passed req.query strings are : selectedDate= %s : earlistStartTime=%s : latestEndTime=%s : unitNumber=%s", req.query.date, req.query.earlistStartTime, req.query.latestEndTime, req.query.unitNumber);
        logger.info("the passed req.params strings are : selectedDate= %s : earlistStartTime=%s : latestEndTime=%s : unitNumber=%s", req.params.date, req.params.earlistStartTime, req.params.latestEndTime, req.params.unitNumber);

        // date: vm.dateModel.toISOString().substring(0, 10),
        // earlistStartTime: vm.earliestStartTimeModel,
        // latestEndTime: vm.latestEndTimeModel,
        // unitNumber: vm.unitNumber
        dataService.getAvailTimeForBooking(
            req.query.date,
            req.query.earlistStartTime,
            req.query.latestEndTime,
            req.query.unitNumber,
            getAvailTimeCallback);

        function getAvailTimeCallback(err, docs){
            if(err){
                return res.status(500).send({error: err.message});
            }

            logger.info("before req.send() in booking handlers, the available time records for booking is " + JSON.stringify(docs));
            // var timeSlotList = generateTimeSlotList(docs);
            // return res.send(timeSlotList);
            return res.status(200).json(docs);
        }
    }

})();