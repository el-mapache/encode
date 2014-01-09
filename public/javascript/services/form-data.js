/*
 * Simple service that accepts an object of key value pairs,
 * representing information entered into a form.
 *
 * Constructs a new FormData object, populates and returns it
 *
 * Public API
 * process: Passed an object of form data, loops through and creates
 * a new FormData object.
 */
var module = angular.module("FormData", []);

module.service('FormData', function() {
  return {
    process: function(formData) {
      var fd = new FormData();

      // Loop thru form object and populate FormData instance
      angular.forEach(formData, function(value, key) {
        fd.append(key, value);
      });

      return fd;
    }
  };
});

