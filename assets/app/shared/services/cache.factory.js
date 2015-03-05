angular.module('kineticdata.fulfillment.services.cache', [])
  .factory('CacheFactory', [ '$log', '$q', '$timeout', function($log, $q, $timeout) {
    var CacheProvider = function(dataProviderFn) {
      var self = this;

      /// The function provided which retrieves data.
      self.dataProviderFn = dataProviderFn;

      /// A queue of promises waiting for data.
      self.promises = [];

      /// Cached data object(s)
      self.data;

      /// Whether the data needs to be reloaded.
      self.dirty = true;

      /// Toggles the retry interval if there are problems encountered.
      self.retry = false

      /// Sets the retry interval (in milliseconds).
      self.retryInterval = 1000;

      /// Sets the number of retry attempts.
      self.retryAttempts = 5;

      /// (Internal) Holds the promise used for manipulating the retry interval.
      self._retryPromise;
      self._retryTries=0;

      /// Performs a deferred retrieval of data, notifies all waiting promises.
      self.get = function() {
        var deferred = $q.defer();
        var sCb = function(data) {
          self.data = data;
          self.dirty = false;

          while(self.promises.length) {
            self.promises.shift().resolve(self.data);
          }
        };
        var fCb = function(data) {

          // If retries are enabled.
          if(self.retry) {
            // If the number of attempts have not been met.
            if(self._retryTries < self.retryAttempts) {
              self._retryTries++;
              self._retryPromise = $timeout(function() { dataProviderFn(sCb, fCb); }, self._retryInterval);
            } else {
              // Out of tries, reject the promise.
              self._retryTries = 0;
              while(self.promises.length) {
                self.promises.shift().reject(data);
              }
            }

          } else {
            while(self.promises.length) {
              self.promises.shift().reject(data);
            }
          }
        };

        // Data is already in the process of being loaded.
        if(self.promises.length > 0) {
          self.promises.push(deferred);


        // If the data isn't loaded or needs to be reloaded.
        } else if(!angular.isDefined(self.data) || self.dirty) {
          self.promises.push(deferred);
          dataProviderFn(sCb, fCb);


        // Assume that data is loaded and ready to return.
        } else {
          deferred.resolve(self.data);
        }


        return deferred.promise;
      };

      return this;
    };

    return {
      getCache: function(dataProviderFn) {
        $log.info('{CACHE} Generating new Cache Factory.');
        if(typeof dataProviderFn === 'undefined') {
          return;
        }
        return new CacheProvider(dataProviderFn);
      }
    }
  }]);
