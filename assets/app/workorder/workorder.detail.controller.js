angular.module('kineticdata.fulfillment.controllers.workorderdetail', [
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderDetailController', [ '$scope', '$rootScope', '$log', '$state', '$timeout', '$stateParams', 'WorkOrdersService', 'workOrderId', 'workOrder', 'workOrderNotes', 'workOrderLogs', 'latestNote', 'relatedWorkOrders',
    function($scope, $rootScope, $log, $state, $timeout, $stateParams, WorkOrdersService, workOrderId, workOrder, workOrderNotes, workOrderLogs, latestNote, relatedWorkOrders) {
      $scope.currentWorkOrderId = workOrderId;
      $scope.workOrder = workOrder;
      $scope.workOrderLogs = workOrderLogs;
      $scope.workOrderNotes = workOrderNotes;
      $scope.latestNote = latestNote;
      $scope.relatedWorkOrders = relatedWorkOrders;

      // Loading trackers.
      $scope.showAddNote = false;
      $scope.tmpNote = {};


      $scope.notesPage = parseInt($stateParams.np) || 0;
      $scope.logsPage = parseInt($stateParams.lp) || 0;
      $scope.activeTab = $stateParams.tab;


      $scope.hideList();

      $scope.workOrderURL = workOrder.workOrderURL;
      console.log("1 workOrder.workOrderURL ",workOrder.workOrderURL);

      if ($scope.workOrder.status == "Completed"){
        console.log("2 workOrder.workOrderURL",workOrder.workOrderURL);
        (workOrder.workOrderURL = workOrder.workOrderURL.replace("DisplayPage","ReviewRequest"));
        console.log("3 workOrder.workOrderURL",workOrder.workOrderURL);
      };
      console.log("4 final ",workOrder.workOrderURL);


      $scope.nextWorkOrder = function() {
        var index = $scope.activeWorkOrderIndex();

        if(!$scope.hasNextWorkOrder()) {
          return;
        }

        $scope.selectWorkOrder($scope.workOrders[index+1]);
      };



      $scope.previousWorkOrder = function() {
        var index = $scope.activeWorkOrderIndex();
        if(!$scope.hasPreviousWorkOrder()) {
          return;
        }

        $scope.selectWorkOrder($scope.workOrders[index-1]);
      };

      $scope.hasNextWorkOrder = function() {
        var index = $scope.activeWorkOrderIndex() + 1;
        return index < $scope.workOrders.length;
      };

      $scope.hasPreviousWorkOrder = function() {
        var index = $scope.activeWorkOrderIndex() - 1;
        return index >= 0;
      };

      /**
       * Determines if details is empty.
       */
       $scope.isDetailsEmpty = function () {
         return _.isEmpty($scope.workOrder.details)
       };

      $scope.isOriginatorEmpty = function() {
        return _.isEmpty($scope.workOrder.originator) || _.isEmpty($scope.workOrder.originator.url);
      };

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
            $state.go('.', {np: lastPage, tab: 'notes'}, {reload:true});
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

      // button functionality based on condtion of work order status //
      $scope.workViewConditional = function() {
        if ($scope.workOrder.status == "Completed"){
          $scope.doViewIt();
        }
        else if ($scope.isMine()) {
          $scope.doWorkIt();
        }
      };
      $scope.doWorkIt = function(){
        $scope.activeTab = 'work';
      };
      $scope.doViewIt = function(){
        window.open(workOrder.workOrderURL);
      };

      $scope.workitLabel = function() {
        // console.log($scope.workOrder.status);
        if($scope.workOrder.status == "Completed"){
          return ($scope.isMine = 'View It');
        } else {
        return ($scope.isMine() ? 'Work It' : 'Grab It');
        }
      };

      $scope.isMine = function() {
        return ($scope.workOrder.assignee && BUNDLE.config.user === $scope.workOrder.assignee.loginId)
      };
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
