var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var settings = require("./configs.js").settings;
var helpers = require("./lib/support_functions.js");
var FilesController = require("./controllers/files_controller.js");

var csrfValue = function(req) {
  return (req.body && req.body._csrf) || (req.query && req.query._csrf) ||
         (req.headers['x-csrf-token']) || (req.headers['x-xsrf-token']);
};

app.configure(function() {
  app.use(express.cookieParser(settings.cookieSecret));
  app.use(express.session({cookie: { maxAge: 86400000 }}));
  app.use(express.bodyParser());
  app.use(express.csrf({value: csrfValue}));
  app.use(express.static(__dirname+"/public"));
  app.engine('html', require('ejs').renderFile);
});

server.listen(9000);
console.log("Server listening at port 9000");

app.get("/", function(req,res) {
  res.locals.token = req.csrfToken();
  res.render(__dirname+"/index.html");
});

app.post("/upload", FilesController.create);

app.get("/download", function(req, res) {

});

