/*
 * This service provides a wrapper for the native XMLHttp request.
 * When I wrote this, jQuery did not have support for asynchronous file
 * transfers, and it may still lack this functionality.
 *
 * Service communicates with the rest of the app by broadcasting its events through
 * the RootScope.
 *
 * This service provides a single public method, "#upload"
 *
 * Upload:
 * @param {payload} FormData Object
 * @param {token} String: CSRF token
 */

var module = angular.module("Uploader", ["Poll"]);

module.service('Uploader', [
  '$rootScope',
  'Poll',
  function($rootScope, Poll) {
  
    STATUS_REGEX = /^[45]\d{2}/;

    // Callback function to be executed after file upload has finished.
    function onComplete(evt) {
      var response = JSON.parse(evt.currentTarget.response);

      // If the uploader encounters an error, pass along the error name
      if (STATUS_REGEX.test(response.status)) {
        return $rootScope.$broadcast("Uploader:failed", response.message);
      }

      $rootScope.$broadcast("Uploader:complete", response.message);

      var done = function(valid, progress) {
        // Emit the transcoder's progress
        $rootScope.$emit("Poll:progress", progress);

        if (valid) Poll.poll(response.token, done);
      };

      // Call the initial poll
      Poll.poll(response.token, done);

    }

    function onFailed(evt) {}

    function onCanceled(evt) {
      $rootScope.$broadcast("Uploader:failed", "The upload has been canceled by the user or the browser dropped the connection.");
    }

    function onProgress(evt) {
      if (evt.lengthComputable) {
        $rootScope.$broadcast("Uploader:progress", evt.loaded, evt.total);
      }
    }

    // Removes xhr event listeners after receiving a response from the server
    function clearEvents(xhrRequest) {
      xhrRequest.upload.removeEventListener("progress");
      xhrRequest.removeEventListener("abort");
      xhrRequest.removeEventListener("error");
      xhrRequest.removeEventListener("load");
    }

    return {
      upload: function(payload,token) {
        var xhr = new XMLHttpRequest();


        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            clearEvents(xhr);
          }
        };

        // Express expects a token, so set it here
        xhr.upload.addEventListener("progress", onProgress, false);
        xhr.addEventListener("load", onComplete, false);
        xhr.addEventListener("error", onFailed, false);
        xhr.addEventListener("abort", onCanceled, false);

        xhr.open("post", "/upload", true);

        xhr.setRequestHeader("X-CSRF-TOKEN", token);
        xhr.send(payload);
      }
    };
  }
]);

