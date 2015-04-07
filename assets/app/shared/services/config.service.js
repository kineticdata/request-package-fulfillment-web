angular.module('kineticdata.fulfillment.services.config', [])
  .service('ConfigService', function() {
    //var baseUrl = BUNDLE.config.displayPageUrlSlug + 'FulfillmentAPI&call=/api/v1';
    var cookiePath = '/kinetic';
    var baseUrl = 'http://localhost:8080/kinetic/DisplayPage?name=ACME2-FulfillmentAPI&call=/api/v1';

    return {
      getBaseUrl: function() {return baseUrl; },
      getCookiePath: function() { return cookiePath; }
    };
  });
