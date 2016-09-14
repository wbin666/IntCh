/**
 * Created by alex on 5/24/16.
 */
(function(){
    'use strict';
    
    var express = require('express');
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    //var urlencodedParser = bodyParser.urlencoded({extended : false});
    var router = express.Router();
    var openingHandlers=require('./opening.handlers.js');
    var bookingHandlers = require('./booking.handlers.js');
    
    // for development
    // if(process.env.NODE_ENV ==='development') {
    //     router.use(function (req, res, next) {
    //         logger.info('LOGGED req.method: %s, req.url: %s, req.path: %s, POST body: %s, Routing Parameters: %s, and GET QueryString: %s ', req.method, req.url, req.path, req.body, JSON.stringify(req.params), JSON.stringify(req.query));
    //         next();
    //     });
    // }

    router.route('/openAvailTime')
        .get(openingHandlers.availTimeGetHandler)
        .post(jsonParser, openingHandlers.availTimePostHandler);

        // .put(function(req, res, next) {
        //     next(new Error('not implemented'));
        // })
        // .delete(function(req, res, next) {
        //     next(new Error('not implemented'));
        // });

    router.route('/availTime/deletes/timeRange')
        .post(jsonParser, openingHandlers.deleteMultipleAvailTimePostHandler);

    router.route('/availTime/deletes/wholeDay/:localDateStart/:localDateEnd')
        .delete(openingHandlers.deleteAvailTimeByWholeDayDeleteHandler);
    
    // router.route('/availTime/deletes/:resourceId')
    //     .get(openingHandlers.deleteAvailTimesResult);
    
    router.route('/booking/availTime')
        .post(jsonParser, bookingHandlers.bookSessionPostHandler);
//        .get(jsonParser, bookingHandlers.queryAvailTimeGetHandler);
    
    router.route('/booking/list/page')
        .get(jsonParser, bookingHandlers.queryAvailTimeListByPageGetHandler);
    
    router.route('/bookedSession/:_id')
        .get(bookingHandlers.bookedSessionDetailGetHandler);

    router.route('/bookedSession/cancel/:_id')
        .patch(jsonParser,bookingHandlers.cancelBookedSessionById);

    module.exports = router;

})();