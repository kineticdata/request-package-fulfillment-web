var expect = chai.expect;

describe('DataProviderFactory', function() {
  'use strict';

  var DataProviderFactory;
  var $rootScope;

  // Load the application module.
  beforeEach(module('kineticdata.fulfillment'));

  // Get the DatapProviderFactory
  beforeEach(inject(function(_$rootScope_, _DataProviderFactory_) {
    $rootScope = _$rootScope_;
    DataProviderFactory = _DataProviderFactory_;
  }));

  describe('registration', function() {
    it('should be retrievable', function() {
      var factory = function() {};

      expect(DataProviderFactory.get('key')).to.be.an('undefined');
      DataProviderFactory.register('key', factory);

      expect(DataProviderFactory.get('key')).to.be.a('function');
    });
  });


});
