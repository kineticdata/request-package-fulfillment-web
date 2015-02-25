angular.module('kineticdata.fulfillment.services.filter', [
  'kineticdata.fulfillment.services.config'
])
  .service('FiltersService', ['$q', '$http', '$log', 'ConfigService', 'PaginatedDataProviderFactory', function($q, $http, $log, ConfigService, PaginatedDataProviderFactory) {
    var filterProvider = PaginatedDataProviderFactory.getResourceProvider('/work-orders/filters', 'FilterCollection');
    var loading = false;

    var promises = [];

    /// Retrieves all filters from the KR server.
    var getFilters = function() {
      $log.debug('{SVC} FiltersService :: Getting filters.');
      var deferred = $q.defer();

      if(promises.length > 0) {
        $log.debug('{SVC} FiltersService :: Filters are loading...');
        promises.push(deferred);
      } else if(filterProvider.data === undefined) {
        $log.debug('{SVC} FiltersService :: Initiate loading filters.');
        promises.push(deferred);

        filterProvider.get().then(
          function() {
            $log.debug('{SVC} FiltersService :: Successfully loaded filters', filterProvider.data);
            while(promises.length) {
              promises.shift().resolve(filterProvider.data);
            }
          },
          function() {
            while(promises.length) {
              promises.shift().reject();
            }
          }
        );
      } else {
        deferred.resolve(filterProvider.data);
      }

      return deferred.promise;
    };






    return {
      getFilters: getFilters
    };
  }]);
