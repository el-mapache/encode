var progress = angular.module('progress-bar', []);

progress.controller("ProgressCtrl", [
  '$rootScope',
  "$scope", 
  function($rootScope, $scope) {
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

    $rootScope.$on("upload:complete", function(evt, message) {
      // The upload finished successfully.
      $scope.$apply(function() {
        $scope.response = message;
        $scope.success = true;
      });
    });

    $rootScope.$on("upload:failed", function(evt, message) {
      // The upload failed.
      $scope.$apply(function() {
        $scope.response = message;
      });
    });

    $rootScope.$on("upload:progress", function(evt, bytesLoaded, byteTotal) {
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
  }
])

progress.directive('progressBar', function() {
  return {
    restrict: "AE",
    replace: true,
    templateUrl: "../templates/progress.html",
    controller: 'ProgressCtrl',
    scope: false
  };
});

