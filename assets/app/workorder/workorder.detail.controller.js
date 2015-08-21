angular.module('kineticdata.fulfillment.controllers.workorderdetail', [
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderDetailController', [ '$scope', '$rootScope', '$log', '$state', '$timeout', '$stateParams', 'WorkOrdersService', 'workOrderId', 'workOrder', 'workOrderNotes', 'workOrderLogs',
    function($scope, $rootScope, $log, $state, $timeout, $stateParams, WorkOrdersService, workOrderId, workOrder, workOrderNotes, workOrderLogs) {
      $scope.currentWorkOrderId = workOrderId;
      $scope.currentFilter = '';
      $scope.workOrder = workOrder;
      $scope.workOrderLogs = workOrderLogs;
      $scope.workOrderNotes = workOrderNotes;
      // Loading trackers.
      $scope.workOrderLogsApi = WorkOrdersService.Logs(workOrderId);
      $scope.workOrderNotesApi = WorkOrdersService.Notes(workOrderId);
      $scope.showAddNote = false;
      $scope.tmpNote = {};
      $scope.notesPage = parseInt($stateParams.np) || 0;
      $scope.logsPage = parseInt($stateParams.lp) || 0;
      $scope.activeTab = $stateParams.tab;

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
        WorkOrdersService.postNote($scope.currentWorkOrderId, $scope.tmpNote).then(
          function() {
            var lastPage = $scope.workOrderNotes.meta.limit===0 ? 0 : Math.ceil(($scope.workOrderNotes.meta.count / $scope.workOrderNotes.meta.limit));
            $state.go('.', {np: lastPage}, {reload:true});
          }, function() {
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

      $scope.workitLabel = function() {
        return ($scope.isMine() ? 'Work It' : 'Grab It');
      };

      $scope.isMine = function() {
        return ($scope.workOrder.assignee && BUNDLE.config.user === $scope.workOrder.assignee.loginId)
      };

      $scope.doWorkIt = function() {
        // If it is mine just change to the work it tab.
        if($scope.isMine()) {
          //$rootScope.$broadcast('krs-workit');
          $scope.activeTab = 'work';
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

      $scope.doNoteNext = function() {
        var offset = ($scope.notesPage) * 5;
        if(offset<$scope.workOrderNotes.meta.count) {
          $scope.notesPage++;
          $state.go('.', {np: $scope.notesPage, tab: 'notes'});
        }
      };

      $scope.doNotePrev = function() {
        // Calculate the previous page, make sure it
        var page = $scope.notesPage - 1;
        if(page>0) {
          $state.go('.', {np: page, tab: 'notes'});
        }
      };

      $scope.doNotePage = function(page) {
        $state.go('.', {np: page, tab: 'notes'});
      };

      $scope.doLogNext = function() {
        var offset = ($scope.logsPage) * 5;
        if(offset<$scope.workOrderNotes.meta.count) {
          $scope.logsPage++;
          $state.go('.', {lp: $scope.logsPage, tab: 'logs'});
        }
      };

      $scope.doLogPrev = function() {
        // Calculate the previous page, make sure it
        var page = $scope.logsPage - 1;
        if(page>0) {
          $state.go('.', {lp: page, tab: 'logs'});
        }
      };

      $scope.doLogPage = function(page) {
        $state.go('.', {lp: page, tab: 'logs'});
      };


      //
      // RUNTIME
      //

      $rootScope.$broadcast('krs-workorder-changed', $scope.currentWorkOrderId);
    }]);
