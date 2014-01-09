var http = require('http');

var ProgressController = function() {
  return {
    get: function (req, res) {
      if (req.params.token !== req.session.token.hash) {
        return res.send({
          status: 404, 
          message: 'Job not found.'
        });
      }

      // Private function to process ffmpeg progress output and return it.
      function reportProgress(data) {
        var progress = null;

        data.on('data', function(chunk) {
          progress = chunk.toString();
        }).on('end', function(chunk) {
          res.send({ 
            status: 200, 
            response: JSON.parse(progress)
          });
        });
      }

      http.get('http://localhost:9001/job/' + req.params.id, reportProgress)
      .on('error', function(err) {
        res.send({
          status: 500,
          response: 'Service unavailable.'
        });
     });
    }
  };
};

module.exports = new ProgressController();

