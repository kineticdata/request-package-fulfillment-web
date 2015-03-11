angular.module('kineticdata.fulfillment.controllers.main', [
  'ui.router',
  'kineticdata.fulfillment.services.filter'
])
  .controller('MainController', ['$scope', '$stateParams', '$log', 'flash', 'DataProviderFactory', 'FiltersService', function($scope, $stateParams, $log, flash, DataProviderFactory, FiltersService) {
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

    /**
     * Triggers the retrieval of all of the filters.
     */
    $scope.retrieveAllFilters = function() {
      $scope.filtersProvider.get().then(
        function() {
          // TODO:MTR I should do something with filter loading.
        },
        function() {
          // TODO:MTR there should be a better way to do this.
          $log.error('Failed to load all filters');
          flash.error = 'There was a problem loading available filters.';
        }
      );
    };

    /**
     * Watches for the 'krs-filter-changed' event, save the filter name.
     */
    $scope.$on('krs-filter-changed', function(event, filter) {
      $scope.activeFilter = filter;
    });

    $scope.retrieveAllFilters();

  }]);
