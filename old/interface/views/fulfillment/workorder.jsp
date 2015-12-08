<%-- Include the package initialization file. --%>
<%@include file="../../../framework/includes/packageInitialization.jspf"%>
<%
    // Retrieve the main catalog object
    Catalog catalog = Catalog.findByName(context, customerRequest.getCatalogName());
    // Preload the catalog child objects (such as Categories, Templates, etc)
    catalog.preload(context);
%>
<%@include file="../../../framework/includes/serviceLanguageInitialization.jspf"%>
<%-- Include the bundle js config initialization. --%>
<%@include file="../../../../../core/interface/fragments/packageJsInitialization.jspf" %>
<%-- Include the application content. --%>
<%@include file="../../../../../core/interface/fragments/applicationHeadContent.jspf"%>
<%@include file="../../../../../core/interface/fragments/displayHeadContent.jspf"%>
<!-- Package Stylesheets -->
<link rel="stylesheet" href="<%= bundle.relativeBundlePath()%>packages/catalog/assets/css/displayPackage.css" type="text/css" />
<!-- Page Stylesheets -->
<link rel="stylesheet" href="<%= bundle.relativeBundlePath()%>packages/catalog/assets/css/display.css" type="text/css" />
<!-- Package Javascript -->
<script type="text/javascript" src="<%= bundle.relativeBundlePath()%>packages/catalog/assets/js/package.js"></script>
<!-- Page Javascript -->
<script type="text/javascript" src="<%= bundle.relativeBundlePath()%>packages/catalog/assets/js/display.js"></script>
<%-- Include the form content, including attached css/javascript files and custom header content --%>
<%@include file="../../../../../core/interface/fragments/formHeadContent.jspf"%>
<header class="container">
    <h2>
        <%= themeLocalizer.getString(customerRequest.getTemplateName()) %>
    </h2>
    <hr class="soften">
</header>
<section class="container display-page">
    <%@include file="../../../../../core/interface/fragments/displayBodyContent.jspf"%>
</section>
