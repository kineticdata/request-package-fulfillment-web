angular.module('kineticdata.fulfillment.controllers.workorderlist', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderListController', ['$scope', '$rootScope', '$state', '$stateParams', '$log', '$interval', '$cacheFactory', 'FiltersService', 'WorkOrdersService', 'filters', 'workOrders', 'currentFilter', function($scope, $rootScope, $state, $stateParams, $log, $interval, $cacheFactory, FiltersService, WorkOrdersService, filters, workOrders, currentFilter) {
    'use strict';

    // Prepare scope varaibles.
    $scope.currentFilter = currentFilter;
    $scope.workOrders = workOrders;

    /// This will hold scope methods meant primarily for internal controller use.
    $scope.internal = {};
    $scope.internal.workOrderLoadFailures = 0;
    $scope.api = WorkOrdersService.WorkOrders(true);

    $scope.listParams = {
      filter: $scope.currentFilter.name
    };

    /**
     * Determines if the current state is a child of this controller's typical state.
     * @returns {boolean} true if the state is a child state of 'workorder'
     */
    $scope.isChildState = function() {
      var currentState = $state.current.name;
      return currentState.match(/workorders\./) !== null;
    };

    ////////////////////////
    // WORK ORDER LOADING //
    ////////////////////////

    $scope.loadWorkOrders = function() {
      $cacheFactory.get('$http').removeAll();
      $scope.api.getList({filter: $scope.currentFilter.name, refresh: true}).then(
        function(data) {
          $scope.workOrders = data;
        },
        function() {
          toastr.error('There was a problem refreshing work orders.');
        }
      )
    };

    /**
     * Changes UI state to the selected work order object's detail view.
     */
    $scope.selectWorkOrder = function(workOrder) {
      if(angular.isDefined($scope.currentFilter.terms)) {
        $state.go('workorders.detail', { id: 'search', terms: $scope.currentFilter.terms, workOrderId: workOrder.id });
      } else {
        $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: workOrder.id });
      }
    };

    $scope.isActiveWorkOrder = function(workOrder) {
      return workOrder.id === $scope.activeWorkOrder
    };

    ///////////////////////////////
    // CONTROLLER INITIALIZATION //
    ///////////////////////////////

    $scope.activeWorkOrder = '';
    $rootScope.$on('krs-workorder-changed', function(event, workOrder) {
      $scope.activeWorkOrder = workOrder;
    });

    $rootScope.$on('krs-workorder-modified', function(event, workOrderId) {
      $log.info('{WorkorderListController} A work order has been changed, refreshing the list.');
      $scope.loadWorkOrders();
    });

  }]);
