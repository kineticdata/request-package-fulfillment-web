<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
results.put("url","http://example.com/asdf");

// Just returning a hard-coded url for the time-being.
response.setStatus(HttpServletResponse.SC_OK);
response.getWriter().write(JsonUtils.toJsonString(results));
%>