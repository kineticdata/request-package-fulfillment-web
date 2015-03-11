angular.module('kineticdata.fulfillment.services.filter', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.dataproviderfactory'
])
  .service('FiltersService', ['$q', '$http', '$log', 'ConfigService', 'DataProviderFactory', function($q, $http, $log, ConfigService, DataProviderFactory) {
    'use strict';

    //var filterProvider = PaginatedDataProviderFactory.getResourceProvider('/work-orders/filters', 'FilterCollection');
    var filterProvider = new DataProviderFactory.get('PaginatedRestfulDataResource', {
      url: '/work-orders/filters',
      model: 'FilterCollection'
    });

    /// Retrieves all filters from the KR server.
    var getFilters = function() {
      return filterProvider;
    };

    return {
      getFilters: getFilters
    };
  }]);
