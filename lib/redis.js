var redis = require('redis'),
    configs = require(GLOBAL.dirname + '/config/redis.js').settings;

var RedisClient = function() {
  var TTL = configs.cacheTime,
      PORT = configs.port,
      HOST = configs.host;

  return {
    write: function(key, value) {
      var client = redis.createClient(PORT, HOST);

      client.on('connect', function() {
        client.setex(key, TTL, value);
      });
    },

    exists: function(key, callback) {
      client.exists(key, function(err, exists) {
        if (err) return callback(err);

        callback(null, (exists ? true : false));
      });
    }
  };

};

module.exports = RedisClient;

