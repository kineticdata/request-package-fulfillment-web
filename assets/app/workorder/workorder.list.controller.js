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
    $scope.workOrderProvider = {};
    $scope.filterProvider = FiltersService.getFilters();
    $scope.filtersLoading = true;
    $scope.workOrdersLoading = true;

    //var filters = [];

    $scope.isChildState = function() {
      return $state.includes('workorder.*');
    };

    $scope.setupFilterView = function() {
      //// First we need to get the collection of filters available and decide which one is the current filter.
      $scope.filtersLoading = true;


      $scope.filterProvider.get().then(function(filters) {
        //var filters = $scope.filterProvider.data;
        $scope.filtersLoading = false;

        if(typeof $stateParams.id === 'undefined') {
          $scope.currentFilter = filters.getDefault();
        } else if($stateParams.id === 'default') {
          $scope.currentFilter = filters.getDefault();
        } else {
          $scope.currentFilter = filters.getFilter($stateParams.id);
        }

        $rootScope.$broadcast('krs-filter-changed', $scope.currentFilter.name);
        $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name);
        $scope.loadWorkOrders();

        // WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name, $scope.workOrders).then(
        //   function() {
        //     // Successfully loaded work orders.
        //     $scope.workOrdersLoading = false;
        //     //if($scope.filtersLoading === true) $scope.filtersLoading = false;
        //   },
        //   function() {
        //     // Handle failures to load work orders.
        //   }
        // );


        // $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name);
        // $scope.workOrderProvider.get().then(function() {
        //   $log.debug("wortk rder:", $scope.workOrderProvider.data);
        //   $scope.workOrders = $scope.workOrderProvider.data;
        //   $scope.filtersLoading = false;
        // });
      });
    };

    $scope.loadWorkOrdersSuccess = function(workOrders) {
      $scope.workOrdersLoading = false;
      $scope.workOrders = workOrders;
    };

    $scope.loadWorkOrdersFailure = function() {
      // Handle failed loading.
    };

    $scope.loadWorkOrdersStart = function() {
      $scope.workOrdersLoading = true;
    };

    $scope.loadWorkOrders = function() {
      $scope.loadWorkOrdersStart();
      $scope.workOrderProvider.get().then(
        $scope.loadWorkOrdersSuccess, $scope.loadWorkOrdersFailure
      );
    };

    $scope.selectWorkOrder = function(workOrder) {
      $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: workOrder.id });
    };

    ///////////////////////////////
    // CONTROLLER INITIALIZATION //
    ///////////////////////////////

    $scope.setupFilterView();
    // var autoRefresh = $interval(function() {
    //   $scope.loadWorkOrders();
    //     $log.info('{PRP} Auto-refreshing.');
    // }, 10000);

  }]);
