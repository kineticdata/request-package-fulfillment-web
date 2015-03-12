angular.module('kineticdata.fulfillment.controllers.workorderdetail', [
  'kineticdata.fulfillment.services.workorder'
])
  .controller('WorkOrderDetailController', [ '$scope', '$rootScope', '$stateParams', '$log', 'flash', 'WorkOrdersService',
    function($scope, $rootScope, $stateParams, $log, flash, WorkOrdersService) {
      $scope.currentWorkOrderId = $stateParams.workOrderId;
      $scope.workOrder = {};
      $scope.workOrderLogs = {};
      $scope.workOrderNotes = {};
      // Loading trackers.
      $scope.workOrderLoading = false;
      $scope.workOrderNotesLoading = true;
      $scope.workOrderLogsLoading = true;
      $scope.workOrderNotesProvider = WorkOrdersService.getWorkOrderNotes($scope.currentWorkOrderId);
      $scope.workOrderLogsProvider = WorkOrdersService.getWorkOrderLogs($scope.currentWorkOrderId);
      $scope.workOrderWorkURL = '';
      $scope.showAddNote = false;

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
        WorkOrdersService.postNote($scope.currentWorkOrderId, $scope.tmpNote)
          .then($scope.internal.retrieveNotes, $scope.flash.noteAddFailure);

        $scope.showAddNote = false;
        $scope.tmpNote = '';
      };

      /**
       * Cancels the note adding process.
       */
      $scope.cancelNote = function() {
        $scope.tmpNote = '';
        $scope.showAddNote = false;
      };

      ///////////////////////////////////
      // FLASH - Flash error messages. //
      ///////////////////////////////////
      $scope.flash = {};

      /**
       * Shows a flash that adding a note failed.
       */
      $scope.flash.noteAddFailure = function() {
        flash.error = 'Failed to add note!';
      };

      /**
       * Logs that work order retrieval failed and shows a flash.
       */
      $scope.flash.workOrderLoadFailure = function(data) {
        $log.error('Failed to retrieve work order:', data);
        flash.error ='Server Error: Failed to retrieve work order.';
      };

      /**
       * Shows a generic API flash error.
       */
      $scope.flash.genericProviderFailure = function(data) {
        $log.error('Failed to retrieve data from server:', data);
        flash.error = 'Server Error: Failed to retrieve data from server.';
      };

      ////////////////////////////////////////////
      // INTERNAL - Controller-scoped functions //
      ////////////////////////////////////////////
      $scope.internal = {};

      /**
       * Provides a scoped handler for chaining log provider retrievals.
       * @param {function} next A closure function to be chained, can be undefined.
       * @returns {function}
       */
      $scope.internal.logsRtrSuccessFn = function(next) {
        return function() {
          $scope.workOrderLogsLoading = false;
          if(typeof next !== 'undefined') { next(); }
        };
      };

      $scope.internal.notesStartFn = function() {
        $scope.workOrderNotesLoading = true;
      };

      $scope.internal.logsStartFn = function() {
        $scope.workOrderLogsLoading = true;
      }

      /**
       * Provides a scoped handler for chaining notes provider retrievals.
       * @param {function} next A closure function to be chained, can be undefined.
       * @returns {function}
       */
      $scope.internal.notesRtrSuccessFn = function(next) {
        return function(notes) {
          $scope.workOrderNotesLoading = false;
          if(typeof next !== 'undefined') { next(); }
        };
      };

      /**
       * Provides a scoped handler for chaining failed provider retrievals.
       * It displays a flash message and then, if possible, chains to next.
       *
       * @param {function} next A closure function to be chained, can be undefined.
       * @returns {function}
       */
      $scope.internal.providerFailureFn = function(next) {
        return function(data) {
          $scope.flash.genericProviderFailure(data);
          if(typeof next !== 'undefined') { next(); }
        };
      };

      /**
       * Initiates the retrieval of logs. It uses scoped provider functions to
       * continue to chain on to retrieving notes.
       */
      $scope.internal.retrieveLogs = function() {
        $scope.workOrderLogsLoading = true;
        $scope.workOrderLogsProvider.get().then($scope.internal.logsRtrSuccessFn($scope.internal.retrieveNotes), $scope.internal.providerFailureFn($scope.internal.retrieveNotes));
      };

      /**
       * Initiates the retrievel of notes. It uses scoped provider functions to process the responses.
       */
      $scope.internal.retrieveNotes = function() {
        $scope.workOrderNotesLoading = true;
        $scope.workOrderNotesProvider.get().then($scope.internal.notesRtrSuccessFn(), $scope.internal.providerFailureFn());
      };

      /**
       * Takes a work order response, presumably from the providers, and updates internal
       * state. It should then attempt to retrieve logs, kicking off the chain of retrievals
       * necessary to obtain a full work order.
       * @param {WorkOrder} workOrder a work order to obtain the full record for and to use in the current screen.
       */
      $scope.internal.processWorkOrder = function(workOrder) {
        $scope.workOrder = workOrder;
        $scope.workOrderWorkURL = $scope.workOrder.workOrderURL;
        $scope.workOrderLoading = false;
        $scope.internal.retrieveLogs();
      };

      /**
       * Initiates the process of retrieving a work order based on the currentWorkOrderId
       * in the current scope.
       */
      $scope.internal.retrieveWorkOrder = function() {
        if(!WorkOrdersService.canPreloadWorkOrder()) {
          $scope.workOrderLoading = true;
        }

        WorkOrdersService.getWorkOrder($scope.currentWorkOrderId, $scope.currentFilter.name)
          .then($scope.internal.processWorkOrder, $scope.flash.workOrderLoadFailure, function(initial) {
            $scope.workOrder = initial;
            $scope.workOrderWorkURL = $scope.workOrder.workOrderURL;
            $scope.workOrderLoading = false;
          });
      };

      //
      // RUNTIME
      //

      $rootScope.$broadcast('krs-workorder-changed', $scope.currentWorkOrderId);

      // Get the individual work order.
      $scope.internal.retrieveWorkOrder();

    }]);
