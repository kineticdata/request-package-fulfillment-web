angular.module('kineticdata.fulfillment.services.workorder', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.paginateddataprovider'
])
  .service('WorkOrdersService', ['$q', '$http', '$log', 'ConfigService', 'ModelFactory', 'DataProviderFactory', function($q, $http, $log, ConfigService, ModelFactory, DataProviderFactory) {
    'use strict';

    var workOrderUrl = ConfigService.getBaseUrl() + '/work-orders';
    var workOrderFactory = ModelFactory.get('WorkOrder');

    var workOrdersByFilterCache = {};
    var workOrderCache = {};

    var getWorkOrdersWithSearch = function(searchTerms) {
      return new DataProviderFactory.get('PaginatedRestfulDataResource', {
        url: '/work-orders/search&query='+searchTerms,
        model: 'WorkOrderCollection'
      });
    };

    /// Retrieves all filters from the KR server.
    var getWorkOrdersWithFilter = function(filterName) {
      //var deferred = $q.defer();
      if(workOrdersByFilterCache[filterName] === undefined) {
        workOrdersByFilterCache[filterName] = DataProviderFactory.get('PaginatedRestfulDataResource',{
          url: '/work-orders&filter=' + filterName,
          model: 'WorkOrderCollection'});
      }

      return workOrdersByFilterCache[filterName];
    };

    var getWorkOrderById = function(id) {
      var deferred = $q.defer();

      // Retrieve and, if necessary, initialize the cache.

      if(!angular.isDefined(workOrderCache[id])) {
        workOrderCache[id] = {};
        workOrderCache[id].promises = [];
        workOrderCache[id].data = {};
        workOrderCache[id].dirty = true;
      }
      var cache = workOrderCache[id];

      // If data retrieval is pending.
      if(cache.promises.length > 0) {
        cache.promises.push(deferred);

      // Data has not yet been loaded, so kick it off.
      } else if(!angular.isDefined(cache.data) || cache.dirty) {
        $log.debug('{SVC} Attempting to retrieve WorkOrder.')
        cache.promises.push(deferred);

        var url = workOrderUrl + '/' + id;
        $http.get(url)
          .success(function(data, status, headers) {
            //$log.info('headers:', data, headers('content-type'))
            if(headers('content-type') === 'text/html;charset=UTF-8') {
              $log.error('{SVC} Rejected invalid response, response not in JSON.');
              while(cache.promises.length) {
                cache.promises.shift().reject(data);
              }
            } else {
              cache.data = new workOrderFactory.factoryObject(data);
              cache.dirty = false;
              while(cache.promises.length) {
                cache.promises.shift().resolve(cache.data);
              }
            }
          })
          .error(function(data) {
            while(cache.promises.length) {
              cache.promises.shift().reject(data);
            }
          });
      } else {
        deferred.resolve(cache.data);
      }

      return deferred.promise;
    };

    var getWorkOrderNotesById = function(id) {
      return DataProviderFactory.get('PaginatedRestfulDataResource', {
        url: '/work-orders/' + id + '/notes',
        model: 'WorkOrderNoteCollection'
      })
      //return PaginatedDataProviderFactory.getResourceProvider(, 'WorkOrderNoteCollection');
      //return workOrderNotes;
    };

    var getWorkOrderLogsById = function(id) {
      return DataProviderFactory.get('PaginatedRestfulDataResource', {
        url: '/work-orders/' + id + '/logs',
        model: 'WorkOrderLogCollection'
      });
      //return PaginatedDataProviderFactory.getResourceProvider(, );
      //return workOrderNotes;
    };

    var postNoteById = function(id, message, visibility) {
      visibility = typeof visibility === 'undefined' ? 'Public' : visibility;
      var deferred = $q.defer();
      var url = workOrderUrl + '/' + id + '/notes';

      $http.post(url, {visibilityFlag: visibility, note: message})
        .success(function(data, status, headers) {
          if(headers('content-type') === 'text/html;charset=UTF-8') {
            $log.error('Failure from server: response not in JSON.', data);
            deferred.reject(data);
          } else {
            deferred.resolve(data);
          }
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    return {
      getWorkOrdersWithFilter: getWorkOrdersWithFilter,
      getWorkOrdersWithSearch: getWorkOrdersWithSearch,
      getWorkOrder: getWorkOrderById,
      getWorkOrderLogs: getWorkOrderLogsById,
      getWorkOrderNotes: getWorkOrderNotesById,
      postNote: postNoteById
    };
  }]);
