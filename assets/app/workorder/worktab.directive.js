angular.module('kineticdata.fulfillment.directives.worktab', [])
  .directive('workTab', [ '$log',
    function($log) {
      return {
        replace: false,
        restrict: 'A',
        link: function(scope, element) {
          var tabElement = $(element);
          scope.$root.$on('krs-workit', function() {
            $log.info('{WorkTab} Detected workit event, changing tabs.');
            tabElement.tab('show');
          });
        }
      }
    }]);
