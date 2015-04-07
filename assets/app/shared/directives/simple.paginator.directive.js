angular.module('kineticdata.fulfillment.directives.simplepaginator', [])
.directive('simplePaginatedResource', ['$log', function($log) {
  'use strict'

  var directive = {};
  directive.restrict = 'E';
  directive.templateUrl = BUNDLE.packagePath+'assets/app/shared/directives/paginator.template.html';

  directive.scope = {
    meta: '=',
    success: '&',
    failure: '&',
    api: '&'
  };

  directive.link = function(scope) {
    $log.info('{DIR} Initializing PaginatedResource directive controller.');

    console.log(scope.meta)
    scope.hasPrev = false;
    scope.hasNext = false;
    scope.logPageCount = [];

    var pageCount = function() {
      return scope.meta.limit===0 ? 0 : Math.ceil((scope.meta.count / scope.meta.limit));
    };

    scope.clickPrev = function() {


      //scope.provider().prevPage().then(scope.success(), scope.failure());
    };

    scope.clickNext = function() {
      scope.meta.offset += scope.meta.
      api.getList()

      //scope.provider().nextPage().then(scope.success(), scope.failure());
    };

    scope.clickPage = function(pageIndex) {


      //scope.provider().gotoPage(pageIndex).then(scope.success(), scope.failure());
    };

    scope.activePageIndex = function() {
      return scope.meta.offset / scope.meta.limit;
    };

    // // Stupid ng-repeat hack.
    scope.logPageCount = function() {
      if(isProviderMissing()) {
        return [];
      }

      var pages = pageCount();
      if(pages > 0) {
        return new Array(pages);
      } else {
        return [];
      }
    };

    scope.hidden = function() {
      //if(isProviderMissing()) {
      //  return true;
      //}

      //var pages = pageCount();
      if(pageCount() > 1) {
        return false;
      } else {
        return true;
      }
    };

    var isProviderMissing = function() {
      return false;//!angular.isDefined(scope.provider()) || _.isEmpty(scope.provider())
    };
  };
  return directive;
}]);
