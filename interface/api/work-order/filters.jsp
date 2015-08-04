<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> workOrderFilters = new ArrayList<Map<String,Object>>();

if (request.getMethod() == "GET") {
    // Retrieve the filters and then use that data to build to build up the filter
    // JSON objects.
    for (WorkOrderFilter filter : WorkOrderFilter.getAllFilters(context, bundle.getProperty("catalogName"))) {
        Map<String,Object> workOrder = new LinkedHashMap<String,Object>();
        workOrder.put("name",filter.getName());
        workOrder.put("qualification",filter.getQualification());
        workOrder.put("default",filter.isDefault());
        workOrderFilters.add(workOrder);
    }

    // Adding the count and filters to the results. Limit and offset are both 
    // hard-coded to 0 currently because they aren't implemented yet.
    results.put("count",workOrderFilters.size());
    results.put("limit",0);
    results.put("offset",0);
    results.put("filters",workOrderFilters);

    // Returning the results with a status code of 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
