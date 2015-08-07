angular.module('kineticdata.fulfillment.services.assignments', [])
  .service('AssignmentsService', [ '$q', '$log', 'ModelFactory', 'ConfigService', '$http', function($q, $log, ModelFactory, ConfigService, $http) {

    var membersUrl = ConfigService.getBaseUrl() + '/assignment/members';
    var groupsUrl = ConfigService.getBaseUrl() + '/assignment/groups';

    var buildParentParams = function(parents) {
      var parentParam = '&parent=' +parents.join('::');
      return (parents.length > 0 ? parentParam : '');
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

    var getMembersByGroup = function(groups) {
      var deferred = $q.defer();
      var factory = ModelFactory.get('Member');
      var group = groups.join('::');


      $http.get(membersUrl + '&group=' + group).then(
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
