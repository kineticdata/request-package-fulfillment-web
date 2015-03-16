angular.module('kineticdata.fulfillment.directives.workframe', [])
  .directive('workFrame', ['$log', '$http', function($log, $http) {
    var directive = {};

    directive.restrict = 'E';
    directive.template = '<iframe id="workFrame"></iframe>';

    directive.link = function(scope, element, attributes) {

      attributes.$observe('dest', function(dest) {
        if(dest == null || dest == '') {
          return;
        }

        $log.debug("Updating work frame URL: " + dest);
        var frame = $('iframe#workFrame');
        frame.attr('src', dest);
        frame.on('load', function(){
          var iFrameHeight = frame[0].contentWindow.document.body.scrollHeight + 'px';
          var iFrameWidth = '100%';
          frame.css('width', iFrameWidth);
          frame.css('height', iFrameHeight);
        });
      });

    };

    return directive;
  }]);
