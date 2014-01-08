/*
 * Return progress from ffmpeg transcoding
 * TODO Maybe make this a singleton, also, allow user
 * to pass in the http method and route, as well as options
 * if http method is POST?
**/
var module = angular.module("Poll", []);

module.service("Poll", function($rootScope) {
  return {
    poll: function(token, done) {

      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {

          // Percentage of the completed job.
          var progress = JSON.parse(xhr.response).response.progress;

          // If the job is done, return and stop polling.
          if (progress == 100) return done(false, 100);

          // Return the current progress and a flag to keep polling.
          return done(true, progress);
        }
      };

      xhr.open("get", "/info/"+token, true);

      xhr.send();
    }
  };
});
