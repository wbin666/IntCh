/**
 * Created by alex on 7/11/16.
 */
(function() {
    'use strict';

    var cfg = require('../config/index');
    var MongoClient = require('mongodb').MongoClient;
    var logger = require('../util/logger.js');
    //var url = "mongodb://127.0.0.1:27017/timeExchange";
    //var myDB;

    module.exports.mongoDBinit = mongoDBinit;
    //module.exports.getMongoDBConnect = getMongoDBConnect;


    function mongoDBinit(callback) {
        MongoClient.connect(cfg.mongo.uri, function (err, db) {
            //myDB = db;
            module.exports.langExDB = db;
            callback(err);
        });
    }

    // the logic is totally wrong since it's async
    // function getMongoDBConnect(){
    //     logger.info("step into getMongoDBConnect()");
    //     if (myDB === undefined || myDB === null) {
    //         logger.info("DB instance is not there, try to create a new one");
    //         MongoClient.connect(url, function (err, db) {
    //             if(err){
    //                 logger.error({err: err}, "failed to connect to database");
    //
    //                 throw err;   //??? how to handle this or where to handle this.  leverage "process.on('uncaughtException', fn(err) {...} ) " in app.authClient ??
    //
    //             }
    //             myDB = db;
    //
    //             logger.info('DB instance is ready and return it : ' + myDB);
    //             return myDB;
    //         });
    //     }else{
    //         logger.info('DB instance is ready and return it : ' + myDB);
    //         return myDB;
    //     }
    // }

    /**
     * will reuse connection if already created
     */
    // function connect(callback) {
    //     if (myDB === undefined) {
    //         MongoClient.connect(url, function (err, db) {
    //             if (err) {
    //                 return callback(err);
    //             }
    //
    //             myDB = db;
    //             callback(null, db);
    //         });
    //     } else {
    //         callback(null, myDB);
    //     }
    // }

        /**
         * Use the db connection from our connect()
         */
    // function doCount(err, db) {
    //     if (err) { return console.log('errrrrrrrr!'); }
    //     db.collection('smurfs').count({'color':'red'}, function afterCount(err, count) {
    //         if (err) { return console.log('merror xmas'); }
    //         console.log('There was ' + count + ' smurf(s)');
    //     });
    // }
    //
    // connect(doCount);


    // var MongoClient = require('mongodb').MongoClient;
    //
    // MongoClient.connect('mongodb://localhost:27017/timeExchange', function(err, db) {
    //     if(err) {
    //         throw err;
    //     }
    //     db.collection('availableTime').find().toArray(function(err, result) {
    //         if(err) {
    //             throw err;
    //         }
    //
    //         console.log(result);
    //     });
    // });

    // var assert = require('assert');
    //
    // // Connection URL
    // var url = 'mongodb://localhost:27017/myproject';
    // // Use connect method to connect to the Server
    // MongoClient.connect(url, function(err, db) {
    //     assert.equal(null, err);
    //     console.log("Connected correctly to server");
    //
    //     db.close();
    // });

})();