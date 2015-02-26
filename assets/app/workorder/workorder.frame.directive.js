angular.module('kineticdata.fulfillment.directives.workframe', [])
  .directive('workFrame', ['$log', '$http', function($log, $http) {
    var directive = {};

    directive.restrict = 'E';
    directive.template = '<div id="workFrame"></div>';

    directive.link = function(scope, element, attributes) {

      attributes.$observe('dest', function(dest) {
        if(dest == null || dest == '') {
          return;
        }

        $log.debug("Updating work frame URL: " + dest)
        var frame = $('div#workFrame');
        $http.get(""+dest)
          .success(function(data) {
            frame.html(data);
          })
          .error(function(data) {
            $log.error("Failed to retrieve work frame content.");
          });
      });
    };

    return directive;
  }]);
