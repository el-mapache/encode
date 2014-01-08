var File = require(GLOBAL.dirname + '/app/models/file.js');
var TranscodeWorker = require(GLOBAL.dirname + '/app/workers/transcode_worker.js');

var FilesController = function() {
  return {
    create: function(req, res) {
      var params, file, transcoder;

      params = req.body;
      params["source"] = req.files.file;

      file = new File(params);

      file.save(function(err) {
        if (err) {
          // The file wasn't saved to the filesystem
          return res.send({status: 500, message: err});
        }

        var worker = new TranscodeWorker(file, params.email)
        
        //
        worker.perform(function(job) {
          req.session["token"] = job.id

          res.send(JSON.stringify({
            status: 200, 
            message: "Your file was uploaded successfully.",
            token: job.id
          }));
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

