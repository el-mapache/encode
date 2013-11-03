function File(params) {
  // Throw error if all the data we need isn't passed in
  if (!params["format"] || !params["channels"] ||
      !params["samplerate"] || !params["bitrate"] || !params["source"]) {
    throw new Error("Invalid arguments supplied. Source, format, number of channels, bit and sample rates must be specified.");
  }

  // Private functions
  function formatName(name) {
    return name.split(".")[0];
  }

  // Codec and format information is passed in in the format of
  // 'codec.extension'. For example "libmp3lame.mp3"
  var codecAndFormat = params["format"].split(".");

  this.source = params["source"];
  this.codec = codecAndFormat[0];
  this.format = codecAndFormat[1];
  this.channels = params["channels"];
  this.sampleRate = params["sampleRate"];
  this.originalFilename = formatName(this.source.name);
  this.bitRate = params["bitrate"];
}

File.prototype.rename = function() {
  return this.originalFilename + "_" + +new Date + "." + this.format;
}

exports.file = File;
