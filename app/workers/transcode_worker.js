var Queue = GLOBAL.Queue;
var TranscoderService = require(GLOBAL.dirname + '/app/services/transcoder_service.js');

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
    to: this.file.format
  };

  Queue.jobQueue.on('job complete', function(id) {
    Queue.remove(id);
  });

  Queue.enqueue(this.type, transcodeParams, function(job) {
    doStuff(file);
    onSave(job);
  });
};

function doStuff(file) {

  Queue.jobQueue.process("transcode", function(job, done) {
    console.log("processing");

    job.on("failure", function() {
      console.log("job failed");
      res.send({status: 500, message: "Job failed."});
    }).on("progress", function(progress) {
      console.log(progress);
    }).on("complete", function(id) {
      console.log('job done');
      console.log(id);
      done();
    });

    transcoder = TranscoderService(file);

    /*
     * Callback function to report output of ffmpeg.
     * @param{err} javascript error message
     * @param{output} Integer either the progress of the transcoding or a successful exit code.
    */
    transcoder.transcode(function(err, output) {
      if (err) {
        console.log("Error transcoding file");
        return done();
      }

      /* 
       * Check if we have received an exit code of true from ffmpeg,
       * if so, the processing is finished.
      */
      if (output == 0) {
        job.progress(+file.timeInSeconds, +file.timeInSeconds);
        return job.emit("complete", job.id);
      }

      // Update the job's progress
      job.progress(+output, +file.timeInSeconds);
    });
  });

}
module.exports = TranscodeWorker;

