var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);

GLOBAL.env = app.settings.env;
GLOBAL.dirname = __dirname;

var settings = require('./config/app-settings.js')[GLOBAL.env];
var redisConfigs = require('./config/redis.js');


// If would be nice if this simply started a daemon process that could
// listen for command line arguments, and then initialize, clear, restart, etc.
require('./config/initializers/queue.js')(9001, redisConfigs);

var FilesController = require('./app/controllers/files_controller.js')();
var ProgressController = require('./app/controllers/progress_controller.js');

var EmailWorker = require(GLOBAL.dirname + '/app/workers/email_worker.js')

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
app.get('/files/get/:token', FilesController.get);
app.get('/files/download/:token/:filename', FilesController.download);

app.get('/info/:token/:id', ProgressController.get);

GLOBAL.Queue.on('register callback', function(email, filename, hash) {
  new EmailWorker(email, filename, hash).
      perform(function(job) {
        console.log("Job type %s with id of %d saved.", job.type, job.id);
      });
});
