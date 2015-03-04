angular.module('kineticdata.fulfillment.controllers.workorderassign', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderAssignController', ['$scope', '$stateParams', 'WorkOrdersService', function($scope, $stateParams, WorkOrdersService) {
    $scope.currentWorkOrderId = $stateParams.workOrderId;
    $scope.workOrder = {};

    WorkOrdersService.getWorkOrder($scope.currentWorkOrderId)
      .then(function(workOrder) {
        $scope.workOrder = workOrder;
      });
  }]);
