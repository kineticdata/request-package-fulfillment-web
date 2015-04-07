angular.module('kineticdata.fulfillment.directives.simplepaginator', [])
.directive('simplePaginatedResource', ['$log', function($log) {
  'use strict'

  var directive = {};
  directive.restrict = 'E';
  directive.templateUrl = BUNDLE.packagePath+'assets/app/shared/directives/paginator.template.html';

  directive.scope = {
    api: '=',
    datasource: '=',
    params: '='
  };

  directive.link = function(scope) {
    $log.info('{DIR} Initializing PaginatedResource directive controller.');

    scope.hasPrev = false;
    scope.hasNext = false;
    scope.logPageCount = [];

    console.log(scope.datasource)

    var invalidDatasource = function() {
      return (typeof scope.datasource === 'undefined' || typeof scope.datasource.meta === 'undefined')
    };

    var pageCount = function() {
      if(invalidDatasource()) return 0;

      return scope.datasource.meta.limit===0 ? 0 : Math.ceil((scope.datasource.meta.count / scope.datasource.meta.limit));
    };

    var doGet = function() {
      var params = {limit: scope.datasource.meta.limit, offset: scope.datasource.meta.offset};
      angular.extend(params, scope.params);

      scope.api
        .getList(params).then(
        function(data) {
          scope.datasource = data;
        },
        function() {
          toastr.warning('There was a problem retrieving data from the server.')
        }
      );
    }

    scope.hasNextPage = function() {
      return (scope.datasource.meta.count > scope.datasource.meta.offset + scope.datasource.meta.limit);
    };

    scope.hasPrevPage = function() {
      return (scope.datasource.meta.offset - scope.datasource.meta.limit) >= 0;
    };

    scope.clickPrev = function() {
      if(!scope.hasPrevPage()) {
        return;
      }
      scope.datasource.meta.offset -= scope.datasource.meta.limit;

      doGet();
    };

    scope.clickNext = function() {
      if(!scope.hasNextPage()) {
        return;
      }

      scope.datasource.meta.offset += scope.datasource.meta.limit;
      doGet();
    };

    scope.clickPage = function(pageIndex) {
    };

    scope.activePageIndex = function() {
      return scope.datasource.meta.offset / scope.datasource.meta.limit;
    };

    // // Stupid ng-repeat hack.
    scope.logPageCount = function() {
      var pages = pageCount();
      if(pages > 0) {
        return new Array(pages);
      } else {
        return [];
      }
    };

    scope.hidden = function() {
      if(pageCount() > 1) {
        return false;
      } else {
        return true;
      }
    };
  };
  return directive;
}]);
