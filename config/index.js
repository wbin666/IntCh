/**
 * Created by alex on 8/22/16.
 */
(function() {

    //refer to : http://www.chovy.com/node-js/managing-config-variables-inside-a-node-js-application/
    //http://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files?noredirect=1

    var env = process.env.NODE_ENV || 'development';
    var cfg = require('./config.' + env + '.js');

    module.exports = cfg;
})();