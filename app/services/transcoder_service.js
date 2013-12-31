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
        '-y', '-i', GLOBAL.dirname+"/data/uploads/"+this.file.normalizedName, 
        '-acodec', this.file.codec, 
        '-ar', this.file.sampleRate, 
        '-ac', this.file.channels, 
        '-ab', this.file.bitRate, 
        '-f', this.file.format, 
        GLOBAL.dirname+"/"+this.file.normalizedName], {cwd: "data/uploads"});

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
    //proc = new ffmpeg({ source: GLOBAL.dirname + "/data/uploads/" + this.file.normalizedName });

    //proc.withNoVideo(true)
    //    .withAudioBitrate(this.file.bitRate)
    //    .withAudioCodec(this.file.codec)
    //    .withAudioChannels(this.file.channels)
    //    .withAudioFrequency(this.file.sampleRate)
    //    .toFormat(this.file.format)
    //    .onProgress(function(progress) {
    //      console.log(progress);
    //    });
    //proc.saveToFile(GLOBAL.dirname+"/"+this.file.normalizedName, function(stdout, stderr) {
    //  // Confusingly, ffmpeg writes all output the std error
    //  callback(null, stderr);
    //});
  };

  return new TranscoderService(file);
};

