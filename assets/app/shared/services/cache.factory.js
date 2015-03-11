angular.module('kineticdata.fulfillment.services.cache', [])
  .factory('CacheFactory', [ '$log', '$q', '$timeout', '$interval', function($log, $q, $timeout, $interval) {
    var CacheProvider = function(context, dataProviderFn) {
      var self = this;

      /// Holds the context that this data cache work within.
      self.context = context;

      /// The function provided which retrieves data.
      self.dataProviderFn = dataProviderFn;

      /// A queue of promises waiting for data.
      self.promises = [];

      /// Cached data object(s)
      self.data;

      /// Whether the data needs to be reloaded.
      self.dirty = true;

      /// Toggles the retry interval if there are problems encountered.
      self.retry = true;

      /// Sets the retry interval (in milliseconds).
      self.retryInterval = 10000;

      /// Sets the number of retry attempts.
      self.retryAttempts = 5;

      /// (Internal) Holds the promise used for manipulating the retry interval.
      self._retryPromise;
      self._retryTries=0;

      /// Toggles whether the cache provider will automatically refresh the data.
      self.refresh = false;
      self.refreshInterval = 60000;
      self._refreshPromise;

      self.doRefresh = function() {
        $log.debug('{CACHE} Performing data refresh.');
        self.dirty = true;
        self._get();
      };

      /// Performs a deferred retrieval of data, notifies all waiting promises.
      self.get = function() {
        // When asking the cache provider to get data outside of the automatic
        // refresh we should first cancel and reschedule the refresh interval.
        $interval.cancel(self._refreshPromise);

        if(self.refresh == true) {

          self._refreshPromise = $interval(self.doRefresh, self.refreshInterval);
        }

        return self._get();
      }

      self._get = function() {
        $log.debug('{CACHE} Attempting to retrieve cache data: ', self.context.model);
        var deferred = $q.defer();
        var sCb = function(data) {
          //$log.debug(data);
          self.data = data;
          self.dirty = false;

          while(self.promises.length) {
            self.promises.shift().resolve(self.data);
            //$log.debug(self.data)
          }
        };
        var fCb = function(data) {

          // If retries are enabled.
          if(self.retry) {
            // If the number of attempts have not been met.
            if(self._retryTries < self.retryAttempts) {
              self._retryTries++;
              self._retryPromise = $timeout(function() { dataProviderFn(self.context, sCb, fCb); }, self.retryInterval);
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
          dataProviderFn(self.context, sCb, fCb);


        // Assume that data is loaded and ready to return.
        } else {
          deferred.resolve(self.data);
        }


        return deferred.promise;
      };

      return this;
    };

    return {
      getCache: function(context, dataProviderFn) {
        $log.info('{CACHE} Generating new Cache Factory: ' + context.model);
        if(typeof dataProviderFn === 'undefined') {
          return;
        }
        return new CacheProvider(context, dataProviderFn);
      }
    }
  }]);
