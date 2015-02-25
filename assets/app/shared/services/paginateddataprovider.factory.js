angular.module('kineticdata.fulfillment.services.paginateddataprovider', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.modelfactory'
])
  .factory('PaginatedDataProviderFactory', ['$q', '$log', '$http', 'ConfigService', 'ModelFactory', function($q, $log, $http, ConfigService, ModelFactory) {
    'use strict';
    
    $log.info('{SVC} PaginatedDataProviderFactory :: Initializing.');

    var defaultOptions = {
      limit: 10,
      offset: 0,
      count: 0
    };

    var ResourceProvider = function(url, model, params) {
      var self = this;
      self.loading = true;

      // Default the options.
      self.options = angular.copy(defaultOptions);
      if(typeof params !== 'undefined') {
        angular.extend(self.options, params);
      }

      self.url = ConfigService.getBaseUrl() + url;
      self.model = model;
      self.factory = ModelFactory.get(model);

      // Define methods

      // This method actually performs the retrieval of data.
      self.get = function() {
        self.loading = true;
        var targetUrl = self.generateUrl();

        $log.debug('Attempting to retrieve from: ' + targetUrl)
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: targetUrl
        }).success(function(data, status, headers) {
          self.loading = false;
          if(headers('content-type') === 'text/html;charset=UTF-8') {
            $log.error('Rejected invalid response, came as HTML instead of JSON.');
            deferred.reject(data);
          } else {
            // Save the page data.
            self.options.limit = data.limit;
            self.options.count = data.count;
            self.options.offset = data.offset;

            // Convert the model and return it.
            self.data = new self.factory.factoryObject(data[self.factory.restName]);
            deferred.resolve();
          }

        }).error(function(data) {
          self.loading = false;
          deferred.reject(data);
        });

        return deferred.promise;

      };

      self.generateUrl = function() {
        return self.url + '&limit=' + self.options.limit + '&offset=' + self.options.offset;
      };

      self.pageCount = function() {
        return Math.ceil((self.options.count / self.options.limit));
      };

      self.hasNextPage = function() {
        return (self.options.count > self.options.offset + self.options.limit);
      };

      self.hasPrevPage = function() {
        return (self.options.offset - self.options.limit) >= 0;
      };

      self.nextPage = function() {
        if(!self.hasNextPage()) {
          $log.warn('Attempted to move to next page when no more pages remain: ' + self.options.count);
          return;
        }

        self.options.offset += self.options.limit;
        return self.get();
      };

      self.prevPage = function() {
        if(!self.hasPrevPage()) {
          $log.warn('Attempted to move to previous page when no more pages remain: ' + self.options.count);
          return;
        }

        self.options.offset -= self.options.limit;
        return self.get();
      };

      self.gotoPage = function(page) {
        var targetOffset = page * self.options.limit;
        if(targetOffset > self.options.count) {
          $log.warn('Attempted to change to invalid page.');
          return;
        }
        self.options.offset = targetOffset;
        return self.get();
      };

      self.activePageIndex = function() {
        return self.options.offset / self.options.limit;
      };

      return this;
    };

    return {
      getResourceProvider: function(url, model, params) { return new ResourceProvider(url, model, params) },
      defaults: {
        options: defaultOptions
      }
    };
  }]);
