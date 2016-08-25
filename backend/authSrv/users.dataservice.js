/**
 * Created by alex on 7/11/16.
 */
(function() {
    'use strict';

    var bcrypt = require('bcrypt');
    var moment = require('moment');
    var ObjectId = require('mongodb').ObjectId;
    var cfg = require('../../config');
    var myMongo=require('../dbConnect.js');
    var logger = require('../../util/logger.js');

    //const saltRounds = 10;

    function findByResetPwdTokenExpires(token, cb){
        var nowVar = new Date();

        myMongo.langExDB.collection('users').find({ resetPasswordToken: token, resetPasswordExpires: { $gt: nowVar.toISOString() } })
            .limit(1)
            .next(function(err, user){
                return cb(err, user);
            });
    }

    function findById(id, cb) {
    // myMongo.langExDB.collection('users').find({_id: id}, {username:1, password:1}).limit(1).next(function(err, user) {
    //             return cb(err, user);
    //         });
        commonFindByField('_id', ObjectId(id), cb);
    }

    function findByUsername(username, cb) {
        // logger.info('findByUserName, the username is ' + username);
        // myMongo.langExDB.collection('users').find({username: username.toLowerCase()}, {username:1, password:1}).limit(1).next(function(err, user) {
        //         // if(err) { cb(err, null); }
        //         // if(user === null) {cb(null, false);}
        //         // return cb(null, user);
        //         logger.info('findByUserName error is ' + err);
        //         logger.info('findByUserName returned user is ' + JSON.stringify(user));
        //         return cb(err, user);
        //     });

        //apply "toLowerCase()" for all usernames,  but not email
        commonFindByField('username', username.toLowerCase(), cb);
    }

    function findByEmail(email, cb) {
        // logger.info('findByEmail, the email is ' + email);
        // myMongo.langExDB.collection('users').find({email: email}, {username:1, password:1, email:1}).limit(1).next(function(err, user) {
        //     // if(err) { cb(err, null); }
        //     // if(user === null) {cb(null, false);}
        //     // return cb(null, user);
        //     logger.info('findByEmail error is ' + err);
        //     logger.info('findByEmail returned user is ' + JSON.stringify(user));
        //     return cb(err, user);
        // });
        commonFindByField('email', email, cb);
    }

    //extract a common function for findByUserName, findByEmail, findById
    //refer to: http://stackoverflow.com/questions/17039018/how-to-use-a-variable-as-a-field-name-in-mongodb-native-findone
    function commonFindByField(fieldName, fieldValue, cb){
        var query = {};
        query[fieldName] = fieldValue;

        logger.info('commonfindByField, try to find the record with %s :  %s', fieldName, fieldValue);
        myMongo.langExDB.collection('users').find(query, {username:1, password:1, email:1}).limit(1).next(function(err, user) {
            // if(err) { cb(err, null); }
            // if(user === null) {cb(null, false);}
            // return cb(null, user);
            logger.info('Error of findBy' + fieldName +' is ' + err);
            logger.info('findBy' + fieldName + ' returned user is ' + JSON.stringify(user));
            return cb(err, user);
        });
    }
    
    // for signup to register a new user
    function createOneNewUser(user, cb){
        // Todo: try to reduce duplicated code for hashing the password via bcrypt before updating in DB
        bcrypt.hash(user.password, cfg.bcrypt_saltRounds, function(bcryptHashErr, hash){
            if(bcryptHashErr) {
                return cb(bcryptHashErr, null);
            }

            //apply "toLowerCase()" for all usernames,  but not email
            myMongo.langExDB.collection('users').insertOne({username: user.username.toLowerCase(), password: hash, email: user.email},
                function(insertOneErr, result){
                    logger.debug('Mongo.users.insertOne.result.ops : ' + JSON.stringify(result.ops));
                    return cb(insertOneErr, result.ops[0]);
                }
            );
        });
    }

    //for password reset
    function resetPassword(user, cb) {
        // Todo: try to reduce duplicated code for hashing the password via bcrypt before updating in DB
        bcrypt.hash(user.password, cfg.bcrypt_saltRounds, function(bcryptHashErr, hash) {
            if (bcryptHashErr) {
                return cb(bcryptHashErr, null);
            }

            myMongo.langExDB.collection('users').updateOne({username: user.username},
                {
                    $set: {
                        password: hash,
                        resetPasswordToken: user.resetPasswordToken,
                        resetPasswordExpires: user.resetPasswordExpires
                    }
                },
                function (updateErr, result) {
                    return cb(updateErr, result);
                });
        });
    }

    //for forgot to record the generated token and expire time
    function saveResetPwdTokenExpires(user, cb){
        myMongo.langExDB.collection('users').updateOne({email: user.email},
            {
                $set: {resetPasswordToken: user.resetPasswordToken, resetPasswordExpires: user.resetPasswordExpires}
            },
            function(updateErr, result){
                return cb(updateErr, result);
        });
    }
    

    module.exports.findById = findById;
    module.exports.findByUsername = findByUsername;
    module.exports.findByEmail = findByEmail;
    module.exports.createOneNewUser = createOneNewUser;
    module.exports.saveResetPwdTokenExpires = saveResetPwdTokenExpires;
    module.exports.findByResetPwdTokenExpires = findByResetPwdTokenExpires;
    module.exports.resetPassword = resetPassword;
})();