GLOBAL.dirname = __dirname;

var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);

var settings = require("./config/app-settings.js").settings;
var redisConfigs = require("./config/redis.js").settings;

var helpers = require("./lib/support_functions.js");

// If would be nice if this simply started a daemon process that could
// listen for command line arguments, and then initialize, clear, restart, etc.
var queue = require("./config/initializers/queue.js")(9001, redisConfigs, app);

var FilesController = require("./app/controllers/files_controller.js")(queue);


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

  app.use(express.static(__dirname+"/app/public"));
  app.engine('html', require('ejs').renderFile);
});

server.listen(settings.port);
console.log("Server listening at port 9000");

app.get("/", function(req,res) {
  res.locals.token = req.csrfToken();
  res.render(__dirname+"/app/public/index.html");
});

app.post("/upload", FilesController.create);

app.get("/info/:token", function(req,res) {
  http.get("http://localhost:9001/job/"+req.params.token, function(response) {
    var jsr = null;

    response.on('data', function(chunk) {
      jsr = chunk.toString();
    }).on('end', function(chunk) {
      res.send({status: 200, response: JSON.parse(jsr)});
    });
  }).on('error', function(err) {
    console.log(err)
  });

});

app.get("/download", function(req, res) {

});

