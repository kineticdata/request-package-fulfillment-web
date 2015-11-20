<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="package/initialization.jspf" %>
<bundle:layout page="views/layouts/workOrderLayout.jsp">
    <bundle:scriptpack>
        <bundle:script src="${bundle.packagePath}/assets/js/workOrder.js" />
    </bundle:scriptpack>
    <bundle:stylepack>
        <bundle:style src="${bundle.packagePath}/assets/css/workOrder.css "/>
    </bundle:stylepack>
    <bundle:variable name="head">
        <title>${app:escape(form.name)}</title>
    </bundle:variable>
    <section class="page container">
        <header class="page-header">
            <h2>${app:escape(form.name)}</h2>
        </header>
        <div class="errors"></div>
        <app:bodyContent/>
    </section>
</bundle:layout>