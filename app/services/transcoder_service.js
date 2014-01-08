/*
 * Uses fluent ffmpeg to wrap the ffmpeg command line api and
 * transcode audio files.
 */
var ffmpeg = require("fluent-ffmpeg");
var spawn = require('child_process').spawn;

module.exports = function(file) {
  // Service must be initialized with a File object, see app/models/file.js
  function TranscoderService(file) {
    this.file = file;
  }

  TranscoderService.prototype.transcode = function(callback) {
    if (!this.file || typeof this.file === "undefined") {
      return;
    }

    var proc,
        callback = typeof callback === "function" ? callback : function(){};

    // Create a new ffmpeg procedure
    var ffmpeg = spawn('ffmpeg', [
        '-y', '-i', GLOBAL.dirname+"/data/uploads/"+this.file.normalizedName + this.file.originalFormat,
        '-acodec', this.file.codec,
        '-ar', this.file.sampleRate,
        '-ac', this.file.channels,
        '-ab', this.file.bitRate,
        '-f', this.file.format,
        GLOBAL.dirname+"/"+this.file.normalizedName+this.file.format], {cwd: "data/uploads"});

    ffmpeg.stderr.setEncoding('utf8');

    ffmpeg.stderr.on('data', function (data) {
      var temp = data.toString();
      var lines = temp.split("\n");

      for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(/^size=/)) {
          var thisLine = lines[i];

          var matchGroup = /^size=.+time=(\d{2}:\d{2}:\d{2})/.exec(thisLine);
          var timeString = matchGroup[1];
          var timeList = timeString.split(":");
          var h = +timeList[0],
              m = +timeList[1],
              s = +timeList[2];

          var currentSeconds = ((h * 60 * 60) + (m * 60) + s);
          callback(null, currentSeconds);
        }
      }

    });

    ffmpeg.on('exit', function(code) {
      console.log("exiting")
      console.log(code)
      callback(null, code);
    });
  };

  return new TranscoderService(file);
};

