angular.module('kineticdata.fulfillment.services.modelfactory', [

])
  .factory('ModelFactory', ['$log', function($log) {
    var modelFactory = {};
    modelFactory.factories = [];

    modelFactory.register = function(factoryClassName, factoryObject) {
      if(angular.isArray(factoryClassName)) {
        _.forEach(factoryClassName, function(factory) {
          $log.info('{MF} Registering ' + factory);
          modelFactory.factories[factory] = factoryObject;
        });
      } else {
        $log.info('{MF} Registering ' + factoryClassName);
        modelFactory.factories[factoryClassName] = factoryObject;
      }
    };

    modelFactory.get = function(factoryClassName) {
      return modelFactory.factories[factoryClassName];
    };

    return modelFactory;
  }]);
