angular.module('kineticdata.fulfillment.interceptors.auth', [])
  .factory('AuthInterceptor', [ '$q', function($q) {
    return {
      responseError: function(errorResponse) {
        if(errorResponse.status === 401) {
          BUNDLE.ajaxLogin();
        }

        return $q.reject(errorResponse);
      }
    }
  }]);

