angular.module('kineticdata.fulfillment.directives.worktab', [])
  .directive('workTab', [ '$log', '$rootScope',
    function($log, $rootScope) {
      return {
        replace: false,
        restrict: 'A',
        link: function(scope, element) {
          var tabElement = $(element);
          scope.$root.$on('krs-workit', function() {
            $log.debug("ZZOMG WORK IT", tabElement)
            tabElement.tab('show');
          });
        }
      }
    }]);
