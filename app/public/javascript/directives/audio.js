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
          var URL = window.URL || window.webkitURL || {};

          scope.$on("dragAndDrop:validFile", function(evt, file) { 
            scope.createUrl(file);
          });

          scope.getFileLength = function() {
            $rootScope.$broadcast("encoderAudioTag:fileLength",element[0].duration);
            scope.revokeUrl();
          };

          scope.createUrl = function(file) {
            scope.srcUrl = URL.createObjectURL(file);
            return true;
          };

          scope.revokeUrl = function() {
            return URL.revokeObjectURL(scope.srcUrl);
          };

          element.bind("loadeddata", scope.getFileLength);
        }
      };
    }
  ]
);
