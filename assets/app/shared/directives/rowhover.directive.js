angular.module('kineticdata.fulfillment.directives.rowhover', [])
  .directive('rowHover', function() {
    var directive = {};

    directive.restrict = 'A';
    directive.link = function(scope, element) {
      $(element).hover(function() {
        $(this).css('background', '#f5f5f5');
      }, function() {
        $(this).css('background', '#fff');
      });
    }

    return directive;
  });
