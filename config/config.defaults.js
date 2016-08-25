/**
 * Created by alex on 8/22/16.
 */
(function(){
    //Rule: Use UPPERCASE for Constants
    
    var config = module.exports = {};
    //console.log('-----reading the config.defaults.authClient under config!');

    config.env = 'development';
    //config.hostname = 'dev.example.com';

    //mongo database
    config.mongo = {};
    config.mongo.uri='mongodb://127.0.0.1:27017/timeExchange';
    //config.mongo.uri = process.env.MONGO_URI || 'localhost';
    //config.mongo.db = 'example_dev';

    //security
    config.bcrypt_saltRounds = 10;

})();