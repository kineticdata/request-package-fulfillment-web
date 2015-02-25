angular.module('kineticdata.fulfillment.controllers.main', [
  'ui.router',
  'kineticdata.fulfillment.services.filter'
])
  .controller('MainController', ['$scope', '$stateParams', 'FiltersService', function($scope, $stateParams, FiltersService) {
    // Pre-populate scope.
    $scope.filterCollection = { filters:[] };
    $scope.filtersProvider = FiltersService.getFilters();

    var retrieveAllFilters = function() {
      FiltersService.getFilters().then(function(filters) {
        $scope.filterCollection = filters;
      });
    };

    $scope.logout = function() {
      // The API does not allow logging out just yet.
    };

    retrieveAllFilters();

  }]);
