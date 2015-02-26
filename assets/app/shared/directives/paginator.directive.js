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

    // $scope.$watch('provider', function(provider) {
    //   if(!angular.isDefined(provider) || _.isEmpty(provider)) {
    //     return;
    //   }
    //   $log.debug('provider changed...', provider);
    //   $scope.hasPrev = provider.hasPrevPage();
    //   $scope.hasNext = provider.hasNextPage();
    // });
    //
    // $scope.$watch('provider.options.count', function(count) {
    //   if(!angular.isDefined($scope.provider) || _.isEmpty($scope.provider)) {
    //     return;
    //   }
    //
    //   var pageCount = $scope.provider.pageCount();
    //   $log.debug('page count', pageCount);
    //
    //   if(pageCount>0) {
    //     $scope.logPageCount = new Array(pageCount);
    //   } else {
    //     $scope.logPageCount = [];
    //   }
    // });

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

    // $scope.hasPrev = function() {
    //   return $scope.provider.hasPrevPage();
    // };
    //
    // $scope.hasNext = function() {
    //   return $scope.provider.hasNextPage();
    // };
    //
    // // Stupid ng-repeat hack.
    scope.logPageCount = function() {
      if(!angular.isDefined(scope.provider()) || _.isEmpty(scope.provider())) {
        return [];
      }

      var pages = scope.provider().pageCount();
      if(pages > 0) {
        return new Array(pages);
      } else {
        return [];
      }
    };
  };
  return directive;
}]);
