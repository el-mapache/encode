/* Initialize an instance of kue using user supplied redis configs, then
 * return a jobQueue to store and process jobs
*/

var kue = require("kue"),
    redis = require("redis"),
    jobQueue;

module.exports = function(port, redisConfigs, app) {
  kue.redis.createClient = function() {
    return redis.createClient(redisConfigs.port, redisConfigs.host);
  };

  jobQueue = kue.createQueue();

  kue.app.listen(port);

  console.log("Queue created on port %d", port);

  return jobQueue;
};

