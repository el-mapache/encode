/* 
 * Drag and Drop module, with plain html input fallback.
 * Defaults to allowing only a subset of audio files.
**/
var dnd = angular.module("drag-and-drop", []);

dnd.controller('DragDropCtrl', [
  "$rootScope", 
  "$scope", 
  function($rootScope, $scope) {

    // Properties
    $scope.dragging = false
    $scope.file = null;
    $scope.error = {};
    $scope.allowedFileTypes = /audio\/mp3|audio\/wav|audio\/x\-wav|audio\/mp4|audio\/ogg|audio\/flac/;
    $scope.dropText = 'Drag an audio file here.';


    /* Just a check to make sure someone hasn't declared an element draggable and is moving it
     * into the drop zone.
     * @param {evt} Object Javascript event object
     * @return Boolean
    */
    $scope.isFile = function(evt) {
      return (evt.target.files && evt.target.files.length) || evt.dataTransfer.types[0] === 'Files';
    }

    // Ensure the user is attempting to upload a valid file type.
    $scope.isValidType = function() {
      return $scope.allowedFileTypes.test($scope.file.type);
    };

    $scope.handleDrop = function(evt) {
      if ($scope.isFile(evt)) {
        // Grab first file dragged in, as we only allow one to be submitted at a time.
        $scope.file = (evt.target.files && evt.target.files[0]) || evt.dataTransfer.files[0];
        $scope.verifyFile();
      }
    };

    // Currently just allowing for one error message at a time
    $scope.addError = function(message) {
      $scope.error = null;
      $scope.error = {
        error: true,
        message: message
      };
    };

    $scope.verifyFile = function() { 
      if (!$scope.allowedFileTypes.test($scope.file.type)) {
        $scope.file = null;
        return $scope.addError("Invalid audio format.");
      }

      if ($scope.error.error) $scope.error = {}; 

      $rootScope.$emit("dragAndDrop:validFile", $scope.file);
    };

    $scope.getFileSize = function() {
      if ($scope.file.size > 1024 * 1024) {
        return (Math.floor($scope.file.size * 100 / (1024 * 1024)) / 100) + 'mb';
      }

      return (Math.floor($scope.file.size * 100 / 1024) / 100) + 'kb';
    };

  }
]);

dnd.directive("dnd", function() {
  // This directive provides a wrapper for the directives nested within,
  // ensuring everything is scoped properly
  return {
    transclude: true,
    restrict: 'EA',
    replace: false,
    controller: "DragDropCtrl",
    templateUrl: "../templates/dnd.html"
  };
});

dnd.directive('dropBox', [
  '$parse', 
  function ($parse) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '../templates/file-info.html',
      require: "^dnd",
      link: function(scope, elem, attrs, controller) {

        // Set properties if they were passed in
        scope.dropText = attrs.dropText || scope.dropText;
        scope.allowedFileTypes = (attrs.allowedFileTypes && $parse(attrs.allowedFileTypes)(scope)) || scope.allowedFileTypes;

        // Private callback to toggle if we are actively dragging an element..not necessary right now
        function dragInOut(evt) {
          scope.$apply(function() {
            scope.dragging  = !scope.dragging;
          });
        }

        elem.bind('dragleave', dragInOut);
        elem.bind('dragenter', dragInOut);
        elem.bind('dragstart', dragInOut);
        elem.bind('dragend', dragInOut);

        elem.bind('dragover', function(evt) {
          scope.$apply(function() {
            evt.preventDefault();
            scope.dragging = !scope.dragging;
          });
        });

        elem.bind('drop', function(evt) {
          scope.$apply(function() {
            evt.preventDefault();
            scope.dragging = !scope.dragging;
            scope.handleDrop(evt);
          });
        });
      }
    };
  }
])

dnd.directive('fileInput', function() {
  return {
    require: '^dnd',
    restrict: 'AE',
    replace: true,
    templateUrl: '../templates/file-input.html',
    controller: function($scope) {
      $scope.chooseFile = function() {
        $scope.input[0].click();
      };

      $scope.setFile = function(evt) {
        $scope.$apply(function() {
          $scope.handleDrop(evt);
        });
      };
    },

    link: function(scope, elem, attrs) {
      scope.input = elem.find('input');
      scope.input.bind('change', scope.setFile);
    }
  };
});

