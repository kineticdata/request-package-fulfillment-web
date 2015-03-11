angular.module('kineticdata.fulfillment.services.dataproviderfactory', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.modelfactory'
])
  .factory('DataProviderFactory', ['$q', '$log', '$http', 'ConfigService', 'ModelFactory', function($q, $log, $http, ConfigService, ModelFactory) {
    'use strict';

    $log.info('{SVC} DataProviderFactory :: Initializing.');

    var factories = {};
    var register = function(key, factory) {
      factories[key] = factory;
    };

    var get = function(key, options) {
      if(factories[key] === undefined) {
        return;
      }

      return new factories[key](options);
    };

    return {
      register: register,
      get: get
    };
  }]);
