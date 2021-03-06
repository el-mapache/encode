/*
 * Route controllers
**/

module.exports = function(app, bodyParser, redis) {

  var FilesController = require(GLOBAL.dirname + '/app/controllers/files_controller.js')(redis),
      ProgressController = require(GLOBAL.dirname + '/app/controllers/progress_controller.js');

  app.get('/', function(req,res) {
    res.locals.token = req.csrfToken();
    res.render(GLOBAL.dirname + "/public/index.html");
  });

  app.post('/upload', bodyParser({uploadDir: GLOBAL.dirname}), FilesController.create);
  app.get('/files/get/:token', FilesController.get);
  app.get('/files/download/:token/:filename', FilesController.download);
  app.get('/info/:token/:id', ProgressController.get);
};

