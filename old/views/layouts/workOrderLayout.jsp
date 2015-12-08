<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="../../package/initialization.jspf" %>
<bundle:layout>

    <bundle:variable name="head">
        <bundle:yield name="head"/>
    </bundle:variable>

    <div class="">
        <bundle:yield/>
    </div>
</bundle:layout>
