angular.module('kineticdata.fulfillment.controllers.workorderlist', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderListController', ['$scope', '$rootScope', '$state', '$stateParams', '$log', '$interval', 'FiltersService', 'WorkOrdersService', 'filters', 'workOrders', 'currentFilter', function($scope, $rootScope, $state, $stateParams, $log, $interval, FiltersService, WorkOrdersService, filters, workOrders, currentFilter) {
    'use strict';

    // Prepare scope varaibles.
    $scope.currentFilter = currentFilter;
    $scope.workOrders = workOrders;
    $scope.workOrderProvider;
    $scope.filtersLoading = false;
    $scope.workOrdersLoading = false;

    /// This will hold scope methods meant primarily for internal controller use.
    $scope.internal = {};
    $scope.internal.workOrderLoadFailures = 0;
    $scope.api = WorkOrdersService.api();


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

    /**
     * Handles successful work order list loading.
     *
     * This method is called as the success function for work order list loading
     * and will update the UI to indicate loading has completed and saves the
     * work order list into the controller scope.
     *
     * @param {WorkOrderCollection} workOrders a generated work order collection from rest data.
     */
    $scope.internal.loadWorkOrdersSuccess = function(workOrders) {
      $scope.workOrdersLoading = false;
      $scope.workOrders = workOrders;
    };

    /**
     * Handles UI updates when work order list loading fails.
     */
    $scope.internal.loadWorkOrdersFailure = function() {
      // Handle failed loading.
      $state.go('dataerror');
    };

    /**
     * Toggles UI-related scope variables to indicate that work order list loading
     * is starting and that data may be being refreshed.
     */
    $scope.internal.loadWorkOrdersStart = function() {
      $scope.workOrdersLoading = true;
    };

    /**
     * This method is used to begin the process of loading work orders based on
     * the currently selected filter: <pre>$scope.currentFilter</pre>. This method
     * should be used when retrieving data or refreshing data is required, not the
     * internal methods it uses.
     */
    $scope.loadWorkOrdersD = function(refresh) {
      if($scope.workOrderProvider === undefined) {
        if(angular.isDefined($scope.currentFilter.terms)) {
          $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithSearch($scope.currentFilter.terms);
        } else {
          $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name);
        }
      }

      $scope.internal.loadWorkOrdersStart();
      $scope.workOrderProvider.get(refresh).then(
        $scope.internal.loadWorkOrdersSuccess, $scope.internal.loadWorkOrdersFailure
      );
    };

    $scope.loadWorkOrders = function() {
      WorkOrdersService.api().getList({filter: $scope.currentFilter.name, refresh: true}).then(
        function(data) {
          $scope.filters = data;
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
      if(workOrder.id === $scope.activeWorkOrder) {
        return true;
      }
      return false;
    };

    ///////////////////////////////
    // CONTROLLER INITIALIZATION //
    ///////////////////////////////

    $scope.activeWorkOrder = '';
    $rootScope.$on('krs-workorder-changed', function(event, workOrder) {
      $scope.activeWorkOrder = workOrder;
    });

  }]);
