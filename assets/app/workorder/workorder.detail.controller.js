angular.module('kineticdata.fulfillment.controllers.workorderdetail', [
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderDetailController', [ '$scope', '$rootScope', '$log', '$state', '$timeout', 'WorkOrdersService', 'workOrderId', 'workOrder',
    function($scope, $rootScope, $log, $state, $timeout, WorkOrdersService, workOrderId, workOrder) {
      $scope.currentWorkOrderId = workOrderId;
      $scope.currentFilter = '';
      $scope.workOrder = workOrder;
      $scope.workOrderLogs = [];
      $scope.workOrderNotes = {};
      // Loading trackers.
      $scope.workOrderNotesLoading = true;
      $scope.workOrderLogsLoading = true;
      $scope.workOrderLogsApi = WorkOrdersService.Logs(workOrderId);
      $scope.workOrderNotesApi = WorkOrdersService.Notes(workOrderId);
      $scope.showAddNote = false;
      $scope.tmpNote = {};

      /**
       * Starts the note adding process.
       */
      $scope.startAddNote = function() {
        $scope.showAddNote = true;
      };

      /**
       * Adds a note to the current work order.
       */
      $scope.addNote = function() {
        if(_.isEmpty($scope.tmpNote.entry)) {
          return;
        }
        WorkOrdersService.postNote($scope.currentWorkOrderId, $scope.tmpNote)
          .then($scope.retrieveNotes, function() {
            toastr.warning('There was a problem posting a new note!');
          });

        $scope.showAddNote = false;
        $scope.tmpNote = {};
      };

      /**
       * Cancels the note adding process.
       */
      $scope.cancelNote = function() {
        $scope.tmpNote = {};
        $scope.showAddNote = false;
      };

      $scope.setNoteAttachment = function(file) {
        $scope.tmpNote.attachment = file;
      };

      /**
       * Initiates the retrievel of notes. It uses scoped provider functions to process the responses.
       */
      $scope.retrieveNotes = function() {
        $scope.workOrderNotesLoading = true;
        $scope.workOrderNotesApi.getList().then(
          function(data) {
            $scope.workOrderNotesLoading = false;
            $scope.workOrderNotes = data;
          },
          function() {
            toastr.warning('There was a problem loading work order notes.');
          });
      };

      $scope.workitLabel = function() {
        return ($scope.isMine() ? 'Work It' : 'Grab It');
      };

      $scope.isMine = function() {
        return (BUNDLE.config.user === $scope.workOrder.assignedId)
      };

      $scope.doWorkIt = function() {
        // If it is mine just change to the work it tab.
        if($scope.isMine()) {
          $rootScope.$broadcast('krs-workit');
          return;
        }

        // Grab it first.
        WorkOrdersService.postAssignMe($scope.currentWorkOrderId).then(
          function() {
            WorkOrdersService.WorkOrder(workOrderId).get().then(function(data) {
              $scope.workOrder = data;
              $rootScope.$broadcast('krs-workorder-modified');
              $rootScope.$broadcast('krs-workit');
            });
          },
          function(data) {
            if(data.status === 400) {
              $state.go('workorders.assign', { workOrderId: $scope.currentWorkOrderId });
            }
          }
        );
      };

      //
      // RUNTIME
      //

      $rootScope.$on('krs-filter-changed', function(event, filter) {
        activeFilter = filter;
      });

      $rootScope.$broadcast('krs-workorder-changed', $scope.currentWorkOrderId);

      $scope.workOrderLogsApi.getList().then(
        function(data) {
          $scope.workOrderLogsLoading = false;
          $scope.workOrderLogs = data;
        },
        function() {
          toastr.warning('There was a problem loading work order logs.');
        });

      $scope.retrieveNotes();

    }]);
