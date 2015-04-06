<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@include file="../../framework/includes/packageInitialization.jspf"%>
<%
// Load all of the package's JSON configurations
Configurator configuration = new Configurator(bundle);
configuration.processView(request, response);
%>
<!DOCTYPE html>
<html>
    <head>
        <%-- Include the common content. --%>
        <%@include file="../../../../common/interface/fragments/head.jspf"%>
    </head>
    <body>
        <div class="">
            <%@include file="../../../../common/interface/fragments/navigationSlide.jspf"%>
            <div class="content-slide" data-target="div.navigation-slide">
                <div class="pointer-events">
                    <jsp:include page="${content}" />
                </div>
            </div>
        </div>
    </body>
</html>