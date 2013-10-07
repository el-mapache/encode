var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);


app.configure(function() {
  app.use(express.cookieParser("tempsecret"));
  app.use(express.session({cookie: { maxAge: 86400000 }}));
  app.use(express.bodyParser());
  app.use(express.csrf());
  app.use(express.static(__dirname+"/webroot"));
  app.engine('html',require('ejs').renderFile);
});

server.listen(9000);

app.get("/", function(req,res,result) {
  console.log(res)
  console.log(__dirname);
  console.log("route '/'");
  return res.render(__dirname+"/webroot/index.html");
});
