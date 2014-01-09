var Queue = GLOBAL.Queue;
var TranscoderService = require(GLOBAL.dirname + '/app/services/transcoder_service.js');
var sha1 = require('sha1');

var TranscodeWorker = function(file, email) {
  this.type = "transcode";

  this.file = file;
  this.user = email;
};

TranscodeWorker.prototype.perform = function(onSave) { 
  var file = this.file
  var transcodeParams = {
    title: this.file.normalizedName,
    email: this.user,
    from: this.file.originalFormat,
    to: this.file.format,
    finalOutputName: this.file.normalizedName + this.file.format
  };

  Queue.jobQueue.on('job complete', function(id) {
    Queue.remove(id);
  }).on('job failed', function(id) {
    Queue.retry(id); 
  });

  Queue.enqueue(this.type, transcodeParams, function(job) {
    var hashedFileName = sha1(job.data.finalOutputName);
    onSave(hashedFileName, job.id);

    Queue.jobQueue.process("transcode", function(job, done) {
      console.log("processing");

      job.on("failed", function(id) {
        done();
      }).on("complete", function(job) {
        Queue.emit('register callback', job.data.email, job.data.finalOutputName, hashedFileName);
        done();
      });

      transcoder = TranscoderService(file);

      /*
       * Callback function to report output of ffmpeg.
       * @param{err} javascript error message
       * @param{output} Integer either the progress of the transcoding or a successful exit code.
       *
      **/
      transcoder.transcode(function(err, output) {
        if (err) {
          console.log('Error transcoding file.');
          return job.emit('failed', job.id);
        }

        /*
         * Check if we have received an exit code of true from ffmpeg.
         * if so, the processing is finished.
         *
        **/
        if (output == 0) {
          job.progress(+file.timeInSeconds, +file.timeInSeconds);
          return job.emit('complete', job);
        }

        // Update the job's progress
        job.progress(+output, +file.timeInSeconds);
      });
    });
  });
};

module.exports = TranscodeWorker;

