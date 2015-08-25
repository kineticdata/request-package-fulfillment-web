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
  'ngFileUpload',
  'truncate',

  // // Models.
  'kineticdata.fulfillment.models.workorder',
  'kineticdata.fulfillment.models.filter',
  'kineticdata.fulfillment.models.assignments',

  // // Directives
  'kineticdata.fulfillment.directives.simplepaginator',
  'kineticdata.fulfillment.directives.workframe',
  'kineticdata.fulfillment.directives.rowhover',

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

    // Set the base URL for the API.
    RestangularProvider.setBaseUrl(ConfigServiceProvider.getBaseUrl());

    // Intercept any outgoing requests to the API and fix the request for pagination.
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

    // Intercept the response and determine if false-successes are actually HTML failures. If we get back a REST
    // response that's a 200 but whose content-type starts with text/html then we're going to assume that it is
    // an error page from Request and reject the response.
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var contentType = response.headers('content-type');
      if(contentType.indexOf('text/html') === 0) {
        deferred.reject(data);
      }

      return data;
    });

    cfpLoadingBarProvider.includeSpinner = false;

    $urlRouterProvider.otherwise('/workorder/default');
    $stateProvider
      .state('app', {
        abstract: true,
        resolve: {
          filters: function(FiltersService) {
            return FiltersService.api().getList();
          }
        },

        views: {
          '': {
            template: '<div ui-view></div>'
          },
          'filters': {
            templateUrl: BUNDLE.packagePath+'assets/app/main/main.tpl.html',
            controller: 'MainController'
          }
        }
      })
      .state('workorders', {
        parent: 'app',
        url: '/workorder/{id}',
        params: {
          // Search terms.
          terms: '',
          // Work Order List Page
          fp: 1,
          // Work Order List Sort Direction
          fsd: 'DESC',
          // Work Order List Sort By
          fsb: 'id',

          // Filter By ID
          fbId: '',
          // Filter By Status
          fbStatus: '',
          // Filter By Work Order Name
          fbWOName: '',

          reload: 0

        },
        views: {
          '': {
            templateUrl: BUNDLE.packagePath+'assets/app/workorder/workorder.list.html',
            controller: 'WorkOrderListController',

            resolve: {
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
              filterState: function($stateParams) {
                var filterState = {
                  id: $stateParams.fbId,
                  status: $stateParams.fbStatus,
                  workOrderName: $stateParams.fbWOName
                }

                return filterState;
              },
              listParams: function($stateParams, currentFilter, filterState) {
                var WORK_ORDER_LIMIT = 5;
                var page = parseInt($stateParams.fp) || 1;


                var listParams = {
                  filter: currentFilter.name,
                  order: $stateParams.fsb + ' ' + $stateParams.fsd,
                  limit: WORK_ORDER_LIMIT,
                  offset: (page-1)*WORK_ORDER_LIMIT
                };

                // Using the Filter State resolution, build the query params up.
                if(!_.isEmpty(filterState.id)) {
                  listParams['field[id]'] = filterState.id;
                }

                if(!_.isEmpty(filterState.status)) {
                  listParams['field[status]'] = filterState.status;
                }

                if(!_.isEmpty(filterState.workOrderName)) {
                  listParams['field[workOrder]'] = filterState.workOrderName;
                }


                if(typeof $stateParams.terms !== 'undefined') {
                  listParams.query = $stateParams.terms
                }

                return listParams;
              },
              workOrders: function(WorkOrdersService, currentFilter, listParams) {
                if(!_.isEmpty(currentFilter.terms)) {
                  var params = angular.copy(listParams);
                  delete params.filter;
                  return WorkOrdersService.Search().getList(params);
                } else {
                  return WorkOrdersService.WorkOrders(true).getList(listParams);
                }
              }
            }
          }
        },

        module: 'private'
      })
      .state('workorders.detail', {
        url: '/:workOrderId',
        params: {
          // Work Order Notes Page
          np: 1,
          // Work Order Logs Page
          lp: 1,
          // Active Tab, can be driven via Query Parameter.
          tab: 'summary'
        },
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
              },
              notesParams: function($stateParams) {
                var NOTE_LIMIT = 5;
                var page = parseInt($stateParams.np) || 1;

                return {
                  limit: NOTE_LIMIT,
                  offset: (page-1)*NOTE_LIMIT
                }
              },
              workOrderNotes: function(WorkOrdersService, workOrderId, notesParams) {
                return WorkOrdersService.Notes(workOrderId).getList(notesParams);
              },
              logsParams: function($stateParams) {
                var LOG_LIMIT = 5;
                var page = parseInt($stateParams.lp) || 1;

                return {
                  limit: LOG_LIMIT,
                  offset: (page-1)*LOG_LIMIT
                }
              },
              workOrderLogs: function(WorkOrdersService, workOrderId, logsParams) {
                return WorkOrdersService.Logs(workOrderId).getList(logsParams);
              },
              relatedWorkOrders: function(WorkOrdersService, workOrderId, workOrder, $q) {
                var deferred = $q.defer();

                // Fetch the related work orders and filter out our active work order so that it does not appear in the
                // list of related work orders.
                WorkOrdersService.Related(workOrderId).getList().then(
                  function(workOrders) {
                    _.remove(workOrders, function(wo) {
                      return wo.id === workOrder.id;
                    });
                    deferred.resolve(workOrders);
                  },
                  function() {
                    deferred.reject();
                  });

                return deferred.promise;
              },
              latestNote: function(WorkOrdersService, workOrderId) {
                return WorkOrdersService.Notes(workOrderId).getList({order: 'created DESC', limit: 1, offset: 0});
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
  }]).run(['$rootScope', '$state', function($rootScope, $state) {

    // Capture state change errors. This will be triggered whenever one of the state resolutions fails. This shouldn't
    // normally happen with a functioning API or legit data but will always happen if something 'off' happens on the
    // the Request side. In the event of a failed state change we're going to assume that it is error related and
    // forward the user to the data error page.
    $rootScope.$on('$stateChangeError', function(event, to, toParams, from, fromParams, error) {
      event.preventDefault();
      $state.go('dataerror')
    });
  }]);
