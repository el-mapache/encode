var File = require("../models/file.js");
var TranscoderService = require("../services/transcoder_service.js");

var FilesController = function(Queue) {
  return {
    create: function(req, res) {
      var params, file, transcoder;

      params = req.body;
      params["source"] = req.files.file;

      file = new File(params);

      file.save(function(err) {
        if (err) {
          return res.send({status: 500, message: err});
        }

        var job = Queue.create("transcode", {
          title: file.normalizedName,
          email: params.email,
          from: file.originalFormat,
          to: file.format
        })

        job.save(function() {
          req.session["token"] = job.id
          res.send(JSON.stringify({status: 200, message: "Your file was uploaded successfully.", token: job.id}));
        });

        Queue.process("transcode", function(job, done) {

          console.log("processing");
          job.on("complete", function(id) {
            console.log("Job number "+id+" complete");

//            job.remove();
            res.write(JSON.stringify({status: 200, message: "File converted successfully."}));
            res.end();
          });

          job.on("progress", function(progress) {
            console.log(arguments);
            res.send(Math.ceil((progress / file.timeInSeconds) * 100) + "");
          });

          job.on("failure", function() {
            console.log("job failed");
            res.send({status: 500, message: err});
          });

          transcoder = TranscoderService(file);
          transcoder.transcode(function(err, output) {
            if (err) {
              console.log("Error transcoding file");
              return done();
            }

            if (output == 0) {
              job.progress(+file.timeInSeconds, +file.timeInSeconds);
              return job.emit("complete", job.id);
            }

            job.progress(+output, +file.timeInSeconds);
          });
        });
      });

    },

    index: function() {

    },
    
    download: function() {

    },

    destroy: function() {

    }
  };
};

module.exports = FilesController;

