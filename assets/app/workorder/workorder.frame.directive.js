angular.module('kineticdata.fulfillment.directives.workframe', [])
  .directive('workFrame', ['$log', '$http', function($log, $http) {
    var directive = {};

    directive.restrict = 'E';
    directive.template = '<div id="workFrame"></div>';

    directive.link = function(scope, element, attributes) {

      var updater = {
        updated: function() {
          // Not sure if I need this.
        },
        completed: function() {
          var injector = angular.element($('[ng-app]')).injector();
          injector.invoke(['$log', '$state', '$timeout', '$urlMatcherFactory', '$location', function($log, $state, $timeout, $urlMatcherFactory, $location) {
            // Get the active filter from the current state's source path.
            var urlMatcher = $urlMatcherFactory.compile($state.$current.url.sourcePath);
            var stateParams = urlMatcher.exec($location.url());
            var filter = decodeURIComponent(stateParams.id);

            //var filter = (wos.activeFilter===''?'default':wos.activeFilter);
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


        console.log('{WorkFrame} Updating work frame URL: ' + dest);
        K.reset();
        K.load({
          container: '#workFrame',
          path: dest,
          completed: updater.completed
        });
      });

    };

    return directive;
  }]);
