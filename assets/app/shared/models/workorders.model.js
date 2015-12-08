angular.module('kineticdata.fulfillment.models.workorder', [
  'kineticdata.fulfillment.services.modelfactory'
])
  .run(['$log', 'ModelFactory', function($log, ModelFactory) {
    var WorkOrder = function(workOrder) {
      var self = this;

      _.assign(self, workOrder);
      if(typeof self.workOrderURL !== 'undefined' && self.workOrderURL !== null) {
          self.workOrderURL = self.workOrderURL.replace(/.mobile=true/, '');
      }

      //////////////////////////////////
      // GENERATE CONTEXTUAL METADATA //
      //////////////////////////////////
      if(self.groups === null) {
        self.groups = [];
      }

      if(self.groups.length === 1 && _.isEmpty(self.groups[0])) {
        self.groups = [];
      }

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
      self.getGroup = function() {
        return self.groups[self.groups.length-1];
      };

      self.getGroupName = function() {
        return self.getGroup();
      };

      self.getGroupPath = function() {
        return self.groups.join(' :: ');;
      };

      self.isUnassigned = function() {
        return (self.assignee === null || self.assignee.loginId === null)
      };

      self.getAssignedName = function() {
        if(self.isUnassigned()) {
          return 'Unassigned';
        }
        return self.assignee.name;
      };

      self.getNiceId = function() {
        return self.id.replace(/KSR0+/, 'KSR-');
      };

      self.getNiceDueDate = function() {
        if(typeof self.due === 'undefined' || _.isEmpty(self.due)) {
          return 'No Due Date'
        }

        return moment(self.due).fromNow();
      };

      self.isOverdue = function() {
        var due = new Date(self.due);
        return (due < new Date());
      };

      self.getRequestedFor = function() {
        if(self.requestedFor === null || typeof self.requestedFor.name === 'undefined') {
          return 'Nobody';
        }
        return self.requestedFor.name;
      }

    };

    var WorkOrderCollection = function(data) {
      var self = this;

      self.all = [];

      _.forEach(data.workOrders, function(workOrder) {
        self.all.push(new WorkOrder(workOrder));
      });

      self.getById = function(id) {
        return _.find(self.all, function(workOrder) {
          return workOrder.id === id;
        });
      };

      self.all.getById = function(id) {
        return _.find(self.all, function(workOrder) {
          return workOrder.id === id;
        });
      };

      // Pagination data.
      self.all.meta = {};
      self.all.meta.count = data.count;
      self.all.meta.limit = data.limit;
      self.all.meta.offset = data.offset;
    };

    var WorkOrderNote = function(note) {
      var self = this;
      _.assign(self, note);
    };

    var WorkOrderNoteCollection = function(data) {
      var self = this;
      self.all = [];
      _.forEach(data.notes, function(note) {
        self.all.push(new WorkOrderNote(note));
      });

      // Pagination data.
      self.all.meta = {};
      self.all.meta.count = data.count;
      self.all.meta.limit = data.limit;
      self.all.meta.offset = data.offset;
    };

    var WorkOrderLog = function(log) {
      var self = this;
      _.assign(self, log);
    };

    var WorkOrderLogCollection = function(data) {
      var self = this;
      self.all = [];
      _.forEach(data.logs, function(log) {
        self.all.push(new WorkOrderLog(log));
      });

      self.all.meta = {};
      self.all.meta.count = data.count;
      self.all.meta.limit = data.limit;
      self.all.meta.offset = data.offset;
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
