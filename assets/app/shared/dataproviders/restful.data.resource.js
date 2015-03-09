angular.module('kineticdata.fulfillment.dataproviders.restfuldataresource', [
  'kineticdata.fulfillment.services.dataproviderfactory'
])
  .run(['$log', '$http', '$q', 'ModelFactory', 'DataProviderFactory', 'ConfigService', 'CacheFactory', function($log, $http, $q, ModelFactory, DataProviderFactory, ConfigService, CacheFactory) {
    var PaginatedRestfulDataResource = function(options) {
      var self = this;

      //if(!(this instanceof PaginatedRestfulDataResource)) { return new PaginatedDataProviderFactory(options); }

      if(typeof options === 'undefined') {
        $log.error('{PRDR} Paginated RESTful Data Resource was not provided necessary options.');
        throw new Error('PaginatedRestfulDataResource: Options Missing');
      }

      var returnResolvedPromise = function() {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise();
      };

      // Default the options argument and warn that there may be problems.
      if(!angular.isDefined(options)) {
        $log.warn('{PRDR} No options were passed, requests may not work.');
        options = {};
      }

      /// Default pagination options.
      self.defaultOptions = {
        limit: 10,
        offset: 0,
        count: 0
      };

      /// Current pagination options;
      self.options = angular.copy(self.defaultOptions);
      if(typeof options.params !== 'undefined') {
        angular.extend(self.options, options.params);
      }

      self.generateUrl = function() {
        return self.url + '&limit=' + self.options.limit + '&offset=' + self.options.offset;
      };

      /// The URL to be used as a basis for this RESTful resource.
      self.url = ConfigService.getBaseUrl() + options.url;

      /// A string representing the model to be transformed.
      self.model = options.model;

      /// The factory that converts the JSON to a model.
      self.factory = ModelFactory.get(self.model);

      /// The data provider that performs the data request. It is used by the CacheFactory.
      self.dataProvider = function(context, sCb, fCb) {
        $log.info('{PRDR:DP} Attempting to retrieve paginated RESTful data.');
        var targetUrl = context.generateUrl();

        $http({
          method: 'GET',
          url: targetUrl
        }).success(function(data, status, headers) {

          // If we receive invalid input we need to reject all promises.
          if(headers('content-type') === 'text/html;charset=UTF-8') {
            $log.error('{PRP} Rejected invalid response, came as HTML instead of JSON.');
            fCb(data);
          } else {
            // Save the page data.
            context.options.limit = data.limit;
            context.options.count = data.count;
            context.options.offset = data.offset;

            // Convert the model.
            //self.data = new self.factory.factoryObject(data[self.factory.restName]);
            modelData = new context.factory.factoryObject(data[context.factory.restName]);
            $log.debug(modelData);
            // Turn off the 'dirty' flag as we've successfully loaded data.
            //self.dirty = false;

            // Resolve all promises.
            //while(self.promises.length) {
            //  self.promises.shift().resolve(self.data);
            //}
            sCb(modelData);
          }

        }).error(function(data) {
          //while(self.promises.length) {
          //  self.promises.shift().reject(data);
          //}
          fCb(data);
        });
      };

      self.cache = CacheFactory.getCache(self, self.dataProvider);

      self.pageCount = function() {
        return self.options.limit===0 ? 0 : Math.ceil((self.options.count / self.options.limit));
      };

      self.hasNextPage = function() {
        return (self.options.count > self.options.offset + self.options.limit);
      };

      self.hasPrevPage = function() {
        return (self.options.offset - self.options.limit) >= 0;
      };

      self.nextPage = function() {
        if(!self.hasNextPage()) {
          $log.warn('{PRP} Attempted to move to next page when no more pages remain: ' + self.options.count);
          return returnResolvedPromise();
        }

        self.options.offset += self.options.limit;
        return self.get(true);
      };

      self.prevPage = function() {
        if(!self.hasPrevPage()) {
          $log.warn('{PRP} Attempted to move to previous page when no more pages remain: ' + self.options.count);
          return returnResolvedPromise();
        }

        self.options.offset -= self.options.limit;
        return self.get(true);
      };

      self.gotoPage = function(page) {
        var targetOffset = page * self.options.limit;
        if(targetOffset > self.options.count) {
          return returnResolvedPromise;
        }
        self.options.offset = targetOffset;
        return self.get(true);
      };

      self.activePageIndex = function() {
        return self.options.offset / self.options.limit;
      };

      self.setPageSize = function(limit) {
        self.options.limit = limit;
        self.options.offset = 0;
        return self.get(true);
      }

      self.get = function(force) {
        if(typeof force !== 'undefined') {
          self.cache.dirty = true;
        }
        return self.cache.get();
      };

      return self;
    };

    DataProviderFactory.register('PaginatedRestfulDataResource', PaginatedRestfulDataResource);
  }]);
