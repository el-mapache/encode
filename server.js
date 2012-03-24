var http = require('http');
var url =  require('url');
var fs = require('fs');
var querystring = require('querystring');
var settings = require('./configs.js');

var start = function start(route, handle) {
    var onRequest = function(req, res) {
        try {
            console.log('Incoming request from: ' + req.connection.remoteAddress
                        + ' for url: ' + url.parse(req.url).href);
            var queryExt = querystring.parse(url.parse(req.url).query);
            console.log(queryExt.url);
            var pathName = url.parse(req.url).pathname;
            console.log('request for ' + pathName + ' recieved');

            route(pathName, queryExt, handle, res, req);

        } catch (err) {
            console.log(err);
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    };
    
    http.createServer(onRequest).listen(settings.settings.atPort);
    console.log('server is on at port 27841');
    setInterval(clearDir, 18000000);
};

var clearDir = function () {
    var dir = __dirname + '/data/uploads/';
    
    fs.readdir(dir, function(err, files) {
        if(err) console.log(err);
            if(files != '') {
                console.log('files in folder ' + dir + ': ' + files);
                for(var i = 0; i < files.length;i++) {
                    var file = files[i];
                    fs.unlink(dir+file, function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log('deleting file: ' + file);
                        }
                    });
                }
            } else {console.log('nothing to delete');}
    });
};

exports.start = start;
