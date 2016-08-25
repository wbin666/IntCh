/**
 * Created by alex on 6/16/16.
 */
(function() {
    'use strict';

    var bunyan = require('bunyan');
    var logger = bunyan.createLogger({
        name: "langExchange",
        stream: process.stdout,
        level: 'info',
        serializers: bunyan.stdSerializers,
    });

    module.exports = logger;
})();