angular.module('kineticdata.fulfillment.services.paginateddataprovider', [
  'kineticdata.fulfillment.services.config',
  'kineticdata.fulfillment.services.modelfactory'
])
  .factory('PaginatedDataProviderFactory', ['$q', '$log', '$http', 'ConfigService', 'ModelFactory', function($q, $log, $http, ConfigService, ModelFactory) {
    'use strict';

    $log.info('{SVC} PaginatedDataProviderFactory :: Initializing.');

    var defaultOptions = {
      limit: 2,
      offset: 0,
      count: 0
    };

    var ResourceProvider = function(url, model, params) {
      var self = this;
      self.promises = [];
      self.dirty = true;

      // Default the options.
      self.options = angular.copy(defaultOptions);
      if(typeof params !== 'undefined') {
        angular.extend(self.options, params);
      }

      self.url = ConfigService.getBaseUrl() + url;
      self.model = model;
      self.factory = ModelFactory.get(model);

      ///////////////////////////////
      // RESOURCE PROVIDER METHODS //
      ///////////////////////////////

      // This method actually performs the retrieval of data.
      self.get = function() {
        var targetUrl = self.generateUrl();
        var deferred = $q.defer();

        // We are already loading and there are pending promises.
        if(self.promises.length > 0) {
          self.promises.push(deferred);

        // Data has not yet been loaded so initiate the load.
        } else if(self.data === undefined || self.dirty) {
          $log.debug('{PRP} Attempting to retrieve for '+self.model+' from: ' + targetUrl);
          self.promises.push(deferred);

          $http({
            method: 'GET',
            url: targetUrl
          }).success(function(data, status, headers) {

            // If we receive invalid input we need to reject all promises.
            if(headers('content-type') === 'text/html;charset=UTF-8') {
              $log.error('{PRP} Rejected invalid response, came as HTML instead of JSON.');
              while(self.promises.length) {
                self.promises.shift().reject(data);
              }
            } else {
              // Save the page data.
              self.options.limit = data.limit;
              self.options.count = data.count;
              self.options.offset = data.offset;

              // Convert the model.
              self.data = new self.factory.factoryObject(data[self.factory.restName]);

              // Resolve all promises.
              while(self.promises.length) {
                self.promises.shift().resolve(self.data);
              }
            }

          }).error(function(data) {
            deferred.reject(data);
          });

        // Data has been loaded, just resolve with the loaded data.
        } else {
          deferred.resolve(self.data);
        }


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
          $log.warn('{PRP} Attempted to move to next page when no more pages remain: ' + self.options.count);
          return;
        }

        self.options.offset += self.options.limit;
        self.dirty = true;
        return self.get();
      };

      self.prevPage = function() {
        if(!self.hasPrevPage()) {
          $log.warn('{PRP} Attempted to move to previous page when no more pages remain: ' + self.options.count);
          return;
        }

        self.options.offset -= self.options.limit;
        self.dirty = true;
        return self.get();
      };

      self.gotoPage = function(page) {
        var targetOffset = page * self.options.limit;
        if(targetOffset > self.options.count) {
          return;
        }
        self.options.offset = targetOffset;
        self.dirty = true;
        return self.get();
      };

      self.activePageIndex = function() {
        return self.options.offset / self.options.limit;
      };

      return this;
    };

    return {
      getResourceProvider: function(url, model, params) {
        $log.info('{PRP} Generating PRP for "'+model+'"');
        return new ResourceProvider(url, model, params);
      },
      defaults: {
        options: defaultOptions
      }
    };
  }]);
