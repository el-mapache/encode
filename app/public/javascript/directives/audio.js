angular.module("audio-tag", []).directive("encoderAudioTag",
  [
    "$rootScope",
    function($rootScope) {
      return {
        restrict: 'EAC',
        replace: true,
        template: '<audio src={{srcUrl}} class="hide"></audio>',
        controller: function($scope) {
          $scope.srcUrl = "";
        },
        link: function(scope, element, attrs) {

          // Simple wrapper to account for cross browser differences, defaulting to a
          // no-op if the browser API isnt available.
          var URL = window.URL ||
                    window.webkitURL ||
                    {createObjectURL: function() {}, removeObjectURL: function() {}};

          var bindValidFile = $rootScope.$on("dragAndDrop:validFile", function(evt, file) {
            scope.createUrl(file);
          });

          scope.getFileLength = function() {
            $rootScope.$broadcast("encoderAudioTag:fileLength",element[0].duration);
            scope.revokeUrl();
          };

          // Create an objectURL blob to get timing information from the audio file
          scope.createUrl = function(file) {
            scope.srcUrl = URL.createObjectURL(file);
            return true;
          };

          // Remove the blob object to free up memory, especially in the case of
          // multiple files to be transcoded.
          scope.revokeUrl = function() {
            return URL.revokeObjectURL(scope.srcUrl);
          };

          element.bind("loadeddata", scope.getFileLength);

          scope.$on("$destroy", bindValidFile);
        }
      };
    }
  ]
);

