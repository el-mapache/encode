var app = angular.module('encoder',['drag-and-drop']);

app.service('formData', function() {
  return {
    process: function(formData) {
      var fd = new FormData();

      angular.forEach(formData, function(value, key) {
        fd.append(key, value);
      });
    }
  };
});

app.service('uploader', ['$rootScope', function($rootScope) {
  function onComplete(evt) {
    $rootScope.$broadcast("complete", evt.target.responseText);
  }

  function onFailed(evt) {
    $rootScope.$broadcast("failed", "An error occurred while uploading the file.");
  }

  function onCanceled(evt) {
    $rootScope.$broadcast("canceled", "The upload has been canceled by the user or the browser dropped the connection.");
  }

  function onProgress(evt) {
    if (evt.lengthComputable) {
      $rootScope.$broadcast("progress", evt.loaded, evt.total);
    }
  }

  return {
    upload: function(payload) {
      var xhr = new XMLHttpRequest();

      xhr.open("post", "/upload", true);

      xhr.onreadystatechange = function() {
        console.log(xhr)
        $rootScope.$broadcast("statechange", xhr.responseText);
      }

      xhr.upload.addEventListener("progress", onProgress, false);
      xhr.addEventListener("load", onComplete, false);
      xhr.addEventListener("error", onFailed, false);
      xhr.addEventListener("abort", onCanceled, false);

      xhr.send(fd);
    }
  };
});

app.controller('UploaderCtrl', ['$scope', 'formData', function($scope, formDataService) {
  $scope.enableBitRate = true;
  $scope.formData = {};

  $scope.$watch('form.email.$viewValue', function(newValue, oldValue) {
    if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(newValue))) {
      $scope.form.email.$invalid = true;
    }
  });

  $scope.$watch("form.format.$viewValue", function(newValue) {
    // These settings allow for only the default 256k bit rate,
    // so we disable the bit rate selector and set its value
    // programmatically
    if (newValue == 'flac.flac' || newValue == 'libvorbis.ogg')  {
      $scope.toggleEnableBitRate();
      $scope.form.bitRate.$setViewValue(256000);
    } else {
      $scope.toggleEnableBitRate();
      $scope.form.bitRate.$setViewValue(undefined);
    }
  });

  $scope.toggleEnableBitRate = function() {
    return $scope.enableBitRate = !$scope.enableBitRate;
  };

  $scope.isFilePresent = function() {
    return $scope.file == true;
  };

  $scope.submit = function() {
    if ($scope.error.error) $scope.error = {};
    
    $scope.formData['file'] = $scope.file;
    formDataService.process($scope.formData);
  }; 
}]);

angular.module("drag-and-drop", [])
  .controller('DragDropCtrl', function($scope) {
    // Properties
    $scope.dragging = false
    $scope.file = null;
    $scope.hasFile = false;
    $scope.error = {};
    $scope.allowedFileTypes = /audio\/mp3|audio\/wav|audio\/mp4/;
    $scope.dropText = 'Drag an audio file here.';



    // Wrapped for convienience
    $scope.noop = function(evt) {
      evt.preventDefault();
    };

    $scope.isFile = function(evt) {
      return (evt.target.files && evt.target.files.length) || evt.dataTransfer.types[0] === 'Files';
    }

    $scope.isValidType = function() {
      return $scope.allowedFileTypes.test($scope.file.type);
    };

    $scope.handleDrop = function(evt) {
      if ($scope.isFile(evt)) {
        // Grab first file dragged in, as we only allow one at a time
        $scope.file = (evt.target.files && evt.target.files[0]) || evt.dataTransfer.files[0];
        $scope.verifyFile();
      }
      
      $scope.dragging = !$scope.dragging;
    };

    $scope.addError = function(message) {
      $scope.error = null;
      $scope.error = {
        error: true,
        message: message
      };
    };
    
    $scope.verifyFile = function() { 
      if (!$scope.isValidType()) {
        return $scope.addError("Only audio files are allowed!");
      }

      if (!$scope.allowedFileTypes.test($scope.file.type)) {
        return $scope.addError("Invalid audio format!");
      }

      if ($scope.error.error) $scope.error = {}; 

      $scope.hasFile = true;
    };

    $scope.getFileSize = function() {
      if ($scope.file.size > 1024 * 1024) {
        return (Math.floor($scope.file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
      }
      
      return (Math.floor($scope.file.size * 100 / 1024) / 100).toString() + 'KB';
    };

  }).directive("dnd", function() {
    // This directive provides a wrapper for the directives nested within,
    // ensuring everything is scoped properly
    return {
      transclude: true,
      restrict: 'EA',
      replace: false,
      controller: "DragDropCtrl",
      templateUrl: "/scripts/dnd.html"
    };

  }).directive('dropBox', ['$parse', function ($parse) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '/scripts/file-info.html',
      require: "^dnd",
      link: function(scope, elem, attrs, controller) {
        // Set properties if they were passed in
        scope.dropText = attrs.dropText || scope.dropText;
        scope.allowedFileTypes = (attrs.allowedFileTypes && $parse(attrs.allowedFileTypes)(scope)) || scope.allowedFileTypes;

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
            scope.noop(evt);
          });
        });

        elem.bind('drop', function(evt) {
          scope.$apply(function() {
            scope.noop(evt);
            scope.handleDrop(evt);
          });
        });
      }
    };

  }]).directive('fileInput', function() {
    return {
      require: '^dnd',
      restrict: 'AE',
      replace: true,
      templateUrl: '/scripts/file-input.html',
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
  }).directive('progressBar', ['$rootScope', function($rootScope) {
    return {
      restrict: "EA",
      replace: true,
      templateUrl: "/scripts/progress.html",
      controller: function($scope) {

      },
      link: function(scope, elem, attrs) {

      }
    };
  }]);

