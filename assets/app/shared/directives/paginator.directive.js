angular.module('kineticdata.fulfillment.directives.paginator', [])
.directive('paginatedResource', ['$log', function($log) {
  'use strict'

  var directive = {};
  directive.restrict = 'E';
  directive.templateUrl = BUNDLE.packagePath+'assets/app/shared/directives/paginator.template.html';

  directive.scope = {
    start: '&',
    success: '&',
    failure: '&',
    provider: '&'
  };

  directive.link = function(scope) {
    $log.info('{DIR} Initializing PaginatedResource directive controller.');

    scope.hasPrev = false;
    scope.hasNext = false;
    scope.logPageCount = [];

    scope.clickPrev = function() {
      if(angular.isDefined(scope.start())) {
        scope.start()();
      }

      scope.provider().prevPage().then(scope.success(), scope.failure());
    };

    scope.clickNext = function() {
      if(angular.isDefined(scope.start())) {
        scope.start()();
      }

      scope.provider().nextPage().then(scope.success(), scope.failure());
    };

    scope.clickPage = function(pageIndex) {
      if(angular.isDefined(scope.start())) {
        scope.start()();
      }

      scope.provider().gotoPage(pageIndex).then(scope.success(), scope.failure());
    };

    scope.activePageIndex = function() {
      return scope.provider().activePageIndex();
    };

    // // Stupid ng-repeat hack.
    scope.logPageCount = function() {
      if(isProviderMissing()) {
        return [];
      }

      var pages = scope.provider().pageCount();
      if(pages > 0) {
        return new Array(pages);
      } else {
        return [];
      }
    };

    scope.hidden = function() {
      if(isProviderMissing()) {
        return true;
      }

      var pages = scope.provider().pageCount();
      if(pages > 1) {
        return false;
      } else {
        return true;
      }
    };

    var isProviderMissing = function() {
      return !angular.isDefined(scope.provider()) || _.isEmpty(scope.provider())
    };
  };
  return directive;
}]);
