/*
 * This service provides a wrapper for the native XMLHttp request.
 * When I wrote this, jQuery did not have support for asynchronous file
 * transfers, and it may still lack this functionality.
 *
 * Service communicates with the rest of the app by broadcasting its events through
 * the RootScope
 *
 * This service provides a single public method, "upload"
 *
 * Upload:
 * @param {payload} FormData Object
 * @param {token} String: CSRF token
 */

var module = angular.module("Uploader", []);

module.service('Uploader', [
  '$rootScope',
function($rootScope) {

  function onComplete(evt) {
    var response = evt.currentTarget;

    if (/(4\d{2}|5\d{2})/.test(response.status)) {
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

  return {
    upload: function(payload,token) {
      var xhr = new XMLHttpRequest();

      xhr.open("post", "/upload", true);

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('yay')
          } else if (/(^4\d{2}|^5\d{2})/.test(xhr.status)) {
            xhr.upload.removeEventListener("progress");
          }
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

