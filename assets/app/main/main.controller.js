angular.module('kineticdata.fulfillment.controllers.main', [
  'ui.router',
  'kineticdata.fulfillment.services.filter'
])
  .controller('MainController', ['$scope', '$urlMatcherFactory', '$state', '$location', '$log', 'filters', function($scope, $urlMatcherFactory, $state, $location, $log, filters) {
    'use strict';
    $log.info('{CTRL} Initializing MainController.');

    var getCurrentFilterFromState = function() {
      var urlMatcher = $urlMatcherFactory.compile($state.$current.url.sourcePath);
      var stateParams = urlMatcher.exec($location.url());

      return decodeURIComponent(stateParams.id);
    };

    /// Holds the name of the active filter, 'default' means look up the default one.
    $scope.activeFilter = getCurrentFilterFromState();
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

    $scope.selectFilter = function(filter){
      if(filter === 'default') {
        $state.go('workorders', {id: $scope.filters.getDefault().name});
      } else {
        $state.go('workorders', {id: filter});
      }

    };

    $scope.filterName = function(filter){
      if(filter === 'search') {
        return 'Search Results';
      } else if (filter === 'default') {
        return $scope.filters.getDefault().name;
      }
      return filter;
    };

    /**
     * Watches for the 'krs-filter-changed' event, save the filter name.
     */
    $scope.$on('$stateChangeSuccess', function() {
      $scope.activeFilter = getCurrentFilterFromState();
    });

  }]);
