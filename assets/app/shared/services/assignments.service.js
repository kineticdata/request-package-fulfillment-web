angular.module('kineticdata.fulfillment.services.assignments', [])
  .service('AssignmentsService', [ '$q', '$log', 'ModelFactory', 'ConfigService', '$http', function($q, $log, ModelFactory, ConfigService, $http) {

    var membersUrl = ConfigService.getBaseUrl() + '/assignment/members';
    var groupsUrl = ConfigService.getBaseUrl() + '/assignment/groups';

    var buildParentParams = function(parents) {
      var parentParams = '';
      _.forEach(parents, function(parent) {
        parentParams += '&parent[]='+parent;
      });

      return parentParams;
    };

    var getAssignmentsByParents = function(parents) {
      var deferred = $q.defer();
      var parentParams = buildParentParams(parents);
      var factory = ModelFactory.get('Group');

      $http.get(groupsUrl + parentParams).then(
        function(data) {
          var newData = new factory.factoryObject(data.data);
          deferred.resolve(newData)
        }, function() {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    var getMembersByGroup = function(group) {
      var deferred = $q.defer();
      var factory = ModelFactory.get('Member');

      $http.get(membersUrl + '&group=' + group.id).then(
        function(data) {
          var newData = new factory.factoryObject(data.data);
          deferred.resolve(newData);
        },
        function(data) {
          deferred.reject(data);
        }
      );

      return deferred.promise;
    };

    return {
      getAssignmentsByParents: getAssignmentsByParents,
      getMembersByGroup: getMembersByGroup
    };
  }]);
