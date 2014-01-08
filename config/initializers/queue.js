var Queue = require(GLOBAL.dirname + "/lib/queue.js");

module.exports = function(port, redisConfigs, app) {
  GLOBAL.Queue = new Queue(port, redisConfigs, true);

  return true;
};

