/**
 * Created by alex on 8/12/16.
 */
(function() {
    'use strict';

    var nodemailer = require('nodemailer');
    var async = require('async');
    var crypto = require('crypto');
    var Users = require('./users.dataservice.js');
    var mailService = require('../../util/mailService.js');
    var logger = require("../../util/logger.js");

    module.exports.forgotPostHandler = forgotPostHandler;


    //refer to : http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
    //https://stormpath.com/blog/the-pain-of-password-reset
    //Toto: better one: http://stackoverflow.com/questions/20277020/reset-change-password-in-nodejs-with-passportjs
    // https://github.com/django/django/blob/master/django/contrib/auth/tokens.py
    function forgotPostHandler(req, res, next) {
        async.waterfall([
            //Todo: move the token generation to a module or service
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                Users.findByEmail(req.body.email, function (err, user) {
                    if (!user) {
                        //req.flash('error', 'No account with that email address exists.');
                        logger.info('error: No account with that email address exists.');
                        //return res.redirect('/forgot');
                        return res.status(406).json({"error" : "No account with that email address exists."});
                    }

                    //Todo: move the token and expires setting to Users (DB operation)
                    user.resetPasswordToken = token;
                    //user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    //change it to a UTC time
                    // var expireTime = moment();     //get the time Now
                    // expireTime.add(1, 'hours');     //add 1 hour
                    // expireTime.utc();               // change to UTC
                    //user.resetPasswordExpires = expireTime.toDate();  //to get the native Date object
                    //logger.info("resetPasswordExpires is " + user.resetPasswordExpires.toString());

                    var expireTime = new Date();            //get the time Now
                    expireTime.setHours(expireTime.getHours() + 1);   //add 1 hour for expire time
                    user.resetPasswordExpires = expireTime.toISOString();

                    // user.save(function(err) {
                    //     done(err, token, user);
                    // });
                    Users.saveResetPwdTokenExpires(user, function (err) {
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                // var smtpTransport = nodemailer.createTransport({
                //     service: 'Hotmail',
                //     authClient: {
                //         user: 'wbin_666@hotmail.com',
                //         pass: 'twwb1228'
                //     }
                // });
                //
                // // just for verify connection configuration
                // // smtpTransport.verify(function (error, success) {
                // //     if (error) {
                // //         logger.info(error);
                // //     } else {
                // //         logger.info('Server is ready to take our messages');
                // //     }
                // // });
                //
                // var mailOptions = {
                //     to: user.email,
                //     from: 'wbin_666@hotmail.com',
                //     subject: 'Node.authClient Password Reset',
                //     text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                //     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                //     'http://' + req.headers.host + '/initreset/' + token + '\n\n' +
                //     'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                // };
                //
                // smtpTransport.sendMail(mailOptions, function (err) {
                //     // req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                //     if(!err){
                //         logger.info('info: An e-mail has been sent to ' + user.email + ' with further instructions.');
                //     }
                //     done(err, 'done');
                // });

                var pwdResetSender = mailService.getPwdResetSender();
                
                pwdResetSender({
                    to: user.email
                },{
                    username: user.username,
                    host: req.headers.host,
                    token: token
                }, function(mailSendError, info){
                    if(! mailSendError){
                        logger.info('info: An e-mail has been sent to ' + user.email + ' with further instructions.');
                    }
                    
                    done(mailSendError, user);
                });
            }
        ], function (waterFallError, user) {
            if (waterFallError) {
                logger.info("Error found during forgot process : " + waterFallError.stack);
                //return next(err);
                return res.status(500).json({ "error" : "Please try again later since an internal server error found during forgot process : " + waterFallError.message});
            }

            //return res.redirect('/forgot');
            return res.status(200).end();
        });
    }
})();