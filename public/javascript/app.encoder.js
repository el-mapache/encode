var app = angular.module('encoder',
  [
    'FormData',
    'Uploader',
    'drag-and-drop',
    'progress-bar'
  ]
);

app.controller('UploaderCtrl', [
  '$scope',
  'FormData',
  'Uploader',
  '$http',
function($scope, FormDataService, UploadService, $http) {
  $scope.enableBitRate = true;

  // This object will hold all the values the user enters in the upload form
  $scope.formData = {};

  /*
   * Looks for changes to the format and displays different options accordingly
  */
  $scope.$watch("form.format.$viewValue", function(newValue) {
    // Choosing flac or ogg as the format allows for only the default 256k bit rate,
    // so we disable the bit rate selector and set its value programmatically.

    if (newValue == 'flac.flac' || newValue == 'libvorbis.ogg')  {
      $scope.toggleEnableBitRate();
      $scope.form.bitRate.$setViewValue(256000);
    } else {
      if (!$scope.enableBitRate) {

        // enable the bit rate field and reset its value

        $scope.toggleEnableBitRate();
        $scope.form.bitRate.$setViewValue(undefined);
      }
    }
  });

  // Enables and disables the bitrate select element
  $scope.toggleEnableBitRate = function() {
    return $scope.enableBitRate = !$scope.enableBitRate;
  };

  $scope.isFilePresent = function() {
    return $scope.file === true;
  };

  $scope.submit = function() {
    $scope.error = {};

    // Add the file to the formData structure
    $scope.formData['file'] = $scope.file

    UploadService.upload(FormDataService.process($scope.formData), $scope.form.csrf.$modelValue);
  };
}]);

// Drag and Drop module, with plain html input fallback
angular.module("drag-and-drop", [])
  .controller('DragDropCtrl', ["$rootScope", "$scope", function($rootScope, $scope) {

    // Properties
    $scope.dragging = false
    $scope.file = null;
    $scope.error = {};
    $scope.allowedFileTypes = /audio\/mp3|audio\/wav|audio\/x\-wav|audio\/mp4/;
    $scope.dropText = 'Drag an audio file here.';


    // Wrapped for convienience
    $scope.noop = function(evt) {
      evt.preventDefault();
    };

    /* Just a check to make sure someone hasn't declared an element draggable and is moving it
     * into the drop zone.
     * @param {evt} Object Javascript event object
     * @return Boolean
    */
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

      $rootScope.$broadcast("file");
    };

    $scope.getFileSize = function() {
      if ($scope.file.size > 1024 * 1024) {
        return (Math.floor($scope.file.size * 100 / (1024 * 1024)) / 100) + 'mb';
      }

      return (Math.floor($scope.file.size * 100 / 1024) / 100) + 'kb';
    };

  }]).directive("dnd", function() {
    // This directive provides a wrapper for the directives nested within,
    // ensuring everything is scoped properly
    return {
      transclude: true,
      restrict: 'EA',
      replace: false,
      controller: "DragDropCtrl",
      templateUrl: "../templates/dnd.html"
    };

  }).directive('dropBox', ['$parse', function ($parse) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: '../templates/file-info.html',
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

  angular.module('progress-bar', []).controller("ProgressCtrl", ['$rootScope',"$scope", function($rootScope, $scope) {
    $rootScope.$on("file", $scope.reset);

    $scope.reset = function() {
      $scope.response = "";
      $scope.uploading = false;
      $scope.success = false;
      $scope.progress = "0px";
      $scope.bytesTransfered = null;
      $scope.percent = null;
    };

    $scope.reset();

    /* Angular doesn't have an explicit 'off' method to call on event listeners.
     * When a listener is generated it is wrapped in a function.
     * To remove a listener, save it to a variable on creation and then call that
     * variable as a function to execute.
     *
     * Ex. var myHandler = $scope.$on("event", function() { 
     *       //perform magic;
     *       myHandler();
     *     });
    */

    $rootScope.$on("complete", function(evt, response) {
      // The upload is finished successfully.
      $scope.$apply(function() {
        $scope.response = response.message;
        $scope.success = true;
      });
    });

    $rootScope.$on("failed", function(evt, message) {
      // The upload has failed.

      $scope.$apply(function() {
        $scope.reset();
        $scope.response = message;
      });
    });

    $rootScope.$on("progress", function(evt, bytesLoaded, byteTotal) {
      $scope.$apply(function() {
        if (!$scope.uploading) $scope.uploading = !$scope.uploading;

        $scope.updateProgress(bytesLoaded, byteTotal);
      });
    });

    $scope.updateProgress = function(uploaded, total) {
      var bytesUploaded = uploaded,
          bytesTotal = total,
          percentComplete = Math.round(uploaded * 100 / total);


      if (bytesUploaded > 1024*1024) {
        $scope.bytesTransfered = (Math.round(bytesUploaded * 100/(1024*1024))/100) + 'mb';
      } else if (bytesUploaded > 1024) {
        $scope.bytesTransfered = (Math.round(bytesUploaded * 100/1024)/100) + 'kb';
      } else {
        $scope.bytesTransfered = (Math.round(bytesUploaded * 100)/100) + 'bytes';
      }

      $scope.progress = (percentComplete * 3.55) + 'px';
      $scope.percent = percentComplete + "%";
    };

     }]).directive('progressBar', function() {
      return {
        restrict: "AE",
        replace: true,
        templateUrl: "../templates/progress.html",
        controller: 'ProgressCtrl',
        scope: false,
        link: function(scope, elem, attrs) {}
      };
    });

