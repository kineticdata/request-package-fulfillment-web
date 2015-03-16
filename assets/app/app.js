/// We'll need to manually wire the request package search bar into Angular.
$(function() {
  // Get the Angular injector.
  var injector = angular.element($('[ng-app]')).injector();

  var button = $('form.portal-search span button');

  // Set placeholders.
  $('form.portal-search span button').parent().parent().find('input#search').attr('placeholder', 'Search Fulfillment...');

  // When the button is clicked, get the text and inject a state change in Angular.
  button.on('click', function(e) {
    e.preventDefault();
    var input = $(this).parent().parent().find('input#search');
    var search = input.val();
    if(angular.isDefined(search) && search.length > 0) {
      injector.get('$state').go('workorders', {
        id: 'search',
        terms: search
      });
    }

  });
});

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
  'kineticdata.fulfillment.models.assignments',

  // // Directives
  'kineticdata.fulfillment.directives.paginator',
  'kineticdata.fulfillment.directives.workframe',
  'kineticdata.fulfillment.directives.rowhover',

  // Controllers
  'kineticdata.fulfillment.controllers.main',
  'kineticdata.fulfillment.controllers.workorderlist',
  'kineticdata.fulfillment.controllers.workorderdetail',
  'kineticdata.fulfillment.controllers.workorderassign',
  //'kineticdata.fulfillment.controllers.debug',
  // 'kineticdata.fulfillment.controllers.login',
  //
  // Services
  // 'kineticdata.fulfillment.services.auth',
  // 'kineticdata.fulfillment.services.httpinterceptorfactory'
  'kineticdata.fulfillment.services.paginateddataprovider',
  'kineticdata.fulfillment.services.cache',
  'kineticdata.fulfillment.services.dataproviderfactory',
  'kineticdata.fulfillment.interceptors.auth',
  'kineticdata.fulfillment.services.assignments',

  // Data Providers
  'kineticdata.fulfillment.dataproviders.restfuldataresource'

]);

angular.module('kineticdata.fulfillment').config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'flashProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider, flashProvider) {
    'use strict';

    var filters = {
      templateUrl: BUNDLE.packagePath+'assets/app/main/main.tpl.html',
      controller: 'MainController'
    };

    flashProvider.errorClassnames.push('alert-danger');

    $urlRouterProvider.otherwise('/workorder/default');
    $stateProvider
      .state('workorders', {
        url: '/workorder/{id}?{terms}',
        views: {
          '@': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.list.html',
            controller: 'WorkOrderListController'
          },
          'filters@': filters
        },

        module: 'private'
      })
      .state('workorders.detail', {
        url: '/:workOrderId',
        views: {
          '': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.detail.html',
            controller: 'WorkOrderDetailController'
          },
          'filters@': filters
        },

        module: 'private'
      })
      .state('workorders.assign', {
        url: '/:workOrderId/assign',
        views: {
          '': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.assign.html',
            controller: 'WorkOrderAssignController'
          },
          'filters@': filters
        }
      })
      .state('debug', {
        url: '/debug',
        templateUrl: BUNDLE.packagePath+'/assets/app/debug/debug.html',
        controller: 'DebugController'
      })
      .state('login', {
        url: '/login',
        templateUrl: BUNDLE.packagePath+'/partials/login.html',
        controller: 'LoginController',
        module: 'public'
      })
      .state('dataerror', {
      url: '/dataerror',
      templateUrl: BUNDLE.packagePath+'/assets/app/main/dataerror.tpl.html',
      controller: function() {}
    });

    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('AuthInterceptor');
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
