var expect = chai.expect;

describe('CacheFactory', function() {
  'use strict';

  var context = {
    model: 'TestModel'
  };

  var CacheFactory;
  var $rootScope;

  // Load the application module.
  beforeEach(module('kineticdata.fulfillment'));

  // Disable the UI-Router default state so it doesn't interfere with $httpBackend tests.
  beforeEach(module(function ($urlRouterProvider) {
    $urlRouterProvider.otherwise(function(){return false;});
  }));

  // Get the CacheFactory
  beforeEach(inject(function(_$rootScope_, _CacheFactory_) {
    $rootScope = _$rootScope_;
    CacheFactory = _CacheFactory_;
  }));

  describe('#getCache', function() {
    describe('when data provider provided', function() {
      it('should return a CacheProvider', function() {
        var cache = CacheFactory.getCache(context, function() {});
        expect(cache).to.be.an('object');
      });
    });

    describe('when data provider is not provided', function() {
      it('should return an undefined', function() {
        var cache = CacheFactory.getCache(context);
        expect(cache).to.be.an('undefined');
      });
    });
  });

  describe('CacheProvider', function() {

    describe('#get', function() {
      describe('when data is not loaded', function() {
        var providerSpy;
        var cache;

        beforeEach(function() {
          providerSpy = sinon.spy();
          cache = CacheFactory.getCache(context, providerSpy)
        });

        it('should queue a promise', function() {
          expect(cache.promises).to.be.empty;
          var promise = cache.get();
          expect(cache.promises).to.be.length(1);
          expect(cache.promises[0].promise).to.be.equal(promise);
        });

        it('should call the provider to start getting data', function() {
          cache.get();
          expect(providerSpy).to.have.been.calledOnce;
        });
      });

      describe('when data is dirty', function() {
        var providerSpy;
        var cache;

        beforeEach(function() {
          providerSpy = sinon.spy();
          cache = CacheFactory.getCache(context, providerSpy);
          cache.data = { demo: 'data' };
          cache.dirty = true;
        });

        it('should queue a promise', function() {
          expect(cache.promises).to.be.empty;
          var promise = cache.get();
          expect(cache.promises).to.be.length(1);
          expect(cache.promises[0].promise).to.be.equal(promise);
        });

        it('should call the provider to start getting data', function() {
          cache.get();
          expect(providerSpy).to.have.been.calledOnce;
        });

      });

      describe('when data is is already loaded and not dirty', function() {
        var CacheProvider;
        var providerSpy;

        beforeEach(function() {
          providerSpy = sinon.spy();
          CacheProvider = CacheFactory.getCache(context, providerSpy);
          CacheProvider.data = { demo: 'data' };
          CacheProvider.dirty = false;
        });

        it('should not queue the promise', function() {
          var promise = CacheProvider.get();

          expect(CacheProvider.promises).to.be.empty;
        });

        it('should resolve with data', function() {
          var promise = CacheProvider.get();
          var resolvedData;
          promise.then(function(data) { resolvedData = data; });

          $rootScope.$apply();

          expect(resolvedData).to.be.ok;
          expect(resolvedData.demo).to.be.equal('data');
        });
      });

      describe('when data is being loaded.', function() {
        it('should not call the data provider', function() {
          var providerSpy = sinon.spy();
          var cache = CacheFactory.getCache(context, providerSpy);
          cache.get();
          cache.get();

          // The first get starts the loading, the second should be queued, so the provider should only be
          // called the one time.
          expect(providerSpy).to.be.calledOnce;
        });

        it('should queue the promise', function() {
          var providerSpy = sinon.spy();
          var cache = CacheFactory.getCache(context, providerSpy);
          cache.get();
          cache.get();

          // Again, the first call initiates the load, the 2nd call should get queued. Check the queue size.
          expect(cache.promises).to.have.length(2);
        });
      })
    });

    describe('loading', function() {
      var getClosureFn = function(index, where) {
        return function(data) {
          where[index] = data;
        }
      };

      var rejectionData = { message: 'broken' };
      var successData = { demo: 'data' };

      describe('when loading fails', function() {
        var cache;

        var rejectionCallback;
        var fakeProvider;
        var fakeProviderSpy;

        beforeEach(function() {
          fakeProvider = function(context, sCb, fCb) {
            rejectionCallback = fCb;
          };
          fakeProviderSpy = sinon.spy(fakeProvider);

          cache = CacheFactory.getCache(context, fakeProviderSpy);
        });

        describe('with retries enabled', function() {
          beforeEach(inject(function(_$timeout_) {
            // Flush out anything old and pending.
            _$timeout_.flush();

            // Enable retries.
            cache.retry = true;
          }));

          describe('while retry attempts remain', function() {
            it('should not reject any promises', function() {
              var resolvedData = [];

              // Execute the retrieval.
              cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

              expect(cache.promises).to.be.length(1);
              rejectionCallback(rejectionData);

              $rootScope.$apply();

              expect(cache.promises).to.be.length(1);
              expect(resolvedData[1]).to.be.empty;
            });

            it('should queue a delayed check', inject(function(_$timeout_) {
              var resolvedData = [];
              _$timeout_.verifyNoPendingTasks();

              // Execute the retrieval.
              cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

              expect(cache.promises).to.be.length(1);
              rejectionCallback(rejectionData);

              // Flush the timeout timer
              _$timeout_.flush();
              $rootScope.$apply();

              // Should be called twice: once for the initial failure and one for the timeout.
              expect(fakeProviderSpy).to.have.been.calledTwice;
              expect(cache._retryTries).to.be.equal(1);
            }));

            it('should increment the retry tries', function() {
              var resolvedData = [];

              expect(cache._retryTries).to.be.equal(0);

              // Execute the retrieval.
              cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

              rejectionCallback(rejectionData);

              $rootScope.$apply();

              expect(cache._retryTries).to.be.equal(1);
            })
          });

          describe('when retry attempts run out', function() {
            beforeEach(function() {
              cache._retryTries = cache.retryAttempts;
            });

            it('should immediately reject the promises', function() {
              var resolvedData = [];

              // Execute the retrieval.
              cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

              expect(cache.promises).to.be.length(1);
              rejectionCallback(rejectionData);

              $rootScope.$apply();

              expect(cache.promises).to.be.length(0);
              expect(resolvedData[1]).to.not.be.empty;
            });

            it('should reset the retry tries for future attempts', function() {
              var resolvedData = [];

              expect(cache._retryTries).to.be.equal(cache.retryAttempts);
              // Execute the retrieval.
              cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

              rejectionCallback(rejectionData);

              $rootScope.$apply();

              expect(cache._retryTries).to.be.equal(0);
            });
          });
        });

        describe('without retries enabled', function() {
          beforeEach(function() {
            // Ensure the retry functionality is disabled.
            cache.retry = false;
          });

          it('should reject all promises in queue', function() {
            var requestAttempts = 5;
            var successData = [];
            var failureData = [];

            // Attempt to get data a bunch of times.
            for(var idx=0; idx<requestAttempts; idx++) {
              cache.get().then(
                getClosureFn(idx, successData),
                getClosureFn(idx, failureData)
              );
            }

            // Make sure that the provider wasn't spammed with requests.
            expect(fakeProviderSpy).to.have.been.calledOnce;

            // Make sure there are the right number of promises to resolve.
            expect(cache.promises).to.be.length(requestAttempts);

            // Signal the cache provider that the data provider failed to get data.
            rejectionCallback(rejectionData);

            // Apply the scope to resolve the promises.
            $rootScope.$apply();

            // Expect that there were no successes, and all failures.
            for(var idx=0; idx<requestAttempts; idx++) {
              expect(successData[idx]).to.not.be.ok;
              expect(failureData[idx]).to.be.ok;
            }

          });

          it('should not modify the cached data', function() {
            // Set some cache data and ensure that the data is 'dirty' so an attempt to
            // retrieve the data is made.
            cache.data = successData;
            cache.dirty = true;
            cache.get().then(function(){}, function(){});
            rejectionCallback(rejectionData);

            // Resolve the promises.
            $rootScope.$apply();

            // Make sure cache data wasn't replaced with the rejection data.
            expect(cache.data.demo).to.be.equal(successData.demo);
          });

          it('should not modify the dirty flag', function() {
            // Set some cache data and ensure that the data is 'dirty' so an attempt to
            // retrieve the data is made.
            cache.data = successData;
            cache.dirty = true;
            cache.get().then(function(){}, function(){});
            rejectionCallback(rejectionData);

            // Resolve the promises.
            $rootScope.$apply();

            // Make sure cache data wasn't replaced with the rejection data.
            expect(cache.dirty).to.be.true;
          });

          it('should return the provided data in the rejection', function() {
            var resolvedData = [];

            // Execute the retrieval.
            cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

            // The provider should only get called once.
            expect(cache.promises).to.be.length(1);
            expect(fakeProviderSpy).to.have.been.calledOnce;

            rejectionCallback(rejectionData);

            // Make sure there is no failure data ahead of time.
            expect(resolvedData[1]).to.be.empty;

            $rootScope.$apply();

            // Make sure we now have failure data.
            expect(resolvedData[1]).to.not.be.empty;
            // And that we never received any success data.
            expect(resolvedData[0]).to.be.empty;
            expect(resolvedData[1].message).to.be.equal(rejectionData.message);
          });
        });
      });

      describe('when loading succeeds', function() {
        var cache;
        var fakeProvider;
        var successCallback;
        var fakeProviderSpy;

        beforeEach(function() {
          fakeProvider = function(context, sCb, fCb) {
            successCallback = sCb;
          };
          fakeProviderSpy = sinon.spy(fakeProvider);

          cache = CacheFactory.getCache(context, fakeProviderSpy);
        });

        it('should resolve all promises in the queue', function() {
          var requestAttempts = 5;
          var successData = [];
          var failureData = [];

          // Attempt to get data a bunch of times.
          for(var idx=0; idx<requestAttempts; idx++) {
            cache.get().then(
              getClosureFn(idx, successData),
              getClosureFn(idx, failureData)
            );
          }

          // Make sure that the provider wasn't spammed with requests.
          expect(fakeProviderSpy).to.have.been.calledOnce;

          // Make sure there are the right number of promises to resolve.
          expect(cache.promises).to.be.length(requestAttempts);

          // Signal the cache provider that the data provider failed to get data.
          successCallback(successData);

          // Apply the scope to resolve the promises.
          $rootScope.$apply();

          // Expect that there were no successes, and all failures.
          for(var idx=0; idx<requestAttempts; idx++) {
            expect(successData[idx]).to.be.ok;
            expect(failureData[idx]).to.not.be.ok;
          }
        });

        it('should save data to the cache', function() {
          // Make sure there is no cache data ahead of time.
          expect(cache.data).to.be.empty;

          // Execute the retrieval.
          cache.get().then(function(){},function(){});

          // The provider should only get called once.
          expect(cache.promises).to.be.length(1);
          expect(fakeProviderSpy).to.have.been.calledOnce;
          successCallback(successData);

          $rootScope.$apply();

          // Make sure we now have cache data.
          expect(cache.data).to.not.be.empty;
        });

        it('should return provided data in the resolve', function() {
          var resolvedData = [];

          // Execute the retrieval.
          cache.get().then(getClosureFn(0, resolvedData), getClosureFn(1, resolvedData));

          // The provider should only get called once.
          expect(cache.promises).to.be.length(1);
          expect(fakeProviderSpy).to.have.been.calledOnce;

          successCallback(successData);

          // Make sure there is no success data ahead of time.
          expect(resolvedData[0]).to.be.empty;

          $rootScope.$apply();

          // Make sure we now have success data.
          expect(resolvedData[0]).to.not.be.empty;
          // And that we never received any failure data.
          expect(resolvedData[1]).to.be.empty;
          expect(resolvedData[0].demo).to.be.equal(successData.demo);
        });

        it('should reset the dirty flag', function() {
          // Set some cache data and ensure that the data is 'dirty' so an attempt to
          // retrieve the data is made.
          cache.data = successData;
          cache.dirty = true;
          cache.get().then(function(){}, function(){});
          successCallback(successData);

          // Resolve the promises.
          $rootScope.$apply();

          // Make sure cache data wasn't replaced with the rejection data.
          expect(cache.dirty).to.be.false;
        });
      });
    })
  })
});
