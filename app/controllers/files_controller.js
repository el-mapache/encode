var File = require(GLOBAL.dirname + '/app/models/file.js');
var TranscodeWorker = require(GLOBAL.dirname + '/app/workers/transcode_worker.js');
var Redis = require(GLOBAL.dirname + '/lib/redis.js');
var fs = require("fs");

var FilesController = function(redisConfigs) {
  var configs = redisConfigs;

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

        worker.perform(function(hash, id) {
          req.session["token"] = {
            hash: hash,
            job: id
          };

          res.send(JSON.stringify({
            status: 200, 
            message: "Your file was uploaded successfully.",
            token: hash,
            id: id
          }));
        });
      });
    },

    index: function() {

    },

    get: function(req, res) {
      var client = new Redis(redisConfigs);

      req.session.token = req.params.token;

      client.get("download:" + req.params.token, function(err, result) {
        fs.readdir(GLOBAL.dirname + "/public/downloads/", function(err, files) {
          if(err) {
            res.send({
              status: 500,
              error: 'There was an error processing your request. Please try again.'
            });
          }

          for(var i = 0;i<files.length;i++) {
            if(files[i] === result) {
              console.log(files[i]);
              return res.send('<a href=/files/download/'+req.params.token+"/"+encodeURI(files[i])+' download='+files[i]+'>Click to download your converted file</a>');
            }
          }

          res.send({status: 404, error: 'No files found.  Your download link has likely expired'});
        });
      });
    },

    download: function(req, res) {
      if (req.session.token !== req.params.token) return res.send("noway");
      console.log(req.params)
      res.sendfile(GLOBAL.dirname + '/public/downloads/' + req.params.filename);
    },

    destroy: function() {

    }
  };
};

module.exports = FilesController;

