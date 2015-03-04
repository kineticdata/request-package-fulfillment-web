<%-- Include the package initialization file. --%>
<%@include file="../../../framework/includes/packageInitialization.jspf"%>
<%
    // Retrieve the main catalog object
    Catalog catalog = Catalog.findByName(context, customerRequest.getCatalogName());
    // Preload the catalog child objects (such as Categories, Templates, etc)
    catalog.preload(context);
%>
<%-- Include the bundle js config initialization. --%>
<%@include file="../../../../../core/interface/fragments/packageJsInitialization.jspf" %>
<!-- Page Stylesheets -->
<link rel="stylesheet" href="<%= bundle.packagePath()%>assets/css/package.css" type="text/css" />
<%-- Include the application content. --%>
<%@include file="../../../../../core/interface/fragments/applicationHeadContent.jspf"%>
<%@include file="../../../../../core/interface/fragments/displayHeadContent.jspf"%>
<%-- Include the form content, including attached css/javascript files and custom header content --%>
<%@include file="../../../../../core/interface/fragments/formHeadContent.jspf"%>


<div ng-app="kineticdata.fulfillment">
  <div class="container">
    <div ng-controller="MainController">
      <ul class="nav nav-pills">

        <li role="presentation" ng-repeat="filter in filterCollection.all" ng-class="{active: isActiveFilter(filter)}">
          <a ui-sref="workorders({id: filter.name})" ng-bind="filter.name">&nbsp;</a>
        </li>
      </ul>
    </div>

    <!-- Subscribe to error flash messages. -->
    <div flash-alert="error" active-class="in alert" class="fade" duration="0">
      <strong class="alert-heading">Oh no!</strong>
      <span class="alert-message">{{flash.message}}</span>
    </div>

    <div ui-view></div>
  </div>
</div>



<script src="<%=bundle.packagePath()%>assets/js/angular/angular.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-flash/angular-flash.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-moment/angular-moment.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-bootstrap/ui-bootstrap.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-bootstrap/ui-bootstrap-tpls.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-router/angular-ui-router.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/lodash/lodash.js"></script>



<!--<script src="<%=bundle.packagePath()%>resources/js/services/workorders.service.js"></script>



<script src="<%=bundle.packagePath()%>resources/js/services/auth.service.js"></script>
<script src="<%=bundle.packagePath()%>resources/js/services/http.interceptor.factory.js"></script>

<script src="<%=bundle.packagePath()%>resources/js/controllers/workorder.controller.js"></script>

<script src="<%=bundle.packagePath()%>resources/js/controllers/login.controller.js"></script>
-->

<script src="<%=bundle.packagePath()%>assets/app/shared/directives/paginator.directive.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/paginateddataprovider.factory.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/config.service.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/filters.service.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/model.factory.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/models/workorders.model.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/models/filters.model.js"></script>

<script src="<%=bundle.packagePath()%>assets/app/main/main.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.service.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.list.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.detail.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.assign.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.frame.directive.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/app.js"></script>
