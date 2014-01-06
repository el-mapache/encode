/* Initializer an instances of the kue wrapper and return it
 *
**/

var kue = require("kue"),
    redis = require("redis");

function Queue(port, app, redisConfigs, debug) {
  this.app = app;
  this.port = port;
  this.q = kue;
  this.debug = false;

  if (redisConfigs && typeof redisConfigs === "object") {
    this.createRedisClient(redisConfigs);
  }

  this.setUpQueue();
}

Queue.prototype = {
  createRedisClient: function() {
    return this.q.redis.createClient(configs.port, configs.host);
  },

  setUpQueue: function() {
    this.q.app.listen(this.port);

    if (this.debug) {
      console.log("Queue created on port %d", this.port);
    }
  },

  createQueue: function() {
    return this.q.createQueue();
  }
};

module.exports = Queue;

