module.exports = function(configs) {

  var redis = require('redis');


  // Redis constructor function
  return RedisClient = function() {


    // Common config settings

    var TTL = configs.cacheTime,
        PORT = configs.redisPort,
        DB = configs.redisDB,
        HOST = configs.host || 'localhost';



    var createClient = function() {
      return redis.createClient(PORT, HOST, {db: DB});
    };


    return {
      get: function(key, done) {
        var client = createClient();
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
        var client = createClient();

        client.on('connect', function() {
          client.setex(key, TTL, value);
          client.quit();
        });
      },

      exists: function(key, callback) {
        var client = createClient();


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
};
