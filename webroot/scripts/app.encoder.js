var app = angular.module("encoder",[]);

app.controller("UploaderCtrl", function($scope) {
  
});

app.controller("DragDropCtrl", function($scope) {
  $scope.dragging = false;
  $scope.file = null;
  $scope.hasFile = false;

  // RegExp representing default file mime types
  $scope.allowedFileTypes = /audio\/mp3|audio\/wav|audio\/mp4/;
  
  // Default drop area text 
  $scope.dropText = "Drag an audio file here.";

  $scope.preventDefault = function(evt) {
    evt.preventDefault();
  };
  
  $scope.isFile = function(evt) {
    return evt.dataTransfer.types[0] === "Files";
  }
  
  $scope.isValidType = function() {
    return $scope.allowedFileTypes.test($scope.file.type);
  };

  $scope.handleDrop = function(evt) {
    if ($scope.isFile(evt)) {
      // Grab first file dragged in, as we only allow one at a time
      $scope.file = evt.dataTransfer.files[0];
      $scope.verifyFile();
    }
    
    $scope.dragging = !$scope.dragging;
  };

  $scope.verifyFile = function() { 
    if (!$scope.isValidType()) {
      return $scope.error = {
        error: true,
        message: "Only audio files are allowed."
      };
    }

    if (!$scope.allowedFileTypes.test($scope.file.type)) {
      return $scope.error = {
        error: true,
        message: "Invalid audio format."
      };
    }
    
    $scope.hasFile = $scope.file ? !$scope.hasFile : !!$scope.hasFile;
  };

  $scope.getFileSize = function() {
    if ($scope.file.size > 1024 * 1024) {
        return (Math.floor($scope.file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    }
    return (Math.floor($scope.file.size * 100 / 1024) / 100).toString() + 'KB';
  };
});

app.directive("dragDrop", ["$parse", function ($parse) {
  return {
    restrict: "EA",
    transclude: true,
    replace: false,
    templateUrl: '/scripts/file-info.html',
    controller: "DragDropCtrl",
    scope: {
      dragging: "&dragging",
      fileInfo: "&file",
      dropText: "&dropText"
    },
    link: function(scope, elem, attrs, controller) {
      scope.dropText = attrs.dropText || scope.dropText;
      scope.allowedFileTypes = (attrs.allowedFileTypes && $parse(attrs.allowedFileTypes)(scope)) || scope.allowedFileTypes;
console.log(scope)
      function dragInOut(evt) {
        scope.$apply(function() {
          scope.dragging  = !scope.dragging;
        });
      }

      elem.bind('dragleave', dragInOut);
      elem.bind('dragenter', dragInOut);
      elem.bind("dragstart", dragInOut);
      elem.bind("dragend", dragInOut);

      elem.bind('dragover', function(evt) {
        scope.$apply(function() {
          scope.preventDefault(evt);
        });
      });

      elem.bind('drop', function(evt) {
        scope.$apply(function() {
          scope.preventDefault(evt);
          scope.handleDrop(evt);
        });
      });
    }
  }
}]);

