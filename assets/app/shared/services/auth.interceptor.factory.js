angular.module('kineticdata.fulfillment.interceptors.auth', [])
  .factory('AuthInterceptor', [ '$q', function($q) {
    return {
      responseError: function(response) {
        if(response.status === 401) {
          var deferred = $q.defer();

          // Attempt to log in. Reject or resolve the deferred object appropriately.
          BUNDLE.ajaxLogin({
            error: function() {
              deferred.reject();
            },
            success: function() {
              deferred.resolve();
            }
          });

          // When the login is successful try to make the same backend call again and chain the request
          return deferred.promise.then(function() {
            return $http(response.config)
          })
        }

        return $q.reject(response);
      }
    }
  }]);

