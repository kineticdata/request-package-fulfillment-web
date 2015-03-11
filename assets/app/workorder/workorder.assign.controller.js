angular.module('kineticdata.fulfillment.controllers.workorderassign', [
  'ui.router',
  'kineticdata.fulfillment.services.filter',
  'kineticdata.fulfillment.services.workorder',
  'kineticdata.fulfillment.services.assignments'
])
  .controller('WorkOrderAssignController', ['$scope', '$log', '$stateParams', '$state', 'AssignmentsService', 'WorkOrdersService', function($scope, $log, $stateParams, $state, AssignmentsService, WorkOrdersService) {
    $scope.currentWorkOrderId = $stateParams.workOrderId;
    $scope.currentGroup = {};
    $scope.possibleAssignments = {};
    $scope.workOrder = {};
    $scope.modified = false;
    $scope.parents = [];

    $scope.state = {};
    $scope.state.overview = true;
    $scope.state.selecting = false;
    $scope.state.selectGroups = false;
    $scope.state.selectMembers = false;
    $scope.state.loading = true;
    $scope.state.loadingData = false;

    /// Retrieve the work order to get all group information.
    $scope.getGroups = function() {
      $scope.state.loading = true;
      WorkOrdersService.getWorkOrder($scope.currentWorkOrderId)
        .then(function(workOrder) {
          $scope.workOrder = workOrder;

          $scope.currentGroupStructure = $scope.workOrder.groups;
          $scope.modified = false;
          $scope.state.loading = false;
        });
    };

    $scope.buildParentsArray = function(structure) {
      return _.reduce(structure, function(groups, group) {
        groups.push(group.id);
        return groups;
      }, []);
    };

    $scope.doStartGroupAssignment = function(index) {
      // Switch to selection state.
      $scope.state.overview = false;
      $scope.state.selecting = true;
      $scope.state.selectGroups = true;
      $scope.state.selectMembers = false;
      $scope.state.loadingData = true;

      $scope.currentGroupStructure = $scope.workOrder.groups.slice(0, index);
      var parents = $scope.buildParentsArray($scope.currentGroupStructure);
      $scope.provider = AssignmentsService.getAssignmentsByParents(parents);
      $scope.provider.get().then(function(group) {
        $scope.possibleAssignments = group;

        $scope.state.loadingData = false;
      })
    };

    /// Start member selection - given a group retrieve a list of possible members.
    $scope.doStartMemberAssignment = function(group) {
      $scope.state.overview = false;
      $scope.state.selecting = true;
      $scope.state.selectGroups = false;
      $scope.state.selectMembers = true;
      $scope.state.loadingData = true;

      $scope.membersProvider = AssignmentsService.getMembersByGroup(group);
      $scope.membersProvider.get().then(function(members) {
        $scope.possibleAssignments = members;
        $scope.state.loadingData = false;
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
      $scope.state.loadingData = false;
    };

    /// Given an assignment item, assign it to the parents and cascade to next step.
    $scope.assignLevel = function(item) {
      var newGroup = {
        label: $scope.possibleAssignments.label,
        id: item.id,
        name: item.name
      };
      $scope.currentGroupStructure.push(newGroup);

      if(item.childrenCount === "0") {
        // Get members, there are no more children.
        $scope.doStartMemberAssignment(item);
      } else {
        $scope.doStartGroupAssignment($scope.currentGroupStructure.length);
      }

    };

    $scope.assignMember = function(member) {
      var payload = {};
      _.forEach($scope.currentGroupStructure, function(parent) {
        payload[parent.label] = parent.id;
      });
      payload['Member'] = member.loginId;

      $scope.state.loadingData = true;
      WorkOrdersService.postAssignments($scope.workOrder.id, payload).then(
        function(data) {
          // On successful assignment we should go to the details screen.
          $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: $scope.workOrder.id });
        },
        function(data) {
          $scope.state.loadingData = false;
          //TODO:MTR What should I do here? I'm leaving them alone for now.
        }
      )
    };

    // RUNTIME

    $scope.getGroups();

  }]);
