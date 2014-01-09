// Need to get a way to wrap all these common functions
var redis = require('redis'),
    configs = require(GLOBAL.dirname + '/config/redis.js');

var RedisClient = function() {
  var TTL = configs.cacheTime,
      PORT = configs.port,
      HOST = configs.host;

  return {
    get: function(key, done) {
      var client = redis.createClient(PORT, HOST);
      var result;

      client.on("connect", function() {
        client.get(key, function(err, response) {
          console.log(arguments)
          if (err) return done(err);

          result = response;
        });

        client.quit();
      });

      client.on("end", function() {
        done(null, result);
      });

    },

    write: function(key, value) {
      var client = redis.createClient(PORT, HOST);

      client.on('connect', function() {
        client.setex(key, TTL, value);
        client.quit();
      });
    },

    exists: function(key, callback) {
      var client = redis.createClient(PORT, HOST);


      client.on('connect', function() {

        client.exists(key, function(err, exists) {
          if (err) return callback(err);

          client.quit();
          callback(null, (exists ? true : false));

        });
      });
    }
  };

};

module.exports = RedisClient;

