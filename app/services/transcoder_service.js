var ffmpeg = require("fluent-ffmpeg");

module.exports = function(file) {
  function TranscoderService(file) {
    this.file = file;
  }

  TranscoderService.prototype.transcode = function(callback) {
    var proc,
        callback = typeof callback === "function" ? callback : function(){};

    proc = new ffmpeg({ source: this.file.source.path });

    proc.withNoVideo(true)
        .withAudioBitrate(this.file.bitRate)
        .withAudioCodec(this.file.codec)
        .withAudioChannels(this.file.channels)
        .withAudioFrequency(this.file.sampleRate)
        .toFormat(this.file.format);

    proc.saveToFile(__dirname+"/"+this.file.rename(), function(stdout, stderr) {
      // Confusingly, ffmpeg writes all output the std error
      callback(null, stderr);
    });
  };

  return new TranscoderService(file);
};

