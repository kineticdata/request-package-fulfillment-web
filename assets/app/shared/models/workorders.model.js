angular.module('kineticdata.fulfillment.models.workorder', [
  'kineticdata.fulfillment.services.modelfactory'
])
  .run(['$log', 'ModelFactory', function($log, ModelFactory) {
    var WorkOrder = function(workOrder) {
      var self = this;

      _.assign(self, workOrder);
      self.workOrderURL = self.workOrderURL.replace(/.mobile=true/, '');

      //////////////////////////////////
      // GENERATE CONTEXTUAL METADATA //
      //////////////////////////////////

      for(var idx=0; idx<self.groups.length; idx++) {
        var group = self.groups[idx];
        if(idx === 0) {
          // The first group has no parent.
          group._parent = '';
        } else {
          // Set the current group's parent to the previous group.
          group._parent = self.groups[idx-1].label;
          // Set the previous group's child to the current group.
          self.groups[idx-1]._child = group.label;
        }
      }
      //$log.debug('{GRP} Parents ', self.groups);

      ////////////////////////////////////////////
      // Decorate the data with helper methods. //
      ////////////////////////////////////////////
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

      self.getGroupPath = function() {
        var path = '';

        _.forEach(self.groups, function(wog) {
          path += wog.name + ' :: ';
        });
        path = path.replace(/ :: $/, '');

        return path;
      };

      self.isUnassigned = function() {
        if(self.assignedName === undefined || self.assignedName === null) {
          return true;
        }
        return false;
      };

      self.getAssignedName = function() {
        if(self.isUnassigned()) {
          return 'Unassigned';
        }
        return self.assignedName;
      };

      self.getNiceRequestId = function() {
        return self.requestId.replace(/KSR0+/, 'KSR-');
      };

      self.getNiceDueDate = function() {
        if(typeof self.due === 'undefined' || _.isEmpty(self.due)) {
          return 'No Due Date'
        }

        return moment(self.due).fromNow();
      };

      self.isOverdue = function() {
        var due = new Date(self.due);
        if(due < new Date()) {
          return true;
        }
        return false;
      }

    };

    var WorkOrderCollection = function(data) {
      var self = this;

      self.all = [];

      _.forEach(data, function(workOrder) {
        self.all.push(new WorkOrder(workOrder));
      });

      self.getById = function(id) {
        var wo = _.find(self.all, function(workOrder) {
          return workOrder.id === id;
        });
        return wo;
      }
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
