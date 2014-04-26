/*
 * Route controllers
**/

module.exports = function(app, bodyParser, settings) {

  var FilesController = require(GLOBAL.dirname + '/app/controllers/files_controller.js')(settings.redisConfigs),
      ProgressController = require(GLOBAL.dirname + '/app/controllers/progress_controller.js');

  app.get('/', function(req,res) {
    res.locals.token = req.csrfToken();
    res.render(GLOBAL.dirname + "/public/index.html");
  });

  app.post('/upload', bodyParser(), FilesController.create);
  app.get('/files/get/:token', FilesController.get);
  app.get('/files/download/:token/:filename', FilesController.download);
  app.get('/info/:token/:id', ProgressController.get);
};

