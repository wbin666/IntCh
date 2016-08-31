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

    router.route('/booking/availTime')
        .get(jsonParser, bookingHandlers.queryAvailTimeGetHandler);

    // router.get('/hello', function(req, res) {
    //     var responseText = 'Hello Alex';
    //     responseText += 'Requested at : ' + req.requestTime + '';
    //     res.send(responseText);
    // });
    //
    // router.post('/availtime', function(req, res){
    //     res.send('Got a POST request');
    // });
    //
    // router.put('/user', function(req, res) {
    //     res.send('Got a PUT request at /user');
    // });
    //
    // router.delete('/user', function(req, res) {
    //     res.send('Got a DELETE request at /user');
    // });

    module.exports = router;

})();