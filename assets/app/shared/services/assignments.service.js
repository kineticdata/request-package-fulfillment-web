angular.module('kineticdata.fulfillment.services.assignments', [
  'kineticdata.fulfillment.services.dataproviderfactory'
])
  .service('AssignmentsService', [ '$q', '$log', 'DataProviderFactory', 'ModelFactory', 'Restangular', 'ConfigService', '$http', function($q,wd$log, DataProviderFactory, ModelFactory, Restangular, ConfigService, $http) {

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
      //return new DataProviderFactory.get('PaginatedRestfulDataResource', {
      //  url: '/assignment/members&group=' + group.id,
      //  model: 'Member'
      //});
    };

    var api = function(modelFactory) {
      var factory = ModelFactory.get(modelFactory);

      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setRestangularFields({
          id: 'id'
        });
        RestangularConfigurer.addResponseInterceptor(function(data, operation) {
          var newData = new factory.factoryObject(data);
          if (operation === 'getList') {
            return newData.all;
          } else if(operation === 'get') {
            return newData;
          }
          return data;
        });
      });
    };



    return {
      getAssignmentsByParents: getAssignmentsByParents,
      getMembersByGroup: getMembersByGroup
    };
  }]);
