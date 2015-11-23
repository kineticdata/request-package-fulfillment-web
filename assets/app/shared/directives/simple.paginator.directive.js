angular.module('kineticdata.fulfillment.directives.simplepaginator', [])
.directive('simplePaginatedResource', ['$log', '$cacheFactory', function($log, $cacheFactory) {
  'use strict'

  var directive = {};
  directive.restrict = 'E';
  directive.templateUrl = BUNDLE.packagePath+'/assets/app/shared/directives/paginator.template.html';

  directive.scope = {
    datasource: '=',
    doNext: '=',
    doPrev: '=',
    doPage: '='
  };

  directive.link = function(scope) {
    $log.info('{SimplePaginatedResource} Executing directive linking.');

    scope.hasPrev = false;
    scope.hasNext = false;
    scope.logPageCount = [];

    var invalidDatasource = function() {
      return (typeof scope.datasource === 'undefined' || typeof scope.datasource.meta === 'undefined')
    };

    var pageCount = function() {
      if(invalidDatasource()) return 0;

      return scope.datasource.meta.limit===0 ? 0 : Math.ceil((scope.datasource.meta.count / scope.datasource.meta.limit));
    };

    //var doGet = function() {
    //  var params = {limit: scope.datasource.meta.limit, offset: scope.datasource.meta.offset};
    //  angular.extend(params, scope.params);
    //
    //  $cacheFactory('http').removeAll();
    //  scope.api
    //    .getList(params).then(
    //    function(data) {
    //      //scope.$applyAsync(function() {
    //        console.log(data)
    //        scope.datasource = data;
    //      //});
    //    },
    //    function() {
    //      toastr.warning('There was a problem retrieving data from the server.')
    //    }
    //  );
    //}

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
      //scope.datasource.meta.offset -= scope.datasource.meta.limit;
      scope.doPrev();
      //doGet();
    };

    scope.clickNext = function() {
      if(!scope.hasNextPage()) {
        return;
      }

      //scope.datasource.meta.offset += scope.datasource.meta.limit;
      scope.doNext();
      //doGet();
    };

    scope.clickPage = function(pageIndex) {
      scope.doPage(pageIndex+1)
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
