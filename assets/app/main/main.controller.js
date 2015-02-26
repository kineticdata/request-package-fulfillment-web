angular.module('kineticdata.fulfillment.controllers.main', [
  'ui.router',
  'kineticdata.fulfillment.services.filter'
])
  .controller('MainController', ['$scope', '$stateParams', '$log', 'FiltersService', function($scope, $stateParams, $log, FiltersService) {
    'use strict';
    $log.info('{CTRL} Initializing MainController.');

    // Pre-populate scope.
    $scope.filterCollection = { filters:[] };
    $scope.filtersProvider = FiltersService.getFilters();
    $scope.activeFilter = 'default';

    $scope.isActiveFilter = function(filter) {
      return $scope.activeFilter === filter.name;
    };

    var retrieveAllFilters = function() {
      $scope.filtersProvider.get().then(
        function(filters) {
          $scope.filterCollection = filters;
        },
        function() {
          $log.error('Failed to load all filters');
        }
      );
      $log.debug($scope.filtersProvider);
    };

    // $scope.activate = function(filter) {
    //   $scope.activeFilter = filter.name;
    //   $log.debug('yay');
    // };

    // $scope.logout = function() {
    //   // The API does not allow logging out just yet.
    // };

    $scope.$on('krs-filter-changed', function(event, filter) {
      $scope.activeFilter = filter;
    });

    retrieveAllFilters();

  }]);
