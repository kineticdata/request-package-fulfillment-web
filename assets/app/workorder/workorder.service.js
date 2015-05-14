angular.module('kineticdata.fulfillment.services.workorder', [
  'kineticdata.fulfillment.services.config'
])
  .service('WorkOrdersService', ['$q', '$http', '$log', '$rootScope', 'ConfigService', 'ModelFactory', 'Restangular', function($q, $http, $log, $rootScope, ConfigService, ModelFactory, Restangular) {
    'use strict';

    var workOrderUrl = ConfigService.getBaseUrl() + '/work-orders';

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

    var workOrders = function(shouldCache) {
      return api('WorkOrderCollection', shouldCache).service('work-orders')
    };

    var search = function() {
      return api('WorkOrderCollection').all('work-orders').all('search')
    };

    var workOrder = function(workOrderId) {
      return api('WorkOrder').service('work-orders').one(workOrderId);
    };

    var logs = function(workOrderId) {
      return api('WorkOrderLogCollection').one('work-orders', workOrderId).all('logs')
    };

    var notes = function(workOrderId) {
      return api('WorkOrderNoteCollection').one('work-orders', workOrderId).all('notes')
    };

    var api = function(modelFactory, shouldCache) {
      var factory = ModelFactory.get(modelFactory);

      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setRestangularFields({
          id: 'id'
        });

        if(shouldCache) {
          $log.info('{WordOrderService} Enabled caching for model: ' + modelFactory);
          RestangularConfigurer.setDefaultHttpFields({cache: true});
        }

        RestangularConfigurer.addResponseInterceptor(function(data, operation) {
          var newData = new factory.factoryObject(data);
          if (operation === 'getList') {
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

      // Methods:
      postNote: postNoteById,
      postAssignments: postAssignments,
      postAssignMe: postAssignMe,
      api: api,
      WorkOrders: workOrders,
      WorkOrder: workOrder,
      Logs: logs,
      Notes: notes,
      Search: search
    };
  }]);
