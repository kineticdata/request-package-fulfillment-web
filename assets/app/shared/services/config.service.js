angular.module('kineticdata.fulfillment.services.config', [])
  .provider('ConfigService', function() {
    var self = this;
    self.configs = {};
    //self.baseUrl = BUNDLE.config.displayPageUrlSlug + 'FulfillmentAPI&call=/api/v1';
    self.baseUrl = 'http://localhost:8080/kinetic/DisplayPage?name=Base-FulfillmentAPI&call=/api/v1';

    var service = {
      set: set,
      getBaseUrl: function() { return self.baseUrl; },
      $get: function() {
        return {
          getBaseUrl: function() { return self.baseUrl; },
          get: get,
          set: set
        };
      }
    };

    return service;

    function set(key, value) {
      self.configs[key] = value;
    }

    function get(key) {
      return self.configs[key];
    }
  });
