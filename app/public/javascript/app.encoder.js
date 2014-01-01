var app = angular.module('encoder',
  [
    'FormData',
    'Uploader',
    'drag-and-drop',
    'progress-bar',
    'audio-tag'
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

    // Set select tag defaults
    $scope.channels = [
      {value: 2, name: "Stereo"}, 
      {value: 1, name: "Mono"}
    ];
    $scope.formData.channels = $scope.channels[0].value;

    $scope.formats = [
      {value: "libvorbis.webm", name: "WebM"},
      {value: "aac.mp4", name: "MP4"},
      {value: "libmp3lame.mp3", name: "MP3"},
      {value: "flac.flac", name: "FLAC"},
      {value: "libvorbis.ogg", name: "OGG"},
    ];
    $scope.formData.format = $scope.formats[2].value;
    
    $scope.bitrate = [
      {value: "64000", name: "64k"},
      {value: "96000", name: "96k"},
      {value: "128000", name: "128k"},
      {value: "192000", name: "192k"},
      {value: "256000", name: "256k"},
      {value: "320000", name: "320k"}
    ];
    $scope.formData.bitrate = $scope.bitrate[4].value;

    $scope.samplerates = [
      {value: "44100", name: "44.1k"},
      {value: "48000", name: "48k"}
    ];
    $scope.formData.samplerate = $scope.samplerates[0].value;

    /*
     * Looks for changes to the format.
     * Disables the bit rate option if user is converting to either flac or ogg,
     * as either of those formats allow for a bit rate of 256k.
    */
    $scope.$watch("form.format.$viewValue", function(newValue) {

      if (newValue == 'flac.flac' || newValue == 'libvorbis.ogg')  {

        $scope.toggleEnableBitRate();
        $scope.form.bitRate.$setViewValue(256000);

      } else {
        if (!$scope.enableBitRate) {

          // Enable the bit rate field and reset its value.
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

    $scope.$on("encoderAudioTag:fileLength", function(evt, fileLength) {
      $scope.fileTimeInSeconds = fileLength;
    });

    $scope.submit = function() {
      $scope.error = {};

      // Add the file to the formData structure
      $scope.formData['file'] = $scope.file
      $scope.formData['fileTimeInSeconds'] = $scope.fileTimeInSeconds;

      UploadService.upload(FormDataService.process($scope.formData), $scope.form.csrf.$modelValue);
    };
  }
]);

