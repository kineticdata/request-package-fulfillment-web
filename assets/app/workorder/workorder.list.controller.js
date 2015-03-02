angular.module('kineticdata.fulfillment.controllers.workorderlist', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderListController', ['$scope', '$rootScope', '$state', '$stateParams', '$log', '$interval', 'FiltersService', 'WorkOrdersService',
      function($scope, $rootScope, $state, $stateParams, $log, $interval, FiltersService, WorkOrdersService) {
    'use strict';

    // Prepare scope varaibles.
    $scope.currentFilter = {};
    $scope.workOrders = [];
    $scope.workOrderProvider;
    $scope.filterProvider = FiltersService.getFilters();
    $scope.filtersLoading = true;
    $scope.workOrdersLoading = true;

    /// This will hold scope methods meant primarily for internal controller use.
    $scope.internal = {};

    //var filters = [];

    $scope.isChildState = function() {
      var currentState = $state.$current.name;
      return currentState.match(/workorder\./) !== null;
    };

    ////////////////////
    // FILTER LOADING //
    ////////////////////

    $scope.setupFilterView = function() {
      //// First we need to get the collection of filters available and decide which one is the current filter.
      $scope.internal.loadFiltersStart();


      $scope.filterProvider.get().then($scope.internal.loadFiltersSuccess, $scope.internal.loadFiltersFailure);
    };

    $scope.internal.loadFiltersStart = function() {
      $scope.filtersLoading = true;
    };

    $scope.internal.loadFiltersSuccess = function(filters) {
      $scope.filtersLoading = false;

      if(typeof $stateParams.id === 'undefined') {
        $scope.currentFilter = filters.getDefault();
      } else if($stateParams.id === 'default') {
        $scope.currentFilter = filters.getDefault();
      } else {
        $scope.currentFilter = filters.getFilter($stateParams.id);
      }

      $rootScope.$broadcast('krs-filter-changed', $scope.currentFilter.name);
      $scope.loadWorkOrders();
    };

    $scope.internal.loadFiltersFailure = function() {
      // Handle failures on loading filters.
    };

    ////////////////////////
    // WORK ORDER LOADING //
    ////////////////////////

    $scope.internal.loadWorkOrdersSuccess = function(workOrders) {
      $scope.workOrdersLoading = false;
      $scope.workOrders = workOrders;
    };

    $scope.internal.loadWorkOrdersFailure = function() {
      // Handle failed loading.
    };

    $scope.internal.loadWorkOrdersStart = function() {
      $scope.workOrdersLoading = true;
    };

    $scope.loadWorkOrders = function() {
      if($scope.workOrderProvider === undefined) {
        $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name);
      }

      $scope.internal.loadWorkOrdersStart();
      $scope.workOrderProvider.get().then(
        $scope.internal.loadWorkOrdersSuccess, $scope.internal.loadWorkOrdersFailure
      );
    };

    $scope.selectWorkOrder = function(workOrder) {
      $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: workOrder.id });
    };

    ///////////////////////////////
    // CONTROLLER INITIALIZATION //
    ///////////////////////////////

    $scope.setupFilterView();

  }]);
