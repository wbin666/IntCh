/**
 * Created by alex on 8/12/16.
 */
(function(){
    'use strict';

    var Users = require('./users.dataservice.js');
    var logger = require("../../util/logger.js");

    module.exports.sigupPostHandler = sigupPostHandler;

    function sigupPostHandler(req, res, next) {
        logger.info("User Info posted in signup : " + JSON.stringify(req.body));

        Users.findByUsername(req.body.username,
            function (queryError, existingUser) {
                // if there are any errors, return the error before anything else
                if (queryError) {
                    logger.info("Internal server error during signup : " + queryError.stack);
                    return res.status(500).json({"error": "Internal server error during signup : " + queryError.message}); 
                }

                // if any existing user
                if (existingUser) {
                    logger.info("Existing user found : " + existingUser.username);
                    return res.status(409).json({"error": "This username has been taken. Please try another"});
                }

                // if no existing user,  create a new user and login
                Users.createOneNewUser(req.body, function(createError, newUser){
                    // if there are any errors, return the error before anything else
                    if (createError) {
                        logger.info("Internal server error during creating a new user : " + createError.stack);
                        return res.status(500).json({"error" : "Internal server error during creating a new user : " + createError.stack});
                    }

                    // if no user is found, return the message
                    if (!newUser) {
                        logger.info("Internal server error : get a null when creating a new user in database");
                        return res.status(500).json({"error" : "Failed to create a new user"});
                    }

                    req.login(newUser, function (loginError) {
                        if (loginError) {
                            logger.info("login error after signup : " + loginError.stack);
                            return res.status(500).json({"error" : "login error after signup, please " + loginError.message});
                        }
                        return res.status(200).json(newUser);
                    });
                });

                // var newUser = new db.User();
                // newUser.username = req.body.username.toLowerCase();
                // newUser.password = newUser.generateHash(req.body.password);
                // newUser.save(function (err, user) {
                //     req.login(user, function (err) {
                //         if (err) {
                //             return next(err);
                //         }
                //         res.json(user);
                //     });
                // });
            });
    }
})();