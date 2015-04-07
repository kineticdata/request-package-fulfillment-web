angular.module('kineticdata.fulfillment.services.filter', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.dataproviderfactory'
])
  .service('FiltersService', ['$q', '$http', '$log', 'ConfigService', 'DataProviderFactory', 'Restangular', 'ModelFactory', function($q, $http, $log, ConfigService, DataProviderFactory, Restangular, ModelFactory) {
    'use strict';

    //var filterProvider = PaginatedDataProviderFactory.getResourceProvider('/work-orders/filters', 'FilterCollection');
    var filterProvider = new DataProviderFactory.get('PaginatedRestfulDataResource', {
      url: '/work-orders/filters',
      model: 'FilterCollection'
    });

    var factory = ModelFactory.get('FilterCollection');

    /// Retrieves all filters from the KR server.
    var getFilters = function() {
      return filterProvider;
    };

    var api = function() {
      return Restangular.withConfig(function(RestangularConfigurer) {
        // Set the filters base URL.
        RestangularConfigurer.setBaseUrl('http://localhost:8080/kinetic/DisplayPage?name=ACME2-FulfillmentAPI&call=/api/v1/work-orders');
        RestangularConfigurer.setDefaultHttpFields({cache: true});
        RestangularConfigurer.addResponseInterceptor(function(data, operation) {
          if(operation === 'getList') {
            var newData = new factory.factoryObject(data.filters);
            return newData.all;
          }

          return result;
        });
      }).service('filters');
    };

    return {
      getFilters: getFilters,
      api: api
    };
  }]);
