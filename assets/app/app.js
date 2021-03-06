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
  // Angular
  'ngAnimate',

  // Third Party Dependencies.
  'ui.router',
  'angularMoment',
  'angular-flash.service',
  'angular-flash.flash-alert-directive',
  'angular-loading-bar',
  'ui.bootstrap',
  'restangular',

  // // Models.
  'kineticdata.fulfillment.models.workorder',
  'kineticdata.fulfillment.models.filter',
  'kineticdata.fulfillment.models.assignments',

  // // Directives
  'kineticdata.fulfillment.directives.simplepaginator',
  'kineticdata.fulfillment.directives.workframe',
  'kineticdata.fulfillment.directives.rowhover',
  'kineticdata.fulfillment.directives.worktab',

  // Controllers
  'kineticdata.fulfillment.controllers.main',
  'kineticdata.fulfillment.controllers.workorderlist',
  'kineticdata.fulfillment.controllers.workorderdetail',
  'kineticdata.fulfillment.controllers.workorderassign',

  // Services
  'kineticdata.fulfillment.interceptors.auth',
  'kineticdata.fulfillment.services.assignments'
]);

angular.module('kineticdata.fulfillment').config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'cfpLoadingBarProvider', 'RestangularProvider', 'ConfigServiceProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider, cfpLoadingBarProvider, RestangularProvider, ConfigServiceProvider) {
    'use strict';

    RestangularProvider.setBaseUrl(ConfigServiceProvider.getBaseUrl());
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
      if(typeof params.refresh !== 'undefined' && params.refresh === true) {
        delete params.refresh;
      }

      if(operation === 'getList') {
        if(typeof params !== 'string') {
          if(typeof params.limit === 'undefined') {
            params.limit = 5;
          }
          if(typeof params.offset === 'undefined') {
            params.offset = 0;
          }
        }
      }

      return {
        element: element,
        headers: headers,
        params: params,
        httpConfig: httpConfig
      };
    });

    cfpLoadingBarProvider.includeSpinner = false;

    $urlRouterProvider.otherwise('/workorder/default');
    $stateProvider
      .state('workorders', {
        url: '/workorder/{id}?{terms}',
        views: {
          '@': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.list.html',
            controller: 'WorkOrderListController',
            resolve: {
              filters: function(FiltersService) {
                return FiltersService.api().getList();
              },
              currentFilter: function(filters, $stateParams) {
                if(typeof $stateParams.id === 'undefined') {
                  return filters.getDefault();
                } else if($stateParams.id === 'default') {
                  return filters.getDefault();
                } else if($stateParams.id === 'search') {
                  return { name: 'Search Results', terms: ($stateParams.terms===undefined ? ' ' : $stateParams.terms) };
                } else {
                  return filters.getFilter($stateParams.id);
                }
              },
              defaultSorting: function() {
                return {
                  direction: false,
                  sortBy: 'id'
                }
              },
              defaultListParams: function(defaultSorting, currentFilter) {
                var direction = (defaultSorting.direction ? 'ASC' : 'DESC');
                var order = defaultSorting.sortBy + ' ' + direction;
                var listParams = {
                  filter: currentFilter.name,
                  order: order
                };

                if(typeof currentFilter.terms !== 'undefined') {
                  listParams.query = currentFilter.terms
                }

                return listParams;
              },
              workOrders: function(WorkOrdersService, currentFilter, defaultListParams) {
                if(typeof currentFilter.terms !== 'undefined') {
                  // When searching we
                  var params = angular.copy(defaultListParams);
                  delete params.filter;
                  return WorkOrdersService.Search().getList(params);
                } else {
                  return WorkOrdersService.WorkOrders(true).getList(defaultListParams);
                }
              }
            }
          },
          'filters@': {
            templateUrl: BUNDLE.packagePath+'assets/app/main/main.tpl.html',
            controller: 'MainController',
            resolve: {
              filters: function(FiltersService) {
                return FiltersService.api().getList();
              }
            }
          }
        },

        module: 'private'
      })
      .state('workorders.detail', {
        url: '/:workOrderId',
        views: {
          '': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.detail.html',
            controller: 'WorkOrderDetailController',
            resolve: {
              workOrderId: function($stateParams) {
                return $stateParams.workOrderId;
              },
              workOrder: function(WorkOrdersService, workOrderId) {
                return WorkOrdersService.WorkOrder(workOrderId).get();
              }
            }
          },
          'filters@': {
            templateUrl: BUNDLE.packagePath+'assets/app/main/main.tpl.html',
            controller: 'MainController',
            resolve: {
              filters: function(FiltersService) {
                return FiltersService.api().getList();
              }
            }
          }
        },

        module: 'private'
      })
      .state('workorders.assign', {
        url: '/:workOrderId/assign',
        views: {
          '': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.assign.html',
            controller: 'WorkOrderAssignController',
            resolve: {
              workOrderId: function($stateParams) {
                return $stateParams.workOrderId;
              },
              workOrder: function(WorkOrdersService, workOrderId) {
                return WorkOrdersService.WorkOrder(workOrderId).get();
              }
            }
          },
          'filters@': {
            templateUrl: BUNDLE.packagePath+'assets/app/main/main.tpl.html',
            controller: 'MainController',
            resolve: {
              filters: function(FiltersService) {
                return FiltersService.api().getList();
              }
            }
          }
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
  }]);
