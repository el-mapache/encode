var File = require("../models/file.js").file;
var TranscoderService = require("../services/transcoder_service.js");

module.exports = {
  create: function(req, res) {
    var params, file, transcoder;

    params = req.body;
    //params["source"] = req.files.file;

    try {
      file = new File(params);
    } catch (err) {
      return res.send({status: 500, message: "There was an error uploading your file."});
    }

    res.send({status: 200, message: "Your file was uploaded successfully."});
   // transcoder = TranscoderService(file);
   // transcoder.transcode(function(err, output) {
   //   if (err) res.send({status: 500, message: err});
   //   res.send({status: 200, message: "File converted successfully."});
   // });
  },

  index: function() {

  },
  
  download: function() {

  },

  destroy: function() {

  }
};
