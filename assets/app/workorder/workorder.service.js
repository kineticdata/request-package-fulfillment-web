angular.module('kineticdata.fulfillment.services.workorder', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.paginateddataprovider'
])
  .service('WorkOrdersService', ['$q', '$http', '$log', '$rootScope', '$timeout', 'ConfigService', 'ModelFactory', 'DataProviderFactory', 'Restangular', function($q, $http, $log, $rootScope, $timeout, ConfigService, ModelFactory, DataProviderFactory, Restangular) {
    'use strict';

    var workOrderUrl = ConfigService.getBaseUrl() + '/work-orders';
    var workOrderFactory = ModelFactory.get('WorkOrder');

    var workOrdersByFilterCache = {};
    var workOrderCache = {};

    var markAllFiltersAsDirty = function() {
      $log.debug('laksjdf');
      _.forEach(Object.keys(workOrdersByFilterCache), function(key) {
        $log.debug(workOrdersByFilterCache);
        workOrdersByFilterCache[key].cache.dirty = true;
      });
      $log.debug('endeded.');
    };
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

    /**
     * Check to see if a work order is preloadable.
     *
     * Work Orders can be preloaded first from local pre-order cache and then
     * by the filter list cache.
     *
     * @param {string} id work order id.
     * @returns {boolean} whether a work order can be preloaded.
     */
    var canPreloadWorkOrder = function(id) {
      // Is it in the local cache?
      if(angular.isDefined(workOrderCache[id])) {
        return true;

      // Is there an active filter...
      } else if(typeof activeFilter !== 'undefined' && activeFilter.length > 0) {
        // If there is check to ensure that the cache is valid.
        if(typeof workOrdersByFilterCache[activeFilter] !== 'undefined'
        && typeof workOrdersByFilterCache[activeFilter].cache !== 'undefined'
        && typeof workOrdersByFilterCache[activeFilter].cache.data !== 'undefined') {
          return true;
        }
      }
    };

    var getWorkOrderById = function(id) {
      var deferred = $q.defer();

      // Preload, if possible.
      if(canPreloadWorkOrder(id)) {
        var preloadWorkOrder;

        // Try local cache first.
        if(angular.isDefined(workOrderCache[id])) {
          preloadWorkOrder = workOrderCache[id].data;
        } else {
          preloadWorkOrder = workOrdersByFilterCache[activeFilter].cache.data.getById(id);
        }

        //var preloaded = workOrdersByFilterCache[activeFilter].cache.data.getById(id);

        // This is a silly hack since it appears to wait to resolve this until the
        // next digest cycle, $rootScope.$apply rejects the call due to current
        // cycle...
        $timeout(function() {
          deferred.notify(preloadWorkOrder);
        }, 0);

      }

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
        $log.debug('{SVC} Attempting to retrieve WorkOrder.');
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
              //cache.dirty = false;
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
      });
    };

    var getWorkOrderLogsById = function(id) {
      return DataProviderFactory.get('PaginatedRestfulDataResource', {
        url: '/work-orders/' + id + '/logs',
        model: 'WorkOrderLogCollection'
      });
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

    var postAssignments = function(id, assignments) {
      var deferred = $q.defer();
      var url = workOrderUrl + '/' + id + '/assign';

      $http.post(url, assignments)
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

    var postAssignMe = function(id) {
      var deferred = $q.defer();
      var url = workOrderUrl + '/' + id + '/assign/me';

      $http.post(url, {})
        .success(function(data, status, headers) {
          if(headers('content-type') === 'text/html;charset=UTF-8') {
            $log.error('Failure from server: response not in JSON.', data);
            deferred.reject(data);
          } else {
            deferred.resolve(data);
          }
        })
        .error(function(data, status) {
          data.status = status;
          deferred.reject(data);
        });

      return deferred.promise;
    };

    var activeFilter = '';
    $rootScope.$on('krs-filter-changed', function(event, filter) {
      activeFilter = filter;
    });

    var activeWorkOrder = '';
    $rootScope.$on('krs-workorder-changed', function(event, workOrder) {
      activeWorkOrder = workOrder;
    });

    $rootScope.$on('krs-complete-wo', function(event) {
      $log.debug('a work order was completed, refreshing filter: ' + activeFilter);
    });

    var collectionFactory = ModelFactory.get('WorkOrderCollection');
    var individualFactory = ModelFactory.get('WorkOrder');

    var workOrders = function() {
      return api('WorkOrderCollection').service('work-orders')
    };

    var workOrder = function(workOrderId) {
      return api('WorkOrder').service('work-orders').one(workOrderId);
    };

    var logs = function(workOrderId) {
      return api('WorkOrderLogCollection').one('work-orders', workOrderId).all('logs')
    };

    var api = function(modelFactory) {
      var factory = ModelFactory.get(modelFactory);

      return Restangular.withConfig(function(RestangularConfigurer) {
        Restangular.setRestangularFields({
          id: 'id'
        });

        RestangularConfigurer.addResponseInterceptor(function(data, operation) {
          var newData = new factory.factoryObject(data);
          if (operation === 'getList') {
            console.log(newData)
            console.log(data);
            return newData.all;
          } else if(operation === 'get') {
            return newData;
          }
          return data;
        });
      });
    };

    return {
      // Properties:
      activeFilter: activeFilter,
      activeWorkOrder: activeWorkOrder,

      // Helper Methods:
      canPreloadWorkOrder: canPreloadWorkOrder,
      markAllFiltersAsDirty: markAllFiltersAsDirty,

      // Methods:
      getWorkOrdersWithFilter: getWorkOrdersWithFilter,
      getWorkOrdersWithSearch: getWorkOrdersWithSearch,
      getWorkOrder: getWorkOrderById,
      getWorkOrderLogs: getWorkOrderLogsById,
      getWorkOrderNotes: getWorkOrderNotesById,
      postNote: postNoteById,
      postAssignments: postAssignments,
      postAssignMe: postAssignMe,
      api: api,
      WorkOrders: workOrders,
      WorkOrder: workOrder,
      Logs: logs
    };
  }]);
