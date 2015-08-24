angular.module('kineticdata.fulfillment.controllers.workorderlist', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderListController', ['$scope', '$rootScope', '$state', '$stateParams', '$log', '$interval', '$cacheFactory', 'FiltersService', 'WorkOrdersService', 'filters', 'workOrders', 'currentFilter', 'filterState', function($scope, $rootScope, $state, $stateParams, $log, $interval, $cacheFactory, FiltersService, WorkOrdersService, filters, workOrders, currentFilter, filterState) {
    'use strict';

    // Prepare scope varaibles.
    $scope.currentFilter = currentFilter;
    $scope.workOrders = workOrders;

    /// This will hold scope methods meant primarily for internal controller use.
    $scope.internal = {};
    $scope.internal.workOrderLoadFailures = 0;
    $scope.api = WorkOrdersService.WorkOrders(true);

    // Hidden by default.
    $scope.listHiddenOnXS = true;

    $scope.shouldHideList = function() {
      return $scope.listHiddenOnXS && $scope.isChildState();
    };

    $scope.showList = function() {
      $scope.listHiddenOnXS = false;
    };

    $scope.hideList = function() {
      $scope.listHiddenOnXS = true;
    };

    $scope.sort = {};
    $scope.sort.by = $stateParams.fsb;
    $scope.sort.dir = ($stateParams.fsd==='ASC');

    $scope.fb = filterState;


    $scope.page = parseInt($stateParams.fp) || 0;

    $scope.sortOptions = [
      { name: 'ID', field: 'id' },
      { name: 'Work Order Name', field: 'workOrder' },
      { name: 'Requested For', field: 'requestedFor.name' },
      { name: 'Status', field: 'status' },
      { name: 'Priority', field: 'priority' },
      { name: 'Due Date', field: 'due' },
      { name: 'Assigned To', field: 'assignedName' }
    ];

    $scope.changeSortOrder = function(direction) {
      $state.go('.', {fsd: (direction ? 'ASC' : 'DESC')});
    };

    $scope.changeSortItem = function(sortBy) {
      $state.go('.', {fsb: sortBy});
    };

    /**
     * Determines if the current state is a child of this controller's typical state.
     * @returns {boolean} true if the state is a child state of 'workorder'
     */
    $scope.isChildState = function() {
      var currentState = $state.current.name;
      return currentState.match(/workorders\./) !== null;
    };

    /**
     * Changes UI state to the selected work order object's detail view.
     */
    $scope.selectWorkOrder = function(workOrder) {
      if($scope.isActiveWorkOrder(workOrder)) {
        $scope.listHiddenOnXS = true;
      }


      if(angular.isDefined($scope.currentFilter.terms)) {
        $state.go('workorders.detail', { id: 'search', terms: $scope.currentFilter.terms, workOrderId: workOrder.id, tab: 'summary' });
      } else {
        $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: workOrder.id, tab: 'summary' });
      }
    };

    $scope.isFiltering = function() {
      return !_.isEmpty($scope.fb.id) || !_.isEmpty($scope.fb.status) || !_.isEmpty($scope.fb.workOrderName);
    };

    $scope.resetFilters = function() {
      $scope.fb.id = '';
      $scope.fb.status = '';
      $scope.fb.workOrderName = '';
      $scope.updateFilters();
    };

    $scope.updateFilters = function() {
      $state.go('.', {
        fbId: $scope.fb.id,
        fbStatus: $scope.fb.status,
        fbWOName: $scope.fb.workOrderName
      });
    };

    $scope.doNext = function() {
      var offset = ($scope.page) * 5;
      if(offset<$scope.workOrders.meta.count) {
        $scope.page++;
        $state.go('.', {fp: $scope.page});
      }
    };

    $scope.doPrev = function() {
      // Calculate the previous page, make sure it
      var page = $scope.page - 1;
      if(page>0) {
        $state.go('.', {fp: page});
      }
    };

    $scope.doPage = function(page) {
      $state.go('.', {fp: page});
    };

    $scope.reload = function() {
      $state.go('.', {}, { reload: true });
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
  }]);
