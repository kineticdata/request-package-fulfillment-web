angular.module('kineticdata.fulfillment.controllers.main', [
  'ui.router',
  'kineticdata.fulfillment.services.filter'
])
  .controller('MainController', ['$scope', '$stateParams', '$log', 'filters', function($scope, $stateParams, $log, filters) {
    'use strict';
    $log.info('{CTRL} Initializing MainController.');

    /// Holds the name of the active filter, 'default' means look up the default one.
    $scope.activeFilter = $stateParams.id;

    $scope.filters = filters;

    /**
     * Helper function used to determine whether a filter is the actively selected filter.
     * @param {string} filter the name of a filter.
     */
    $scope.isActiveFilter = function(filter) {
      var name = $scope.activeFilter;
      if(name === 'default') {
        name = $scope.filters.getDefault().name;
      }
      return name === filter.name;
    };

    /**
     * Watches for the 'krs-filter-changed' event, save the filter name.
     */
    $scope.$on('krs-filter-changed', function(event, filter) {
      $scope.activeFilter = filter;
    });

  }]);
