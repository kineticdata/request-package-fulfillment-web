angular.module('kineticdata.fulfillment.services.workorder', [
  'kineticdata.fulfillment.services.config'
])
  .service('WorkOrdersService', ['$q', '$http', '$log', '$rootScope', 'ConfigService', 'ModelFactory', 'Restangular', 'Upload', function($q, $http, $log, $rootScope, ConfigService, ModelFactory, Restangular, Upload) {
    'use strict';

    var workOrderUrl = ConfigService.getBaseUrl() + '/work-orders';

    var postNoteById = function(id, note) {
      var deferred = $q.defer();
      var url = workOrderUrl + '/' + id + '/notes';

      var successFn = function(data, status, headers) {
        if(headers('content-type') === 'text/html;charset=UTF-8') {
          $log.error('Failure from server: response not in JSON.', data);
          deferred.reject(data);
        } else {
          deferred.resolve(data);
        }
      };

      var errorFn = function(data) {
        deferred.reject(data);
      };

      // If there is no attachment involved then we'll perform a straight HTTP POST.
      if(typeof note.attachment === 'undefined') {
        $http.post(url, {entry: note.entry})
          .success(successFn)
          .error(errorFn);
      } else {
        Upload.upload({
          url: url,
          fields: { entry: note.entry },
          file: note.attachment
        }).success(successFn).error(errorFn);
      }

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

    var activeWorkOrder = '';
    $rootScope.$on('krs-workorder-changed', function(event, workOrder) {
      activeWorkOrder = workOrder;
    });

    var workOrders = function() {
      return api('WorkOrderCollection').service('work-orders')
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

    var api = function(modelFactory) {
      var factory = ModelFactory.get(modelFactory);

      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setRestangularFields({
          id: 'id'
        });

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
