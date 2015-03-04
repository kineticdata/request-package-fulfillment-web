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

    /**
     * Determines if the current state is a child of this controller's typical state.
     * @returns {boolean} true if the state is a child state of 'workorder'
     */
    $scope.isChildState = function() {
      var currentState = $state.$current.name;
      return currentState.match(/workorder\./) !== null;
    };

    ////////////////////
    // FILTER LOADING //
    ////////////////////

    /**
     * Called whenever the filter and work order data needs to be refreshed and chained.
     */
    $scope.setupFilterView = function() {
      //// First we need to get the collection of filters available and decide which one is the current filter.
      $scope.internal.loadFiltersStart();


      $scope.filterProvider.get().then($scope.internal.loadFiltersSuccess, $scope.internal.loadFiltersFailure);
    };

    /**
     * Called at the start of filter refresh, used to set UI changes.
     */
    $scope.internal.loadFiltersStart = function() {
      $scope.filtersLoading = true;
    };

    /**
     * Handles successful filter data loading.
     *
     * This method is called as the success function for filter loading. It will
     * make a decision as to which filter should be the current (in view) filter
     * based on the state parameters, or it will use the default filter. It will
     * broadcast 'krs-filter-changed' with the current filter name and begin
     * loading work orders.
     *
     * @param {FilterCollection} filters a generated filter collection from rest data.
     */
    $scope.internal.loadFiltersSuccess = function(filters) {
      $scope.filtersLoading = false;

      if(typeof $stateParams.id === 'undefined') {
        $scope.currentFilter = filters.getDefault();
      } else if($stateParams.id === 'default') {
        $scope.currentFilter = filters.getDefault();
      } else if($stateParams.id === 'search') {
        $scope.currentFilter = { name: 'Search Results', terms: ($stateParams.terms===undefined ? ' ' : $stateParams.terms) };
        $rootScope.$broadcast('krs-filter-changed', $scope.currentFilter.name);
      } else {
        $scope.currentFilter = filters.getFilter($stateParams.id);
        $rootScope.$broadcast('krs-filter-changed', $scope.currentFilter.name);
      }

      $scope.loadWorkOrders();
    };

    /**
     * Handles UI changes when filter loading fails for some reason.
     */
    $scope.internal.loadFiltersFailure = function() {
      // Handle failures on loading filters.
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
    $scope.loadWorkOrders = function() {
      if($scope.workOrderProvider === undefined) {
        if(angular.isDefined($scope.currentFilter.terms)) {
          $log.debug('searching')
          $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithSearch($scope.currentFilter.terms);
        } else {
          $log.debug('not searching')
          $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name);
        }

      }

      $scope.internal.loadWorkOrdersStart();
      $scope.workOrderProvider.get().then(
        $scope.internal.loadWorkOrdersSuccess, $scope.internal.loadWorkOrdersFailure
      );
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

    ///////////////////////////////
    // CONTROLLER INITIALIZATION //
    ///////////////////////////////

    $scope.setupFilterView();

  }]);
