/**
 * Created by alex on 4/20/16.
 */
'use strict';

var express = require('express');
var app =express();
var port = process.env.PORT || 3000;
var logger=require('../util/logger.js');
var apiRoutes=require('./timemanagersrv/timeManagerApiRoutes.js');
var myMongo = require('./dbConnect.js');

//Passport
var passport = require('passport');
require('./authSrv/passport.js')(passport); // pass passport for configuration

//for all environment
app.use(require('morgan')('combined')); // or app.use(require('express-bunyan-logger')());  // more details when comparing to morgan

/////////////////
//Cookie and session
//Todo: maybe (not sure) passportjs need cookie parser.
//app.use(require('cookie-parser')());   //disable cookie parser since express-session don't need it.
var session = require('express-session');
app.use(session({
    secret: 'this is the secret',
    cookie: {
        httpOnly: true,
        maxAge:  5*60*1000
    },
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

//Body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); //for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
}));

// routes ======================================================================
require('./authSrv/authSrv.routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
////////////////

// app.use('/auth', authenticateRoutes);
app.use('/api', apiRoutes);

console.log("__dirname is " + __dirname);
app.use(express.static(__dirname + '/../frontend'));  //app.use('/static',express.static(__dirname + '/../frontend'));

//the fix for angularjs routing and express routing
//http://stackoverflow.com/questions/20396900/angularjs-routing-in-expressjs?rq=1
//http://stackoverflow.com/questions/37052697/angularjs-and-express-routing-separation
//http://stackoverflow.com/questions/24032603/angularjs-routing-on-an-express-4-0-backend-api?rq=1
//http://stackoverflow.com/questions/29936224/page-reload-fails-when-using-angular-ui-router-with-html5-mode-enabled?noredirect=1

//app.all('/*', function(req, res) {
//  res.sendFile('/frontend/index.html', {root: __dirname});
//});
app.all('/*', function(req, res) {
    res.sendFile('/frontend/index.html', {'root': __dirname + '/..'});
});

//It’s best to just exit and have your service manager/monitor restart the process.
process.on('uncaughtException', function (er) {
    logger.fatal({err: er}, "the application is going down for the uncaughtException.");
    process.exit(1);
});

//Attention: define error-handling middleware last, after other app.use() and routes calls;
//development only
//if(process.env.NODE_ENV ==='development') {
if(app.get('env') === 'development') {
    app.use(require('errorhandler'));
    //app.use(require('express-bunyan-logger').errorLogger());
}

myMongo.mongoDBinit(function(err) {
    if(err) {
        logger.error({err: err}, "App failed to get started because it failed to connect to database");
    }else{
        logger.info("Connected to MongoDB database : " + myMongo.langExDB.databaseName);

        app.listen(port, function() {
            logger.info("This env is for " + process.env.NODE_ENV);
            logger.info("LangExchange app listening on port : " + port);
        });
    }
});

//It’s best to just exit and have your service manager/monitor restart the process.
// var nodemailer = require('nodemailer')
// var transport = nodemailer.createTransport('SMTP', { // [1]
//     service: "Gmail",
//     auth: {
//         user: "gmail.user@gmail.com",
//         pass: "userpass"
//     }
// })
//
// if (process.env.NODE_ENV === 'production') { // [2]
//     process.on('uncaughtException', function (er) {
//         console.error(er.stack) // [3]
//         transport.sendMail({
//             from: 'alerts@mycompany.com',
//             to: 'alert@mycompany.com',
//             subject: er.message,
//             text: er.stack // [4]
//         }, function (er) {
//             if (er) console.error(er)
//             process.exit(1) // [5]
//         })
//     })
// }
