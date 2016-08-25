/**
 * Created by alex on 8/12/16.
 */
(function(){
    'use strict';

    var Users = require('./users.dataservice.js');
    var logger = require("../../util/logger.js");

    module.exports.uniqueCheckGetHandler = uniqueCheckGetHandler;

    function uniqueCheckGetHandler(req, res, next) {
        var fieldName = req.params.fieldname;
        var fieldValue = req.params.fieldvalue;

        if(fieldName === "username") {
            Users.findByUsername(fieldValue.toLowerCase(), uniqueCheckCallBack);
        }

        if(fieldName === "email") {
            Users.findByEmail(fieldValue, uniqueCheckCallBack);
        }

        function uniqueCheckCallBack(queryError, record) {
            // if there are any errors, return the error before anything else
            if (queryError) {
                res.status(500).send("Internal Server Error");

                return next(queryError);
            }

            // if any existing user
            if (record) {
                return res.status(200).send("An Existing Record Found");
            }else{
                return res.status(404).send("Not Found");
            }
        }
    }
})();