var expect = chai.expect;

describe('WorkOrderAssignController', function() {
  'use strict';
  var scope;
  var getWorkOrdersStub;

  var fakeWorkOrder;
  var fakeMember;
  var fakeGroupsL1;
  var fakeGroupsL2;

  beforeEach(module('kineticdata.fulfillment'));
  beforeEach(inject(function(_$rootScope_, _$controller_, _$stateParams_, _$log_, _AssignmentsService_, _WorkOrdersService_) {
    scope = _$rootScope_.$new();

    fakeWorkOrder = {
      id: 1,
      assignedName: 'John Doe',
      groups: [
        {
          label: 'Organization',
          id: 'ACME',
          name: 'ACME'
        },
        {
          label: 'Dept',
          id: 'Purchasing',
          name: 'Purchasing'
        }
      ]
    };

    fakeMember = {
      fullName: 'Jane Smith',
      loginId: 'jane.smith',
      firstName: 'Jane',
      lastName: 'Smith'
    };

    fakeGroupsL1 = {
      label: 'Organization',
      items: [
        {
          id: 'Demo',
          name: 'Demo',
          childrenCount: 1
        }
      ]
    };

    fakeGroupsL2 = {
      label: 'Dept',
      items: [
        {
          id: 'IT',
          name: 'IT',
          childrenCount: 0
        }
      ]
    };


    getWorkOrdersStub = sinon.stub(_WorkOrdersService_, 'getWorkOrder')//.andReturn(fakeWorkOrder);
    getWorkOrdersStub.withArgs().returns(getThenSuccess(fakeWorkOrder));
    _$controller_('WorkOrderAssignController', {
      $rootScope: _$rootScope_,
      $scope: scope,
      $log: _$log_,
      $stateParams: _$stateParams_,
      AssignmentsService: _AssignmentsService_,
      WorkOrdersService: _WorkOrdersService_
    });
    _WorkOrdersService_.getWorkOrder.restore();

    getWorkOrdersStub = sinon.stub(_WorkOrdersService_, 'getWorkOrder')
  }));

  afterEach(inject(function(_WorkOrdersService_) {
    _WorkOrdersService_.getWorkOrder.restore();
  }));

  describe('initial state', function() {
    it('should be in overview mode', function() {
      expect(scope.state.overview).to.be.true;
    });

    // Note: assumes that the initial data load succeeds.
    it('should be in loading mode', function() {
      expect(scope.state.loading).to.be.false;
    });
  });

  describe('#getGroups', function() {
    it('should set the state to loading', function() {
      // Make sure it's not already defaulted to loading.
      scope.state.loading = false;

      // Stub out work order data retrieval.
      getWorkOrdersStub.withArgs().returns(getThenNoop());

      scope.getGroups();

      expect(scope.state.loading).to.be.true;
    });

    describe('when loading is successful', function() {
      beforeEach(function() {
        fakeWorkOrder.groups.push({})
        getWorkOrdersStub.withArgs().returns(getThenSuccess(fakeWorkOrder));
      });

      it('should save the work order to the scope', function() {
        scope.getGroups();
        expect(scope.workOrder.id).to.be.equal(fakeWorkOrder.id)
      });

      it('should turn off the loading state', function() {
        scope.state.loading = true;
        scope.getGroups();
        expect(scope.state.loading).to.be.false;
      });
    });

    // TODO:MTR We're not handling failing work order loads here yet.
    describe('when loading fails', function() {

    });
  });

  describe('#buildParentsArray', function() {
    it('should return an array of group IDs', function() {
      var structure = [
        { id: 'A' },
        { id: 'B' }
      ];

      var parents = scope.buildParentsArray(structure);
      expect(parents).to.have.length(structure.length);
      expect(parents[0]).to.be.a('string');
      expect(parents).to.include('A');
      expect(parents).to.include('B');
    })
  })

  describe('view states', function() {
    var stubAssignmentsProvider;
    var stubAssignmentsService;

    beforeEach(inject(function(_AssignmentsService_) {
      stubAssignmentsService = sinon.stub(_AssignmentsService_, 'getAssignmentsByParents');

      //stubAssignmentsProvider = sinon.stub(scope.provider, 'get');
    }));

    afterEach(inject(function(_AssignmentsService_) {
      _AssignmentsService_.getAssignmentsByParents.restore();
    }));

    describe('when selecting an assignment from overview', function() {
      // Assure that we have a sane default state.
      beforeEach(function() {
        scope.state.overview = true;
        scope.state.selecting = false;
      });

      it('should have two groups in the work order', function() {
        expect(scope.workOrder.groups).to.have.length(2);
      });

      it('should change to a selecting state', function() {
        //stubAssignmentsProvider.withArgs().returns(getThenNoop());
        stubAssignmentsService.withArgs([]).returns({
          get: function() { return getThenSuccess(fakeGroupsL1); }
        });

        scope.state.overview = true;
        scope.state.selecting = false;

        scope.doStartGroupAssignment(0);
        expect(scope.state.overview).to.be.false;
        expect(scope.state.selecting).to.be.true;
      });

      it('should use the selectingGroups state next', function() {
        stubAssignmentsService.withArgs([]).returns({
          get: function() { return getThenSuccess(fakeGroupsL1); }
        });

        scope.state.selectGroups = false;
        scope.doStartGroupAssignment(0);

        expect(scope.state.selectGroups).to.be.true;
      });

      describe('when is the first group', function() {
        it('should have an empty #currentGroupStructure', function() {
          stubAssignmentsService.withArgs([]).returns({
            get: function() { return getThenSuccess(fakeGroupsL1); }
          });

          scope.doStartGroupAssignment(0);
          expect(scope.currentGroupStructure).to.be.empty;
        });
      });

      describe('when is a group but not the first', function() {
        it('should have the first group in currentGroupStructure', function() {
          stubAssignmentsService.withArgs(['ACME']).returns({
            get: function() { return getThenSuccess(fakeGroupsL1); }
          });

          scope.doStartGroupAssignment(1);
          expect(scope.currentGroupStructure).to.have.length(1);
        });
      });
    });
  });

  xdescribe('view actions', function() {
    describe('when selecting a group', function() {

    });

    describe('when selecting a member', function() {

    });
  });

});
