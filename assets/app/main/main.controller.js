angular.module('kineticdata.fulfillment.controllers.main', [
  'ui.router',
  'kineticdata.fulfillment.services.filter'
])
  .controller('MainController', ['$scope', '$stateParams', '$log', 'FiltersService', function($scope, $stateParams, $log, FiltersService) {
    'use strict';
    $log.info('{CTRL} Initializing MainController.');

    /// Holds all of the filters used in the pill-bar.
    $scope.filterCollection = {};
    /// Holds a copy of the resource provider for getting filters.
    $scope.filtersProvider = FiltersService.getFilters();
    /// Holds the name of the active filter, 'default' means look up the default one.
    $scope.activeFilter = 'default';

    /**
     * Helper function used to determine whether a filter is the actively selected filter.
     * @param {string} filter the name of a filter.
     */
    $scope.isActiveFilter = function(filter) {
      return $scope.activeFilter === filter.name;
    };

    $scope.retrieveAllFilters = function() {
      $scope.filtersProvider.get().then(
        function(filters) {
          $scope.filterCollection = filters;
        },
        function() {
          $log.error('Failed to load all filters');
        }
      );
    };

    $scope.$on('krs-filter-changed', function(event, filter) {
      $scope.activeFilter = filter;
    });

    $scope.retrieveAllFilters();

  }]);
