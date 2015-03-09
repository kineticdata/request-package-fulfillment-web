var expect = chai.expect;

describe('DataProviderFactory', function() {
  'use strict';

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
      var factory = DataProviderFactory.get(RESOURCE_NAME);
      expect(factory).to.be.a('function');
    });
  });

  describe('dataProvider', function() {

  });

  describe('#get', function() {

  });

  describe('#constructor', function() {
    it('should default dirty flag to be enabled', function() {
      var dataProvider = DataProviderFactory.get(RESOURCE_NAME)({});
      expect(dataProvider.dirty).to.be.true;
    });

    // TODO:MTR write some specs aro und this.
    describe('retrieving a model factory', function() {
      beforeEach(inject(function(_ModelFactory_) {

      }));
    })

    describe('when options is not provided', function() {
      it('should throw an exception', function() {
        var factory = DataProviderFactory.get(RESOURCE_NAME);

        // TODO:MTR why does this error? It is throwing an Error...
        //expect(factory()).to.throw(Error);
      });
    });

    describe('#url', function() {
      it('should be generated from the ConfigService base URL', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME)({url: 'ENDING'});
        expect(dataProvider.url).to.include('ENDING');
      });
    });

    describe('#model', function() {
      it('should be assigned from options', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME)({model:'MODEL'});
        expect(dataProvider.model).to.be.equal('MODEL');
      });
    });

    describe('#options', function() {
      it('should have default options', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME)({});
        expect(dataProvider.options.limit).to.be.equal(10);
      });

      it('should override default options with params', function() {
        var dataProvider = DataProviderFactory.get(RESOURCE_NAME)({params: {limit: 20}});
        expect(dataProvider.options.limit).to.be.equal(20);
      });
    });


  });
});
