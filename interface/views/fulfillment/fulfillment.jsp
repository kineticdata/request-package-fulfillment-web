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
<link rel="stylesheet" href="<%= bundle.packagePath()%>assets/js/angular-loading-bar/loading-bar.css" type="text/css" />
<link rel="stylesheet" href="<%= bundle.packagePath()%>assets/js/toastr/toastr.css" type="text/css" />
<%-- Include the application content. --%>
<%@include file="../../../../../core/interface/fragments/applicationHeadContent.jspf"%>
<%@include file="../../../../../core/interface/fragments/displayHeadContent.jspf"%>
<%-- Include the form content, including attached css/javascript files and custom header content --%>
<%@include file="../../../../../core/interface/fragments/formHeadContent.jspf"%>

<!-- Override the loading bar. -->
<style>
  #loading-bar .bar {
    height: 5px;
    top: 0px;
  }
  #loading-bar .peg {
    height: 5px;
  }
</style>


<div ng-app="kineticdata.fulfillment" id="foo">
  <div class="container">
    <div ui-view="filters"></div>
    <div ui-view>
      <nav class="nav nav-pills">&nbsp;</nav>
      <div class="text-center no-data">
        <span class="fa fa-circle-o-notch fa-spin"></span>
        <h3>Loading</h3>

      <p>Please wait while we load the application.</p>
</div></div>
  </div>
</div>


<script src="<%=bundle.packagePath()%>assets/js/angular/angular.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-flash/angular-flash.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-moment/angular-moment.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-animate/angular-animate.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-bootstrap/ui-bootstrap.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-bootstrap/ui-bootstrap-tpls.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-bootstrap/pagination.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-ui-router/angular-ui-router.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-loading-bar/loading-bar.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/angular-truncate/truncate.js"></script>

<script src="<%=bundle.packagePath()%>assets/js/ng-file-upload/ng-file-upload-shim.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/ng-file-upload/ng-file-upload.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/restangular/restangular.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/lodash/lodash.js"></script>
<script src="<%=bundle.packagePath()%>assets/js/toastr/toastr.js"></script>

<script src="<%=bundle.packagePath()%>assets/app/shared/directives/simple.paginator.directive.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/directives/rowhover.directive.js"></script>

<!-- Services -->
<script src="<%=bundle.packagePath()%>assets/app/shared/services/config.service.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/filters.service.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/auth.interceptor.factory.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/model.factory.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/services/assignments.service.js"></script>


<!-- Models -->
<script src="<%=bundle.packagePath()%>assets/app/shared/models/workorders.model.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/models/filters.model.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/shared/models/assignments.model.js"></script>

<!-- Work Orders -->
<script src="<%=bundle.packagePath()%>assets/app/main/main.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.service.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.list.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.detail.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.assign.controller.js"></script>
<script src="<%=bundle.packagePath()%>assets/app/workorder/workorder.frame.directive.js"></script>

<script src="<%=bundle.packagePath()%>assets/app/app.js"></script>
