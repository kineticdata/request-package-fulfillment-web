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
      $scope.currentGroupStructure = $scope.workOrder.groups;
      $scope.modified = false;

      var parents = $scope.buildParentsArray($scope.currentGroupStructure);
      parents.pop();

      AssignmentsService.getAssignmentsByParents(parents).then(
        function(group) {
          var lastGroup = $scope.currentGroupStructure[$scope.currentGroupStructure.length-1];
          var groupDesc = _.find(group.items, function(item) {
            return item.id === lastGroup.id;
          });

          lastGroup.childrenCount = groupDesc.childrenCount;
          AssignmentsService.getAssignmentsByParents($scope.buildParentsArray($scope.currentGroupStructure)).then(
            function(nextGroup) {
              lastGroup.nextLabel = nextGroup.label;
              $scope.state.loading = false;
              $scope.state.loadingData = false;
            },
            function() {
              toastr.error('There wsa a problem retrieving groups!');
            });

        }, function() {
          toastr.error('There was a problem retrieving groups!');
        });
    };

    $scope.showChildSelect = function() {
      return $scope.currentGroupStructure[$scope.currentGroupStructure.length-1].childrenCount > 0;
    };

    $scope.getChildLabel = function() {
      return $scope.currentGroupStructure[$scope.currentGroupStructure.length-1].nextLabel;
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

      $scope.currentGroupStructure = $scope.currentGroupStructure.slice(0, index);
      var parents = $scope.buildParentsArray($scope.currentGroupStructure);
      AssignmentsService.getAssignmentsByParents(parents).then(
        function(group) {
          $scope.possibleAssignments = group;
          $scope.state.loadingData = false;
        },
        function() {
          toastr.error('There was a problem loading groups.');
        });
    };

    /// Start member selection - given a group retrieve a list of possible members.
    $scope.doStartMemberAssignment = function(group) {
      $scope.state.overview = false;
      $scope.state.selecting = true;
      $scope.state.selectGroups = false;
      $scope.state.selectMembers = true;
      $scope.state.loadingData = true;

      AssignmentsService.getMembersByGroup(group).then(
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
      $scope.state.loadingData = false;

      $scope.getGroups();
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
        function() {
          // On successful assignment we should go to the details screen.
          $rootScope.$broadcast('krs-workorder-modified', $scope.workOrder.id);
          $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: $scope.workOrder.id });
        },
        function() {
          $scope.state.loadingData = false;
          toastr.error('Failed to save work order assignments!');
        }
      )
    };

    $scope.savePartial = function() {
      var payload = {};

      _.forEach($scope.currentGroupStructure, function(parent) {
        payload[parent.label] = parent.id;
      });

      $scope.state.loadingData = true;
      WorkOrdersService.postAssignments($scope.workOrder.id, payload).then(
        function() {
          // On successful assignment we should go to the details screen.
          $rootScope.$broadcast('krs-workorder-modified', $scope.workOrder.id);
          $state.go('workorders.detail', { id: $scope.currentFilter.name, workOrderId: $scope.workOrder.id });
        },
        function() {
          $scope.state.loadingData = false;
          toastr.error('Failed to save work order assignments!');
        }
      )
    };

    // RUNTIME

    $scope.getGroups();

  }]);
