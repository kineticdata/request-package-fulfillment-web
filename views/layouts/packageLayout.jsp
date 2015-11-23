<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="../../package/initialization.jspf" %>
<bundle:layout>

    <bundle:variable name="head">

        <bundle:stylepack>
            <bundle:style src="${bundle.packagePath}/libraries/bootstrap/bootstrap.min.css "/>
            <bundle:style src="${bundle.packagePath}/assets/css/package.css "/>
            <bundle:style src="${bundle.packagePath}/assets/js/angular-loading-bar/loading-bar.css"/>
            <bundle:style src="${bundle.packagePath}/assets/js/toastr/toastr.css "/>
        </bundle:stylepack>

        <link href="${bundle.packageLocation}/libraries/font-awesome/css/font-awesome.css" rel="stylesheet">

        <bundle:scriptpack>
            <bundle:script src="${bundle.packagePath}/libraries/jquery-datatables/jquery.dataTables.js" />
            <bundle:script src="${bundle.packagePath}/libraries/bootstrap/bootstrap.min.js" />
        </bundle:scriptpack>

        <bundle:yield name="head"/>

    </bundle:variable>

    <div class="">
        <c:import url="${bundle.packagePath}/views/partials/shared/navbar.jsp" charEncoding="UTF-8"/>

        <bundle:yield/>

    </div>

    <c:import url="${bundle.packagePath}/views/partials/shared/footer.jsp" charEncoding="UTF-8"/>

</bundle:layout>
