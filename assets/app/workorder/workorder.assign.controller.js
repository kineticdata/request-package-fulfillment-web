angular.module('kineticdata.fulfillment.controllers.workorderassign', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder',
  'kineticdata.fulfillment.services.assignments'
])
  .controller('WorkOrderAssignController', ['$scope', '$rootScope', '$log', '$stateParams', '$state', 'AssignmentsService', 'WorkOrdersService', 'workOrderId', 'workOrder', '$http', function($scope, $rootScope, $log, $stateParams, $state, AssignmentsService, WorkOrdersService, workOrderId, workOrder, $http) {
    $scope.currentWorkOrderId = workOrderId;
    $scope.currentGroup = {};
    $scope.possibleAssignments = {};
    $scope.workOrder = workOrder;
    $scope.currentGroupStructure = $scope.workOrder.groups;



    $scope.state = {};
    $scope.state.overview = true;
    $scope.state.selecting = false;
    $scope.state.selectGroups = false;
    $scope.state.selectMembers = false;
    $scope.state.loading = false;
    $scope.state.loadingData = false;

    $scope.showGroupSelect = function() {
      return workOrder.isUnassigned();
    };

    $scope.getChildLabel = function() {
      var hasMoreGroups = false;
      if(typeof $scope.possibleAssignments.items !== 'undefined' && $scope.possibleAssignments.items.length > 0) {
        hasMoreGroups = true;
      }
      return 'Assign ' + (hasMoreGroups===false ? 'Member' : 'Group');
    };

    $scope.doStartGroupAssignment = function(index) {
      // Switch to selection state.
      $scope.state.overview = false;
      $scope.state.selecting = true;
      $scope.state.selectGroups = true;
      $scope.state.selectMembers = false;
      $scope.state.loadingData = true;

      $scope.currentGroupStructure = $scope.currentGroupStructure.slice(0, index);
      $scope.fetchPossibleAssignments($scope.currentGroupStructure);
    };

    $scope.fetchPossibleAssignments = function(groups) {
      AssignmentsService.getAssignmentsByParents(groups).then(
        function(group) {
          $scope.possibleAssignments = group;
          $scope.state.loadingData = false;
        },
        function() {
          toastr.error('There was a problem loading groups.');
        });
    }

    /// Start member selection - given a group retrieve a list of possible members.
    $scope.doStartMemberAssignment = function() {
      $scope.state.overview = false;
      $scope.state.selecting = true;
      $scope.state.selectGroups = false;
      $scope.state.selectMembers = true;
      $scope.state.loadingData = true;

      AssignmentsService.getMembersByGroup($scope.currentGroupStructure).then(
        function(members) {
          $scope.possibleAssignments = members;
          $scope.state.loadingData = false;
        },
        function() {
          toastr.error('Unable to load members for the group structure.');
        });
    };

    $scope.clickOverviewMemberAssignment = function() {
      $scope.currentGroupStructure = angular.copy($scope.workOrder.groups);
      $scope.doStartMemberAssignment($scope.currentGroupStructure[$scope.currentGroupStructure.length-1]);
    };

    $scope.goToOverview = function() {
      $scope.state.overview = true;
      $scope.state.selecting = false;
      $scope.state.selectGroups = false;
      $scope.state.selectMembers = false;
      $scope.state.loadingData = true;

      $scope.fetchPossibleAssignments($scope.currentGroupStructure);
    };

    /// Given an assignment item, assign it to the parents and cascade to next step.
    $scope.assignLevel = function(item) {
      $scope.currentGroupStructure.push(item.name);

      if(item.childrenCount === 0) {
        // Get members, there are no more children.
        $scope.doStartMemberAssignment();
      } else {
        $scope.doStartGroupAssignment($scope.currentGroupStructure.length);
      }

    };

    $scope.assignMember = function(member) {
      var payload = {};

      payload['group'] = $scope.currentGroupStructure.join('::');
      payload['member'] = member.id;

      $scope.state.loadingData = true;
      WorkOrdersService.postAssignments($scope.workOrder.id, payload).then(
        function() {
          // On successful assignment we should go to the details screen.
          $rootScope.$broadcast('krs-workorder-modified', $scope.workOrder.id);
          $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: $scope.workOrder.id }, { reload: true });
        },
        function() {
          $scope.state.loadingData = false;
          toastr.error('Failed to save work order assignments!');
        }
      )
    };

    $scope.savePartial = function() {
      var payload = {};

      payload['group'] = $scope.currentGroupStructure.join('::');

      $scope.state.loadingData = true;
      WorkOrdersService.postAssignments($scope.workOrder.id, payload).then(
        function() {
          // On successful assignment we should go to the details screen.
          $rootScope.$broadcast('krs-workorder-modified', $scope.workOrder.id);
          $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: $scope.workOrder.id }, { reload: true });
        },
        function() {
          $scope.state.loadingData = false;
          toastr.error('Failed to save work order assignments!');
        }
      )
    };


    $scope.fetchPossibleAssignments($scope.currentGroupStructure);

  }]);
