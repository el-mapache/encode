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

var module = angular.module("Uploader", []);

module.service('Uploader', [
  '$rootScope',
function($rootScope) {
  
  STATUS_REGEX = /^[45]\d{2}/;

  function onComplete(evt) {
    var response = evt.currentTarget;

    // If the uploader encounters an error, pass along the error name
    if (STATUS_REGEX.test(response.status)) {
      $rootScope.$broadcast("failed", response.statusText);
    } else { 
      $rootScope.$broadcast("complete", response.responseText);
    }
  }

  function onFailed(evt) {}

  function onCanceled(evt) {
    $rootScope.$broadcast("failed", "The upload has been canceled by the user or the browser dropped the connection.");
  }

  function onProgress(evt) {
    if (evt.lengthComputable) {
      $rootScope.$broadcast("progress", evt.loaded, evt.total);
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

      xhr.open("post", "/upload", true);

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          clearEvents(xhr);
        }
      };

      // Express expects a token, so set it here
      xhr.setRequestHeader("X-CSRF-TOKEN", token);
      xhr.upload.addEventListener("progress", onProgress, false);
      xhr.addEventListener("load", onComplete, false);
      xhr.addEventListener("error", onFailed, false);
      xhr.addEventListener("abort", onCanceled, false);

      xhr.send(payload);
    }
  };
}]);

