var fs = require("fs");

function File(params) {
  // Codec and format information is passed in in the format of
  // 'codec.extension'. For example "libmp3lame.mp3"
  var codecAndFormat = params["format"].split("."),
      filenameParts = params["source"].name.split(".");

  this.source = params["source"];
  this.codec = codecAndFormat[0];
  this.format = codecAndFormat[1];
  this.channels = params["channels"];
  this.sampleRate = params["samplerate"];
  this.originalFormat = filenameParts[filenameParts.length - 1];
  this.normalizedName = this.rename();
  this.bitRate = params["bitrate"];
  this.timeInSeconds = params["fileTimeInSeconds"];
}

/* Strip off the files extension and return a new name with underscores
 * in place of all dashes and spaces, and a timestamp.
 * 
 * @return String the normalized filename
*/
File.prototype.rename = function() {
  var name = this.source.name.split(".")[0];

  return [name.replace(/[-\s()]/g,"_"), "_", +new Date, "."].join("");
}

/* Attempt to permanantly store the file in the uploads directory.
 * If any information needed to process the file is missing,
 * immediately pass an error to the done callback.
 *
 * @param {done} Function Callback returns an err or null
*/
File.prototype.save = function(done) {
  if (!this.format || !this.channels ||
      !this.sampleRate || !this.bitRate || !this.source) {
    return done("Invalid arguments supplied. Source, format, number of channels, bit and sample rates must be specified.");
  }

  var newPath = GLOBAL.dirname + "/data/uploads/" + this.normalizedName + this.originalFormat;

  fs.rename(this.source.path, newPath, function(err) {
    done(err);
  });
}

module.exports = File;

