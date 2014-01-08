GLOBAL.dirname = __dirname;

var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);

var settings = require('./config/app-settings.js').settings[app.settings.env];
var redisConfigs = require('./config/redis.js');


// If would be nice if this simply started a daemon process that could
// listen for command line arguments, and then initialize, clear, restart, etc.
require('./config/initializers/queue.js')(9001, redisConfigs);

var FilesController = require('./app/controllers/files_controller.js')();
var ProgressController = require('./app/controllers/progress_controller.js');


var csrfValue = function(req) {
  return (req.body && req.body._csrf) || (req.query && req.query._csrf) ||
         (req.headers['x-csrf-token']) || (req.headers['x-xsrf-token']);
};

app.configure(function() {
  app.use(express.cookieParser(settings.cookieSecret));
  app.use(express.session({cookie: { maxAge: 86400000 }}));
  app.use(express.bodyParser());
  app.use(express.csrf({value: csrfValue}));
  app.use(app.router);

  app.use(express.static(__dirname+'/app/public'));
  app.engine('html', require('ejs').renderFile);
});

server.listen(settings.port);
console.log('Server listening at port 9000');

app.get('/', function(req,res) {
  res.locals.token = req.csrfToken();
  res.render(__dirname+"/app/public/index.html");
});

app.post('/upload', FilesController.create);
app.get('/info/:token', ProgressController.get);

app.get('/download/:token', function(req, res) {

});

GLOBAL.Queue.on('register callback', function(email) {
  new EmailWorker(email, function(job) {
    console.log("Job type %s with id of %d saved.", job.type, job.id);
  });
});
