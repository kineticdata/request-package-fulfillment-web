angular.module('kineticdata.fulfillment.services.filter', [
  'kineticdata.fulfillment.services.config'
])
  .service('FiltersService', ['$q', '$http', '$log', 'ConfigService', 'PaginatedDataProviderFactory', function($q, $http, $log, ConfigService, PaginatedDataProviderFactory) {
    'use strict';

    var filterProvider = PaginatedDataProviderFactory.getResourceProvider('/work-orders/filters', 'FilterCollection');

    /// Retrieves all filters from the KR server.
    var getFilters = function() {
      return filterProvider;
    };

    return {
      getFilters: getFilters
    };
  }]);
