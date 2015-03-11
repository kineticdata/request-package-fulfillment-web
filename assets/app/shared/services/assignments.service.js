angular.module('kineticdata.fulfillment.services.assignments', [
  'kineticdata.fulfillment.services.dataproviderfactory'
])
  .service('AssignmentsService', [ '$log', 'DataProviderFactory', function($log, DataProviderFactory) {

    var buildParentParams = function(parents) {
      var parentParams = "";
      _.forEach(parents, function(parent) {
        parentParams += '&parent[]='+parent;
      });

      return parentParams;
    };

    var getAssignmentsByParents = function(parents) {
      var parentParams = buildParentParams(parents);

      return new DataProviderFactory.get('PaginatedRestfulDataResource', {
        url: '/assignment/groups' + parentParams,
        model: 'Group'
      });
    };

    var getMembersByGroup = function(group) {
      return new DataProviderFactory.get('PaginatedRestfulDataResource', {
        url: '/assignment/members&group=' + group.id,
        model: 'Member'
      });
    };



    return {
      getAssignmentsByParents: getAssignmentsByParents,
      getMembersByGroup: getMembersByGroup
    };
  }]);
