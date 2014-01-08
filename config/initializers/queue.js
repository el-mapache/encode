var Queue = require(GLOBAL.dirname + "/lib/queue.js");

module.exports = function(port, redisConfigs, app) {
  var namespaces = ['email', 'transcode'];

  GLOBAL.Queue = new Queue(port, namespaces, redisConfigs, true);

  return true;
};

