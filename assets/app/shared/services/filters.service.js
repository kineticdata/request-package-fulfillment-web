angular.module('kineticdata.fulfillment.services.filter', [
  'kineticdata.fulfillment.services.config'
])
  .service('FiltersService', ['$q', '$log', 'ConfigService', 'Restangular', 'ModelFactory', function($q, $log, ConfigService, Restangular, ModelFactory) {
    'use strict';

    $log.info('{FiltersService} Initializing service.');

    var factory = ModelFactory.get('FilterCollection');

    var api = function() {
      return Restangular.withConfig(function(RestangularConfigurer) {
        // Set the filters base URL.
        RestangularConfigurer.setBaseUrl(ConfigService.getBaseUrl());
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
      api: api
    };
  }]);
