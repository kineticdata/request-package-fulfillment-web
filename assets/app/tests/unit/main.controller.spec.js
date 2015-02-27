var expect = chai.expect;

describe('MainController', function() {
  'use strict';

  var getSuccessFn;
  var getFailureFn;

  var scope;

  var filtersProviderGetStub;

  beforeEach(module('kineticdata.fulfillment'));
  beforeEach(inject(function(_$rootScope_, _$controller_, _$stateParams_, _$log_, _$q_, _FiltersService_) {
    scope = _$rootScope_.$new();

    _$controller_('MainController', {
      $rootScope: _$rootScope_,
      $scope: scope,
      $stateParams: _$stateParams_,
      $log: _$log_,
      FiltersService: _FiltersService_
    });

    getSuccessFn = function() {
      var deferred = _$q_.defer();
      deferred.resolve({filters:[{name:'test'}]});
      return deferred.promise;
    };

    getFailureFn = function() {
      var deferred = _$q_.defer();
      deferred.reject();
      return deferred.promise;
    };

    filtersProviderGetStub = sinon.stub(scope.filtersProvider, 'get');
  }));

  afterEach(function() {
    scope.filtersProvider.get.restore();
  });

  describe('initial state', function() {

    it('should default the filter to "default"', function() {
      expect(scope.activeFilter).to.equal('default');
    });

    it('should have an empty filter collection', function() {
      expect(scope.filterCollection).to.be.ok;
      expect(scope.filterCollection).to.be.empty;
    });
  });

  describe('#retrieveAllFilters', function() {

    it('should use the filter provider', function() {
      filtersProviderGetStub.withArgs().returns(getThenSuccess({filters:[{name:'test'}]}));

      scope.retrieveAllFilters();
      expect(scope.filtersProvider.get).to.be.called;
    });

    describe('when filter loading fails', function() {
      it('should set the error flash', inject(function(flash) {
        filtersProviderGetStub.withArgs().returns(getThenFailure());

        expect(flash.error).to.be.empty;
        scope.retrieveAllFilters();
        expect(flash.error).to.not.be.empty;
      }));
    });

    describe('when filter loading succeeds.', function() {
      it('should set the filters collection', function() {
        filtersProviderGetStub.withArgs().returns(getThenSuccess({filters:[{name:'test'}]}));

        scope.retrieveAllFilters();
        expect(scope.filterCollection.filters).to.be.ok;
        expect(scope.filterCollection.filters).to.have.length(1);
      });
    });

  });

});
