// 'use strict';

angular.module('kineticdata.fulfillment', [
  // Third Party Dependencies.
  'ui.router',
  'angularMoment',
  'angular-flash.service',
  'angular-flash.flash-alert-directive',
  'ui.bootstrap',

  // // Models.
  'kineticdata.fulfillment.models.workorder',
  'kineticdata.fulfillment.models.filter',

  // // Directives
  'kineticdata.fulfillment.directives.paginator',
  'kineticdata.fulfillment.directives.workframe',

  // Controllers
  'kineticdata.fulfillment.controllers.main',
  'kineticdata.fulfillment.controllers.workorderlist',
  'kineticdata.fulfillment.controllers.workorderdetail',
  // 'kineticdata.fulfillment.controllers.workorder',
  // 'kineticdata.fulfillment.controllers.login',
  //
  // Services
  // 'kineticdata.fulfillment.services.auth',
  // 'kineticdata.fulfillment.services.httpinterceptorfactory'
  'kineticdata.fulfillment.services.paginateddataprovider'

]);

angular.module('kineticdata.fulfillment').config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'flashProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider, flashProvider) {
    'use strict';

    flashProvider.errorClassnames.push('alert-danger');

    $urlRouterProvider.otherwise('/workorder/default');
    $stateProvider
      .state('workorders', {
        url: '/workorder/:id',
        templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.list.html',
        controller: 'WorkOrderListController',
        module: 'private'
      })
      .state('workorders.detail', {
        url: '/:workOrderId',
        templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.detail.html',
        controller: 'WorkOrderDetailController',
        module: 'private'
      })
      .state('login', {
        url: '/login',
        templateUrl: BUNDLE.packagePath+'/partials/login.html',
        controller: 'LoginController',
        module: 'public'
      });

    $httpProvider.defaults.withCredentials = true;
  }])
  .run(['$log', '$rootScope', '$state', '$stateParams', function($log, $rootScope, $state, $stateParams) {
    'use strict';

    //$rootScope.$on('$stateChangeStart', function(event, toState) {
      //if(toState.module == 'private' && !AuthService.authorized()) {
      //  $log.debug('Private module requiring authentication and not authenticated: ' + toState.name);
      //  event.preventDefault();
      //  $state.go('login');
      //}
    //});
  }]);
