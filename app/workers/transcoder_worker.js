var TranscoderWorker = function(file, email) {
  this.type = "transcode";
  this.title = file.normalizedName;
  this.user = email;
};

TranscoderWorker.prototype.perform = function(job, done) { 
  TranscoderService(file);
  transcoder.transcode(function(err, output) {
    if (err) console.log(done(err)); 
    done("File converted successfully.");
  });
};
