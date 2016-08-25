/**
 * Created by alex on 8/12/16.
 */
(function() {
    'use strict';

    var nodemailer = require('nodemailer');
    var async = require('async');
    var mailService = require('../../util/mailService.js');
    var Users = require('./users.dataservice.js');
    var logger = require("../../util/logger.js");

    //redirect to /forgot with a tip about invalid/expired url.
    var forgotRedirectUrl = '/forgot' + '?initAgainInfo=' + 'Please request password reset again since password reset url is invalid or has expired';

    module.exports.resetPostHandler = resetPostHandler;
    module.exports.initResetTokenGetHandler = initResetTokenGetHandler;

    //refer to : http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
    //https://stormpath.com/blog/the-pain-of-password-reset
    //Toto: better one: http://stackoverflow.com/questions/20277020/reset-change-password-in-nodejs-with-passportjs
    // https://github.com/django/django/blob/master/django/contrib/auth/tokens.py
    function initResetTokenGetHandler(req, res) {
        Users.findByResetPwdTokenExpires(req.params.token, function (err, user) {
            if (!user) {
                //req.flash('error', 'Password reset token is invalid or has expired.');
                logger.info('error:  Password reset token is invalid or has expired.');

                //Todo: think about a better way for the redirection.
                //redirect to /forgot with a tip about invalid/expired url.
                return res.redirect(forgotRedirectUrl);
            }

            //Todo: how to redirect to /reset form with the username and token
            //req.user=user;

            return res.redirect('/reset/' + req.params.token);
        });
    }

    //todo: think more here,  maybe waterfall is not suitable here.
    function resetPostHandler(req, res) {
        async.waterfall([
            function (done) {
                Users.findByResetPwdTokenExpires(req.body.resetToken, function (queryError, user) {
                    if(queryError) {
                        logger.info("Error occurred while finding the user by reset token and expires : " + queryError.stack);
                        return done(queryError);
                    }
                    if (!user) {
                        logger.info('Error: Password reset token is invalid or has expired. Please apply for resetting it again. User : ' + JSON.stringify(user));
                        //return res.redirect('back');
                        //return res.redirect(302, forgotRedirectUrl);  //don't work as expect to redirect to '/forgot' with a parameter
                        return res.status(406).json({'error': 'Password reset token is invalid or has expired. Please apply for resetting it again.'});
                    }

                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    Users.resetPassword(user, function (updateDbError) {
                        if(updateDbError) {
                            logger.info("Interal server error while resetting the password in database : " + updateDbError.stack);

                            //return res.status(500).json({ "error" : "Please try again later since an internal server error found while updating password in database : " + updateDbError.message});
                            return done(updateDbError);
                        }

                        logger.info('Success! Your password has been changed.');
                        req.logIn(user, function (loginError) {
                             if(loginError) {
                                 logger.info("Error: auto login error occurred after password reset : " + loginError.stack);
                                 return done(loginError);
                             }

                            logger.info('automatic login success after the password has been changed.');
                            return done(null, user);
                        });
                    });
                });
            },
            function (user, done) {
                // var smtpTransport = nodemailer.createTransport({
                //     service: 'Hotmail',
                //     authClient: {
                //         user: 'wbin_666@hotmail.com',
                //         pass: 'twwb1228'
                //     }
                // });
                // var mailOptions = {
                //     to: user.email,
                //     from: 'wbin_666@hotmail.com',
                //     subject: 'Your password has been changed',
                //     text: 'Hello,\n\n' +
                //     'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                // };
                // smtpTransport.sendMail(mailOptions, function (emailSendingError) {
                //     if(emailSendingError) {
                //         logger.info("Email sending error after password reset and auto login : " + emailSendingError.stack);
                //         return done(emailSendingError);
                //     }
                //
                //     logger.info("Email has been sent out for a confirmation that the password for your account ' + user.email + ' has just been changed.")
                //     return done(null, user);
                // });
                var pwdChangedSender = mailService.getPwdChangedSender();

                pwdChangedSender({
                    to: user.email
                }, {
                    useremail: user.email
                }, function(emailSendingError, info){
                    if(emailSendingError) {
                        logger.info("Email sending error after password reset and auto login : " + emailSendingError.stack);
                        return done(emailSendingError);
                    }

                    logger.info("Email has been sent out for a confirmation that the password for your account ' + user.email + ' has just been changed.");
                    return done(null, user);
                });
            }
        ], function (anyError, user) {
            //return res.redirect('/');

            if (anyError) {
                logger.info("Error found during reset process : " + anyError.stack);
                //return next(err);
                return res.status(500).json({ "error" : "Please try again later since an error occurred during password reset process : " + anyError.message});
            }

            return res.status(200).json(user);
        });
    }
})();