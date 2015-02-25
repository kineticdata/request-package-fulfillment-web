angular.module('kineticdata.fulfillment.controllers.workorderlist', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderListController', ['$scope', '$state', '$stateParams', '$log', 'FiltersService', 'WorkOrdersService',
      function($scope, $state, $stateParams, $log, FiltersService, WorkOrdersService) {
    // Prepare scope varaibles.
    $scope.currentFilter = {};
    $scope.workOrders = [];
    $scope.workOrderProvider = {};
    $scope.filterProvider = FiltersService.getFilters();
    $scope.filtersLoading = true;

    //var filters = [];

    $scope.setupFilterView = function() {
      //// First we need to get the collection of filters available and decide which one is the current filter.
      $scope.filtersLoading = true;


      FiltersService.getFilters().then(function(filters) {
        //var filters = $scope.filterProvider.data;
        $scope.filtersLoading = false;
        $log.debug(filters);
        if(typeof $stateParams.id === 'undefined') {
          $scope.currentFilter = filters.getDefault();
        } else {
          $scope.currentFilter = filters.getFilter($stateParams.id);
        }

        WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name, $scope.workOrders).then(
          function() {
            //if($scope.filtersLoading === true) $scope.filtersLoading = false;
          }
        );
        // $scope.workOrderProvider = WorkOrdersService.getWorkOrdersWithFilter($scope.currentFilter.name);
        // $scope.workOrderProvider.get().then(function() {
        //   $log.debug("wortk rder:", $scope.workOrderProvider.data);
        //   $scope.workOrders = $scope.workOrderProvider.data;
        //   $scope.filtersLoading = false;
        // });
      })
    };

    $scope.selectWorkOrder = function(workOrder) {
      $state.go('workOrder', { id: workOrder.id })
    };

    ///////////////////////////////
    // CONTROLLER INITIALIZATION //
    ///////////////////////////////

    $scope.setupFilterView();

  }]);
