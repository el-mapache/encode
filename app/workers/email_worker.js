var Queue = GLOBAL.Queue;
var EmailService = require(GLOBAL.dirname + "/app/services/emailer.js");
var helpers = require(GLOBAL.dirname + '/lib/support_functions.js');

var Redis = require(GLOBAL.dirname + '/lib/redis.js');
var client = new Redis();

var EmailWorker = function(to, targetFile) {
  var self = this;

  this.type = 'email';

  this.to = to;
  this.targetFile = targetFile;

  (function next(token) {
    client.exists(token, function(err, exists) {
      if (exists) return next(helpers.base62Random());

      client.write("download:" + token, self.targetFile);
      self.link = "http://localhost:9000/download/" + token;
      return true;
    });
  })(helpers.base62Random());
}

EmailWorker.prototype.perform = function(onSave) {
  var self = this;

  var params = {
    title: 'Email to ' + this.to
  };

  Queue.jobQueue.on('job complete', function(id) {
    console.log("job finished");
    Queue.remove(id);
  }).on('job failed', function(id) {
    console.log("job failed");
    Queue.retry(id); 
  });

  Queue.enqueue(this.type, params, function(job) {
    onSave(job)

    Queue.jobQueue.process(self.type, 10, function(job, done) {
      console.log("processing");

      job.on("failed", function(id) {
        done();
      }).on("complete", function(job) {
        done();
      });

      new EmailService(self.to, self.link).mail(function(err, result) {
        if (err) {
          return job.emit("failed", job.id);
        }

        job.emit("complete", job);
      });

    });

  });

};

module.exports = EmailWorker;

