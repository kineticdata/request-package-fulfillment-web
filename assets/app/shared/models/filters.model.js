angular.module('kineticdata.fulfillment.models.filter', [
  'kineticdata.fulfillment.services.modelfactory'
])
  .run(['$log', 'ModelFactory', function($log, ModelFactory) {
    var Filter = function(filter) {
      var self = this;
      _.assign(self, filter);
    };

    var FilterCollection = function(filters) {
      var self = this;
      self.all = [];

      _.forEach(filters, function(filter) {
        self.all.push(new Filter(filter));
      });

      self.getFilter = function(name) {
        return _.find(self.all, function(filter) {
          return filter.name == name;
        });
      };

      self.getDefault = function() {
        return _.find(self.all, function(filter) {
          return filter.default == true;
        });
      };
    };

    ModelFactory.register('FilterCollection', {
      restName: 'filters',
      factoryObject: FilterCollection
    });

    ModelFactory.register('Filter', {
      restName: '',
      factoryObject: Filter
    })
  }]);
