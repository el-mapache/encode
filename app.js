var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var settings = require("./configs.js").settings;
var transcoder = require("./services/transcoder_service.js");

var csrfValue = function(req) {
  return (req.body && req.body._csrf) || 
         (req.query && req.query._csrf) || 
         (req.headers['x-csrf-token']) || 
         (req.headers['x-xsrf-token']);
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

app.get("/", function(req,res) {
  res.locals.token = req.csrfToken();
  res.render(__dirname+"/index.html");
});

app.post("/upload", function(req, res) {
  transcoder.transcode({
    source: req.files.file.path,
    bitRate: req.body.bitrate,
    channels: req.body.tracks,
    codec: req.body.format,
    samplerate: req.body.samplerate
  }, function(proc) {
    proc.
      onProgress(function(progress) {
      console.log(progress)
    });
//    saveToFile(__dirname + '/dummy'+ options.codec.split('.')[1], function(stdout, stderr) {
//      console.log(stderr)
//      console.log(stdout)
//      console.log('file has been converted succesfully');
//      res.end("done");
    //});
  });
});

app.get("/download", function(req, res) {

});

