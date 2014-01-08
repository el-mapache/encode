var Queue = GLOBAL.Queue;
var EmailService = require(GLOBAL.dirname + "/app/services/emailer.js");
var helpers = require('./lib/support_functions.js');
var RedisClient = require(GLOBAL.dirname + '/lib/redis.js');
var redis = new RedisClient();

var downloadKey;

do {
  downloadKey = helpers.base62Random();
} while (client.exists(downloadKey, function(err) {
  console.log("while loop error?: %s", err);
}));

var EmailWorker = function(to) {
  this.type = 'email';

  this.to = link;
  this.link = function() {
  };
}

EmailWorker.prototype.setDownloadToken = function() {
  var self = this;

  redis.exists(helpers.base62Random(), function(err, exists) {
    if (exists) return self.setDownloadToken();

    redis.write(key, ""), function(err) {
      if (err) throw err;

      return "";
    });
  });
};

EmailWorker.prototype.perform = function(onSave) {
  var self = this;

  var params = {
    title: 'Email to ' + this.to
  };

  Queue.jobQueue.on('job complete', function(id) {
    Queue.remove(id);
  }).on('job failed', function(id) {
    Queue.retry(id); 
  });

  Queue.enqueue(this.type, params, function(job) {
    onSave(job)

    Queue.jobQueue.process(self.type, 10, function(job, done) {
      console.log("processing");

      job.on("failed", function(id) {
        done();
      }).on("complete", function(job) {
        Queue.emit('register callback', job.data.email);
        done();
      });
    });
  });

};

module.exports = EmailWorker;
