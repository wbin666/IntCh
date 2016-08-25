(function() {
    'use strict';

    var forgotHandlers = require('./forgot.handlers.js');
    var signupHandlers = require('./signup.handlers.js');
    var uniqueCheckHandlers = require('./uniquecheck.handlers.js');
    var resetHandlers = require('./reset.handlers.js');
    var logger = require("../../util/logger.js");

    module.exports = function (app, passport) {
        //Todo:  to add and define a general function for error handling for Users operation callback

        //process the password reset/update, and send out the notification of pwd change
        app.post('/reset', resetHandlers.resetPostHandler);
        
        // to check if the reset token is expired and if not, redirect to the form of reset password
        app.get('/initreset/:token', resetHandlers.initResetTokenGetHandler);

        //to generate the reset token/link and send out the mail of reset link
        app.post('/forgot', forgotHandlers.forgotPostHandler);

        // process the login form
        // app.post("/login", passport.authenticate('local-login'), function (req, res) {
        //     res.json(req.user);
        // });
        //app.post("/login", loginHandlers.loginPostHandler);
        app.post("/login", function (req, res, next) {
            passport.authenticate('local-login', function(authError, user, info) {
                logger.info("info detail is : " + JSON.stringify(info));

                if (authError) {
                    logger.info("Internal server error during login : " + authError.stack);
                    return res.status(500).json({"error": "Internal server error during login : " + authError.message});
                }

                if (!user) {
                    //return res.redirect('/login');
                    logger.info("Error found during login : " + info.message);
                    return res.status(401).json({"error": info.message});
                }

                req.logIn(user, function (loginError) {
                    if (loginError) {
                        logger.info("Internal server error during login : " + loginError.stack);
                        return res.status(500).send({"error": "Internal server error during login : " + loginError.message})
                    }

                    //return res.redirect('/users/' + user.username);
                    return res.status(200).json(user);
                });
            })(req, res, next);  //investigate why the "(req, res, next)" is here, why not just ended by "});".  refer: http://stackoverflow.com/questions/33248638/unique-pattern-in-passport-authentication
        });

        // process the logout
        app.post("/logout", function (req, res) {
            req.logOut();

            //res.send(200);
            return res.status(200).end();
        });

        // loggedin check
        app.get("/loggedin", function (req, res) {
            res.send(req.isAuthenticated() ? req.user : '0');
        });

        // signup
        app.post("/signup", signupHandlers.sigupPostHandler);

        // unique check for username and email
        app.get("/authClient/uniquecheck/:fieldname/:fieldvalue", uniqueCheckHandlers.uniqueCheckGetHandler);
        
        
        
        // Facebook authClient routes
        // app.get('/authClient/facebook', function authenticateFacebook (req, res, next) {
        //   req.session.returnTo = '/#' + req.query.returnTo;
        //   next ();
        // },
        // passport.authenticate ('facebook'));
        //
        // app.get('/authClient/facebook/callback', function (req, res, next) {
        //  var authenticator = passport.authenticate ('facebook', {
        //    successRedirect: req.session.returnTo,
        //    failureRedirect: '/'
        //   });
        //
        // delete req.session.returnTo;
        // authenticator (req, res, next);
        // })
    };
})();