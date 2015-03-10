var expect = chai.expect;

describe('PaginatedRestfulDataResource', function() {
  'use strict';

  // For the options passed in these two options are mandatory.
  var options = {
    model: 'MODEL',
    url: 'ENDING'
  };

  var RESOURCE_NAME = 'PaginatedRestfulDataResource';

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
    it('should be automatically registered', function() {
      var factory = DataProviderFactory.get(RESOURCE_NAME, options);
      expect(factory).to.be.an('object');
    });
  });

  describe('dataProvider', function() {

  });

  describe('#get', function() {

  });

  describe('#constructor', function() {
    // This is a cache-level flag now.
    xit('should default dirty flag to be enabled', function() {
      var dataProvider = DataProviderFactory.get(RESOURCE_NAME, options);
      expect(dataProvider.dirty).to.be.true;
    });

    // TODO:MTR write some specs aro und this.
    describe('retrieving a model factory', function() {
      beforeEach(inject(function(_ModelFactory_) {

      }));
    })

    describe('when options is not provided', function() {
      it('should throw an exception', function() {
        var factory = DataProviderFactory.get(RESOURCE_NAME, options);

        // TODO:MTR why does this error? It is throwing an Error...
        //expect(factory()).to.throw(Error);
      });
    });

    describe('#url', function() {
      it('should be generated from the ConfigService base URL', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME, options);
        expect(dataProvider.url).to.include('ENDING');
      });
    });

    describe('#model', function() {
      it('should be assigned from options', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME, options);
        expect(dataProvider.model).to.be.equal('MODEL');
      });
    });

    describe('#options', function() {
      it('should have default options', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME, options);
        expect(dataProvider.options.limit).to.be.equal(10);
      });

      it('should override default options with params', function() {
        var newOptions = angular.copy(options);
        newOptions.params = {};
        newOptions.params.limit = 20;

        var dataProvider = DataProviderFactory.get(RESOURCE_NAME, newOptions);
        expect(dataProvider.options.limit).to.be.equal(20);
      });
    });


  });
});
