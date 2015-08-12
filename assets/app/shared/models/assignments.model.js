angular.module('kineticdata.fulfillment.models.assignments', [
  'kineticdata.fulfillment.services.modelfactory'
])
.run(['$log', 'ModelFactory', function($log, ModelFactory) {
    var Group = function(group) {
      var self = this;
      self.items = group;
    };

    var Member = function(member) {
      var self = this;
      _.assign(self, member);
    };

    ModelFactory.register('Member', {
      restName: '',
      factoryObject: Member
    });

    ModelFactory.register('Group', {
      restName: '',
      factoryObject: Group
    });
  }]);
