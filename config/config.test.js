/**
 * Created by alex on 8/22/16.
 */
(function () {
    //Rule: Use UPPERCASE for Constants
    var config = require('./config.defaults.js');

    //all the config here is to override the default configurations in 'config.defaults.authClient'

    config.env = 'test';
    // config.hostname = 'test.example';
    // config.mongo.db = 'example_test';

    module.exports = config;
})();