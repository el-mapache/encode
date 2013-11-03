var support = {
  base62Random: function(strLen) {
    var RANGE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_",
        strLen = strLen || 8,
        outputString = "";

    for (var i = 0; i < 24; i++) {
      outputString += RANGE.charAt(Math.floor(Math.random() * RANGE.length));
    }
    
    return outputString;
  }
};

for (func in support) {
  exports[func] = support[func];
}
