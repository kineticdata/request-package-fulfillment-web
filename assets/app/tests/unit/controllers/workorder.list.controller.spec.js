var expect = chai.expect;

describe('WorkOrderListController', function() {
  'use strict';
  var scope;
  var filtersProviderGetStub;
  var fakeFilterCollection;

  beforeEach(module('kineticdata.fulfillment'));
  beforeEach(inject(function(_$rootScope_, _$controller_, _$state_, _$interval_, _$stateParams_, _$log_, _$q_, _FiltersService_, _WorkOrdersService_, _ModelFactory_) {
    scope = _$rootScope_.$new();

    _$controller_('WorkOrderListController', {
      $rootScope: _$rootScope_,
      $scope: scope,
      $state: _$state_,
      $stateParams: _$stateParams_,
      $log: _$log_,
      $interval: _$interval_,
      FiltersService: _FiltersService_,
      WorkOrdersService: _WorkOrdersService_
    });

    filtersProviderGetStub = sinon.stub(scope.filterProvider, 'get');

    var fobj = _ModelFactory_.get('FilterCollection').factoryObject;
    fakeFilterCollection = new fobj(getFakeFilters());
  }));

  afterEach(function() {
    scope.filterProvider.get.restore();
  });

  describe('initial state', function() {
    describe('#filtersLoading', function() {
      it('should start as true', function() {
        expect(scope.filtersLoading).to.be.true;
      });
    });
  });

  describe('#setupFilterView', function() {
    it('should use the filter provider to get filters', function() {
      filtersProviderGetStub.withArgs().returns(getThenSuccess(fakeFilterCollection));
      scope.setupFilterView();
      expect(scope.filterProvider.get).to.have.been.called;
    });
  });

  describe('filter loading', function() {
    describe('#loadFiltersStart', function() {
      it('should set the filter loading flag', function() {
        scope.filtersLoading = false;
        scope.internal.loadFiltersStart();
        expect(scope.filtersLoading).to.be.true;
      });
    });

    describe('#loadFiltersSuccess', function() {
      it('should unset the filter loading flag', function() {
        scope.filtersLoading = true;
        scope.internal.loadFiltersSuccess(fakeFilterCollection);
        expect(scope.filtersLoading).to.be.false;
      });

      describe('when no filter provided through state', function() {
        it('should use the default filter', inject(function($stateParams) {
          expect($stateParams.id).to.not.be.ok;
          sinon.spy(fakeFilterCollection, 'getDefault');
          scope.internal.loadFiltersSuccess(fakeFilterCollection);
          expect(fakeFilterCollection.getDefault).to.have.been.called;
          fakeFilterCollection.getDefault.restore();
        }));
      });

      describe('when "default" is provided through state', function() {
        it('should use the default filter', inject(function($stateParams) {
          $stateParams.id = 'default';
          sinon.spy(fakeFilterCollection, 'getDefault');
          scope.internal.loadFiltersSuccess(fakeFilterCollection);
          expect(fakeFilterCollection.getDefault).to.have.been.called;
          fakeFilterCollection.getDefault.restore();
        }));
      });

      describe('when a filter is provided through state', function() {
        it('should use the filter identified', inject(function($stateParams) {
          $stateParams.id = fakeFilterCollection.all[0].name;
          sinon.spy(fakeFilterCollection, 'getFilter');
          scope.internal.loadFiltersSuccess(fakeFilterCollection);
          expect(fakeFilterCollection.getFilter).to.have.been.calledWith(fakeFilterCollection.all[0].name);
          fakeFilterCollection.getFilter.restore();
        }));
      });
    })
  });

  describe('#isChildState', function() {
    describe('when is child state', function() {
      it('should return true', inject(function($state) {
        $state.$current.name = 'workorder.detail';
        expect(scope.isChildState()).to.be.true;
      }));

      it('should return true', inject(function($state) {
        $state.$current.name = 'workorder';
        expect(scope.isChildState()).to.be.false;
      }));
    });
  });


});
