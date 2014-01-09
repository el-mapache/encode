/*
 * Standard variable setup for an express 3.0 app.
 *
**/

var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app);


var env = app.settings.env;


/*
 * App settings objects.
 * TODO Add environment keys for redis configs.
**/

var settings = require('./config/app-settings.js')[env],
    redisConfigs = require('./config/redis.js');


/* 
 * Appwide constants;
**/

GLOBAL.env = env;
GLOBAL.dirname = __dirname;

/*
 * Initialize the global Queue object, a wrapper for the kue library
**/

require('./config/initializers/queue.js')(9001, redisConfigs);

var EmailWorker = require(GLOBAL.dirname + '/app/workers/email_worker.js')

var csrfValue = function(req) {
  return (req.body && req.body._csrf) || (req.query && req.query._csrf) ||
         (req.headers['x-csrf-token']) || (req.headers['x-xsrf-token']);
};


/*
 * Appwide configuration settings
**/

app.configure(function() {
  app.use(express.cookieParser(settings.cookieSecret));
  app.use(express.session({cookie: { maxAge: 86400000 }}));
  app.use(express.csrf({value: csrfValue}));
  app.use(app.router);

  app.use(express.static(__dirname + '/public'));
  app.engine('html', require('ejs').renderFile);
});


// Start the server.

server.listen(settings.port);
console.log('Server listening at port 9000');


// Routes

require('./app/routes/routes.js')(app, express.bodyParser);


// Global event listener to register email jobs when transcoding is finished.
// TODO Might be better as redis pubsub activity?

GLOBAL.Queue.on('register callback', function(email, filename, hash) {
  new EmailWorker(email, filename, hash).
      perform(function(job) {
        console.log("Job type %s with id of %d saved.", job.type, job.id);
      });
});

