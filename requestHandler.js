var formidable = require('formidable');
var spawn = require('child_process').spawn;
var fs = require('fs');
var email = require('./emailer');
var path = require('path');
var settings = require("./configs.js");
var childOpts = {cwd: 'data/uploads'};

           
var upload = function(res, request){
    console.log("Request Handler 'upload' was called.");
    var form = new formidable.IncomingForm();
    		form.uploadDir = './data/incoming/';
    console.log('About to parse');
    console.log(form);

    fs.readdir('./data/uploads', function(err, files){
    	if(err) console.log(err);
      //add ability to hook into this is display all user's uploaded files
      if(files) {
      	console.log("here are some file" + files);
      }
    });
    
    form.parse(request, function(error, fields, files) {
      if (!files) {
        res.writeHead(500, {'content-type' : 'text/plain'});
        res.write('No files to parse.');
        res.end;
      }

    	if(error) {
      	console.log(error);
        res.writeHead(500, {'content-type' : 'text/plain'});
        res.write('There was an error processing you request. Please try again.');
        res.end;
      }
        
	     console.log(files);
	     console.log(fields);
	     var codecParse  = fields.format.split('.'),
		       codec       = codecParse[0],
		       format      = codecParse[1],
		       tracks      = fields.numTracks,
		       sampleRate  = fields.sampleRate,
		       rate        = fields.bitRate,
		       formatExt   = '.' + codecParse[1],
		       file        = files.fileToUpload.name,
		       clientEmail = '',
		       browserDL   = '',
		       date        = new Date(),
		       output      = file.split('.'),
		       finalOutput = output[0]+'_'+date+alphaRandom()+formatExt;
    
        if(fields.email != '') {
       		clientEmail = fields.email;
        } else{ 
         	clientEmail = false;
        }
        
        if(fields.noEmail == 'on') {
          browserDL = true;
        } else{ 
          browserDL = false;
        }
        
        console.log('parsing done ' + date);
       
        var ffmpeg = spawn('ffmpeg',
                           ['-y','-i', file, '-acodec', codec, '-ar', sampleRate, '-ac', tracks, '-ab',
                            rate, '-f', format, finalOutput],childOpts);
     
        fs.rename(files.fileToUpload.path, "./data/uploads/" + file, function(err) {
        	console.log('renaming file');
          if(err) console.log(err);
         	convert(ffmpeg, res, finalOutput, clientEmail, browserDL);
       	});
    });    
}

var convert = function(ffmpeg, res, finalOutput, clientEmail, browserDL) {
	console.log('convert called');
	ffmpeg.stderr.setEncoding('utf8');
	var temp,
	    lines,
	    time = [],
	    finalTime,
	    timeUp;
	res.writeHead(200, {'Content-type' : 'type/html'});

	ffmpeg.stdout.on('data', function(data) {
    
	});

	ffmpeg.stderr.on('data', function (data) {
	  temp = data.toString();
	  lines = temp.split('\n');
	  for(var i = 0;i<lines.length;i++) {
	    if(lines[i].match(/Duration/)) {
	      var duration = lines[i];
	      var finalTime =  duration.match(/\d[0-9]+\:\d[0-9]\:\d[0-9]\.\d[0-9]/);
	    }
	      if(lines[i].match(/time=\d[0-9]+\:\d[0-9]\:\d[0-9]\.\d[0-9]/)) {          
	        time = lines[i].split('=');   
	      }
     
	      if(!(time.length < 1)) {
	        timeUp = time[2].match(/\d[0-9]+\:\d[0-9]\:\d[0-9]\.\d[0-9]/);
	      }
	  }
	});

	ffmpeg.on('exit', function(code) {
	  res.write('<br /><span>Your file was uploaded successfully!</span>');
	  if(browserDL) {
	    res.write("<br /><a id='download-button' href='/download?url="+finalOutput+"'>click to download your file</a>"); 
	  }
	  res.end();
	  console.log('child process ffmpeg exited with code ' + code);
	  onSuccess(code, finalOutput, clientEmail);
	});
}

var onSuccess = function(code, finalOutput, clientEmail) {
	var redis = require("redis");
	var client = redis.createClient();
	console.log('success test called');
	console.log(clientEmail);
	var downloadKey;
	if(code == 0) {
	  do {
	    downloadKey = alphaRandom();
	  } while (client.exists(downloadKey, function(err) {console.log('while loop error?:   '+err);}));
  
	    client.on("error", function (err) {
	        console.log("Error " + err);
	    });
    
	    client.on('connect', function() {
	    console.log('redis connection established, saving key: ' + downloadKey);
	    console.log('value for redis store:  '+finalOutput);
	    client.set(downloadKey, finalOutput, redis.print);
	    client.expire(downloadKey, settings.settings.redisCacheTime, redis.print);
	      client.get(downloadKey, redis.print);          
	    });
     
	    if(clientEmail) {
	      var linkToURL = "<a href='" + settings.settings.downloadFrom + "/show?url=" 
	                        + downloadKey + "'>Click to visit your download page.</a>";
	      var plain = settings.settings.downloadFrom + "/show?url="+downloadKey;
	      email.emailer(clientEmail,linkToURL,plain);
	    }

	} else {
	    console.log('no dice on that file upload conejito');
	}

	client.on('end', function(err) {
	  console.log('something went wrong with redis');
	  client.quit();
	});
}

var show = function(res, req, query) {
  
	var redis = require("redis");
	var client = redis.createClient();
	console.log('show function called with query string: ' +query);
	console.log(client);

	client.on("error", function (err) {
	  console.log("Error " + err);
	});

	client.get(query, function(err, reply) {
	  if(err) {
	  	console.log('Error querying the database, returned:  ' + err);
	  }
    console.log(reply);
    fs.readdir(__dirname + '/data/uploads/', function(err, files) {
    	console.log(files);
      	if(err) {
        	console.log(err);
          res.writeHead(500, {'content-type' : 'text/plain'});
          res.write('There was an error processing your request. Please try again.');
          res.end;
        }

        for(var i = 0;i<files.length;i++) {
          if(files[i] === reply) {
            console.log(files[i]);
            res.writeHeader(200, {'Content-Type':'text.html'});
            res.write('<a href=/download?url='+encodeURI(files[i])+'>Click to download your converted file</a>');
            res.end();
          }
        }
        
        res.writeHead(404, {'Content-Type' : 'text/html'});
        res.end('No files found.  Your download link has likely expired');   
    }	);

	  client.quit();
	});
}

var download = function(res, req, query) {
	console.log('download function called with query string '+query);
	var mime = require('mime');
	var filename = decodeURI(query);
	var file = __dirname+'/data/uploads/'+filename;
	var mimetype = mime.lookup(file);

	res.setHeader('Content-disposition', 'attachment; filename='+filename);
	res.setHeader('Content-type', mimetype);
                
	var filestream = fs.createReadStream(file, function(err) {
	  if(err) console.log(err);
	});
	
  filestream.on('data', function(chunk) {
    res.write(chunk);
  });
  filestream.on('end', function() {
    res.end();
  });              
}

var alphaRandom = function() {
	console.log("generating download key");
	var string = "";
	var range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 8; i++ ) {
	  string += range.charAt(Math.floor(Math.random() * range.length));
	}
	return string;
}

exports.upload = upload;
exports.convert = convert;
exports.show = show;
exports.download = download;
