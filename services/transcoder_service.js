var ffmpeg = require("fluent-ffmpeg");

exports.transcode = function(options, cb) {
  var proc = new ffmpeg({ 
    source: options.source
  }).withNoVideo(true)
    .withAudioBitrate(options.bitRate)
    .withAudioCodec(options.codec.split(".")[0])
    .withAudioChannels(options.channels)
    .withAudioFrequency(options.samplerate)
    .toFormat(options.format);

  cb(proc);
};
