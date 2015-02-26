angular.module('kineticdata.fulfillment.services.workorder', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.paginateddataprovider'
])
  .service('WorkOrdersService', ['$q', '$http', '$log', 'ConfigService', 'ModelFactory', 'PaginatedDataProviderFactory', function($q, $http, $log, ConfigService, ModelFactory, PaginatedDataProviderFactory) {
    'use strict';

    var workOrderUrl = ConfigService.getBaseUrl() + '/work-orders';
    var workOrderFactory = ModelFactory.get('WorkOrder');

    var workOrdersByFilterCache = {};

    /// Retrieves all filters from the KR server.
    var getWorkOrdersWithFilter = function(filterName) {
      //var deferred = $q.defer();
      if(workOrdersByFilterCache[filterName] === undefined) {
        workOrdersByFilterCache[filterName] = PaginatedDataProviderFactory.getResourceProvider('/work-orders&filter=' + filterName, 'WorkOrderCollection');
      }

      return workOrdersByFilterCache[filterName];
      // Copy the cache to the target object.
      //angular.copy(workOrdersByFilterCache[filterName].data, target);

      // workOrdersByFilterCache[filterName].get().then(
      //   function() {
      //     // Cache the data.
      //     angular.copy(workOrdersByFilterCache[filterName].data, target);
      //     deferred.resolve();
      //   },
      //   function() {
      //     deferred.reject();
      //   }
      // );
      //
      // return deferred.promise;
    };

    var getWorkOrderById = function(id) {

      var deferred = $q.defer();
      var url = workOrderUrl + '/' + id;

      $http.get(url)
        .success(function(data, status, headers) {
          //$log.info('headers:', data, headers('content-type'))
          if(headers('content-type') === 'text/html;charset=UTF-8') {
            $log.error('Failure from server: response not in JSON.');
            deferred.reject(data);
          } else {
            deferred.resolve(new workOrderFactory.factoryObject(data));
          }
        })
        .error(function(data) {
          $log.error('failed')
          deferred.reject(data);
        });

      return deferred.promise;
    };

    var getWorkOrderNotesById = function(id) {
      return PaginatedDataProviderFactory.getResourceProvider('/work-orders/' + id + '/notes', 'WorkOrderNoteCollection');
      //return workOrderNotes;
    };

    var getWorkOrderLogsById = function(id) {
      return PaginatedDataProviderFactory.getResourceProvider('/work-orders/' + id + '/logs', 'WorkOrderLogCollection');
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
      getWorkOrder: getWorkOrderById,
      getWorkOrderLogs: getWorkOrderLogsById,
      getWorkOrderNotes: getWorkOrderNotesById,
      postNote: postNoteById
    };
  }]);
