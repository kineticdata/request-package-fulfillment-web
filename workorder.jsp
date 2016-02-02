<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="bundle/initialization.jspf" %>
<bundle:layout page="layouts/form.jsp">
  <bundle:variable name="head">
    <title>${text.escape(form.name)}</title>
  </bundle:variable>
    <section class="page">
      <div class="errors"></div>
      <app:bodyContent/>
    </section>
</bundle:layout>
