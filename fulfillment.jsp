<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="bundle/initialization.jspf" %>

<bundle:layout page="${bundle.path}/layouts/layout.jsp">
    <bundle:variable name="head">
        <title>Kinetic Data ${kapp.name}</title>
    </bundle:variable>

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
  <script>
    window.BUNDLE = window.BUNDLE || {};
    BUNDLE.packagePath = "${bundle.location}";
    BUNDLE.config = {};
    BUNDLE.config.user = "${identity.username}";
    BUNDLE.config.spaceLocation = "${bundle.spaceLocation}";
  </script>

	<div ng-app="kineticdata.fulfillment" id="foo">
		<div class="container">
			<div ui-view="filters"></div>
			<div ui-view>
				<nav class="nav nav-pills">&nbsp;</nav>
				<div class="text-center no-data">
			    	<span class="fa fa-circle-o-notch fa-spin"></span>
			    	<h3>Loading</h3>
			  		<p>Please wait while we load the application.</p>
				</div>
			</div>
		</div>
	</div>

	<bundle:scriptpack>
		<bundle:script src="${bundle.path}/assets/js/angular/angular.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-flash/angular-flash.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-moment/angular-moment.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-animate/angular-animate.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-ui-bootstrap/ui-bootstrap.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-ui-bootstrap/ui-bootstrap-tpls.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-ui-bootstrap/pagination.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-ui-router/angular-ui-router.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-loading-bar/loading-bar.js" />
		<bundle:script src="${bundle.path}/assets/js/angular-truncate/truncate.js" />

		<bundle:script src="${bundle.path}/assets/js/ng-file-upload/ng-file-upload-shim.js" />
		<bundle:script src="${bundle.path}/assets/js/ng-file-upload/ng-file-upload.js" />
		<bundle:script src="${bundle.path}/assets/js/restangular/restangular.js" />
		<bundle:script src="${bundle.path}/assets/js/lodash/lodash.js" />
		<bundle:script src="${bundle.path}/assets/js/toastr/toastr.js" />

		<bundle:script src="${bundle.path}/assets/app/shared/directives/simple.paginator.directive.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/directives/rowhover.directive.js" />

		<!-- Services -->
		<bundle:script src="${bundle.path}/assets/app/shared/services/config.service.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/services/filters.service.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/services/auth.interceptor.factory.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/services/model.factory.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/services/assignments.service.js" />


		<!-- Models -->
		<bundle:script src="${bundle.path}/assets/app/shared/models/workorders.model.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/models/filters.model.js" />
		<bundle:script src="${bundle.path}/assets/app/shared/models/assignments.model.js" />

		<!-- Work Orders -->
		<bundle:script src="${bundle.path}/assets/app/main/main.controller.js" />
		<bundle:script src="${bundle.path}/assets/app/workorder/workorder.service.js" />
		<bundle:script src="${bundle.path}/assets/app/workorder/workorder.list.controller.js" />
		<bundle:script src="${bundle.path}/assets/app/workorder/workorder.detail.controller.js" />
		<bundle:script src="${bundle.path}/assets/app/workorder/workorder.assign.controller.js" />
		<bundle:script src="${bundle.path}/assets/app/workorder/workorder.frame.directive.js" />

		<bundle:script src="${bundle.path}/assets/app/app.js" />
	</bundle:scriptpack>




    <app:bodyContent/>
</bundle:layout>
