angular.module('kineticdata.fulfillment.directives.workframe', [])
  .directive('workFrame', ['$log', '$http', function($log, $http) {
    var directive = {};

    directive.restrict = 'E';
    directive.template = '<iframe id="workFrame"></iframe>';

    directive.link = function(scope, element, attributes) {

      var updater = {
        updated: function() {
          // Not sure if I need this.
        },
        completed: function() {
          var injector = angular.element($('[ng-app]')).injector();
          injector.invoke(['$log', '$state', '$timeout', '$cacheFactory', 'WorkOrdersService', function($log, $state, $timeout, $cacheFactory, wos) {
            $cacheFactory.get('$http').removeAll();

            var filter = (wos.activeFilter===''?'default':wos.activeFilter);
            $timeout(function() {
              $state.go('workorders', { id: filter });
            }, 3000);
          }]);
        }
      };

      attributes.$observe('dest', function(dest) {
        if(dest == null || dest == '') {
          return;
        }

        $log.info('{WorkFrame} Updating work frame URL: ' + dest);
        var frame = $('iframe#workFrame');
        frame.attr('src', dest);
        frame.on('load', function(){
          frame[0].contentWindow.KRFWorkOrder = updater;

          var iFrameHeight = frame[0].contentWindow.document.body.scrollHeight + 'px';
          var iFrameWidth = '100%';
          frame.css('width', iFrameWidth);
          frame.css('height', iFrameHeight);
        });
      });

    };

    return directive;
  }]);
