angular.module('kineticdata.fulfillment.models.workorder', [
  'kineticdata.fulfillment.services.modelfactory'
])
  .run(['$log', 'ModelFactory', function($log, ModelFactory) {
    var WorkOrder = function(workOrder) {
      var self = this;

      _.assign(self, workOrder);

      self.getGroup = function(label) {
        label = typeof label !== 'undefined' ? label : 'Group';
        var group = _.find(self.groups, function(wog) {
          return wog.label == label;
        });

        return group;
      };

      self.getGroupName = function(label) {
        var group = self.getGroup(label);
        if(group === undefined || group.name === undefined) {
          return 'None';
        }
        return group.name;
      };

      self.getAssignedName = function() {
        if(self.assignedName === undefined || self.assignedName === null) {
          return 'Unassigned';
        }
        return self.assignedName;
      };

    };

    var WorkOrderCollection = function(data) {
      var self = this;

      self.all = [];

      _.forEach(data, function(workOrder) {
        self.all.push(new WorkOrder(workOrder));
      });
    };

    var WorkOrderNote = function(note) {
      var self = this;
      _.assign(self, note);
    };

    var WorkOrderNoteCollection = function(notes) {
      var self = this;
      self.all = [];
      _.forEach(notes, function(note) {
        self.all.push(new WorkOrderNote(note));
      });
    };

    var WorkOrderLog = function(log) {
      var self = this;
      _.assign(self, log);
    };

    var WorkOrderLogCollection = function(logs) {
      var self = this;
      self.all = [];
      _.forEach(logs, function(log) {
        self.all.push(new WorkOrderLog(log));
      });
    };

    ModelFactory.register('WorkOrderCollection', {
      restName: 'workOrders',
      factoryObject: WorkOrderCollection
    });

    ModelFactory.register('WorkOrder', {
      restName: '',
      factoryObject: WorkOrder
    });

    ModelFactory.register('WorkOrderNoteCollection', {
      restName: 'notes',
      factoryObject: WorkOrderNoteCollection
    });

    ModelFactory.register('WorkOrderLogCollection', {
      restName: 'logs',
      factoryObject: WorkOrderLogCollection
    });
  }]);
