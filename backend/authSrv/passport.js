(function() {
    'use strict';

    // load all the things we need
    var LocalStrategy = require('passport-local').Strategy;
    var bcrypt = require('bcrypt');
    var logger = require('../../util/logger.js');

    //var FacebookStrategy = require('passport-facebook').Strategy;
    //var configAuth       = require('./oauth');

    var Users = require('./users.dataservice.js');

    // expose this function to our app using module.exports
    module.exports = function (passport) {
        
        //Todo: investigate why the code below doesn't work
        // refer to http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
        //refer to https://github.com/passport/express-4.x-local-example/blob/master/server.js
        passport.serializeUser(function(user, done) {
            logger.info("user detail in serializeUser : " + JSON.stringify(user));
            done(null, user._id);
        });

        passport.deserializeUser(function(id, done) {
            logger.info("id in deserializeUser : " + id);
            Users.findById(id, function(err, user) {
                logger.info("user detail in deserializeUser :" + JSON.stringify(user));
                done(err, user);
            });
        });

        // passport.serializeUser(function (user, done) {
        //     logger.info("user detail in serializeUser : " + JSON.stringify(user));
        //     done(null, user);
        // });
        //
        // passport.deserializeUser(function (user, done) {
        //    logger.info("user detail in deserializeUser :" + JSON.stringify(user));
        //     done(null, user);
        // });

        passport.use('local-login', new LocalStrategy(
            function (username, password, done) {
                logger.info('the POST username : %s, password : %s', username, password);

                if(username.indexOf("@") === -1) {
                    //use username to login since username is not an email address
                    Users.findByUsername(
                        username, loginCallBack);
                }else{
                    //to use the email to login since username is an email address
                    Users.findByEmail(username, loginCallBack);
                }

                function loginCallBack(err, user){
                    // if there are any errors, return the error before anything else
                    if (err) {
                        logger.debug('I got an error when querying for user login, please try to login again later.');
                        return done(err);
                    }

                    // if no user is found, return the message
                    if (!user) {
                        logger.info('login failed because incorrect username : ' + user);

                        return done(null, false, { message: 'Incorrect username.' }); //for flash message
                    }

                    // // if the user is found but the password is wrong
                    // // if (!user.validPassword(password))
                    // if (user.password !== password) {
                    //     logger.info('login failed because password did not match.  Login pwd : %s, User.pwd : %s', password, user.password);
                    //     return done(null, false);
                    // }
                    // // all is well, return successful user
                    // logger.info('all is well, return successful user : ' + JSON.stringify(user));
                    // return done(null, user);

                    //Todo:  the logics may not be perfect because of async callback.  Need more check.
                    // refer to : http://passportjs.org/docs/profile
                    // https://github.com/ncb000gt/node.bcrypt.js
                    bcrypt.compare(password, user.password, function(bcryptCompareErr, res){
                        if(bcryptCompareErr){
                            logger.debug('I got an error when bcrypt compare for user password');
                            return done(bcryptCompareErr);
                        }
                        if(res) {
                            // all is well, return successful user
                            logger.debug('all is well, return successful user : ' + JSON.stringify(user));
                            delete user.password;

                            return done(null, user);
                        }else {
                            logger.debug('login failed because password did not match.  Login pwd : %s, User.pwd : %s',  password, user.password);

                            return done(null, false, { message: 'Incorrect password.' }); //for flash message
                        }
                    });

                }
            }
        ));

        // // Facebook strategy
        // passport.use(new FacebookStrategy({
        //
        //    // pull in our app id and secret from our authRoute.authClient file
        //    clientID        : configAuth.facebookAuth.clientID,
        //    clientSecret    : configAuth.facebookAuth.clientSecret,
        //    callbackURL     : configAuth.facebookAuth.callbackURL
        //
        // },
        //
        // // facebook will send back the token and profile
        // function(token, refreshToken, profile, done) {
        //    // asynchronous
        //    process.nextTick(function() {
        //
        //        // find the user in the database based on their facebook id
        //        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
        //
        //            // if there is an error, stop everything and return that
        //            // ie an error connecting to the database
        //            if (err)
        //                return done(err);
        //
        //            // if the user is found, then log them in
        //            if (user) {
        //                return done(null, user); // user found, return that user
        //            } else {
        //                // if there is no user found with that facebook id, create them
        //                var newUser            = new User();
        //
        //                // set all of the facebook information in our user model
        //                newUser.facebook.id    = profile.id; // set the users facebook id
        //                newUser.facebook.token = token; // we will save the token that facebook provides to the user
        //                newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
        //
        //                // save our user to the database
        //                newUser.save(function(err) {
        //                    if (err)
        //                        throw err;
        //
        //                    // if successful, return the new user
        //                    return done(null, newUser);
        //                });
        //            }
        //
        //        });
        //    });
        //
        // }));
    };
})();
