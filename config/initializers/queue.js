var Queue = require(GLOBAL.dirname + "/lib/queue.js");

module.exports = function(port, redisConfigs, app) {
  var queue = new Queue(port, redisConfigs, app, true);

  return queue.createQueue();
};

