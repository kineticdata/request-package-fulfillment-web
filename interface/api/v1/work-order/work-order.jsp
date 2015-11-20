<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
String contextualPackagePath = request.getServletContext().getRealPath("/") + bundle.relativePackagePath();

if (request.getMethod() == "GET") {
    // Using a regex to get the work order id. If an id can't be found in the
    // call path, return a 400 BadRequest with a message in results.
    String patternStr="/api/v1/work-orders/(\\w*)/?";
    Pattern p = Pattern.compile(patternStr);
    Matcher m = p.matcher(request.getParameter("call"));

    String id = "";
    if (m.find()) {
        id = m.group(1);
    } else {
        results.put("message","Could not find the Work Order Id in the call path.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Creating a Time Zone Free copy of the Context so that time stamps 
    // are all returned in UTC.
    HelperContext tzFreeContext = context.getCopy();
    tzFreeContext.setTimezoneOffset(0);

    // Using the previously obtained work order id to retrieve the work order object
    WorkOrder workOrder = WorkOrder.findSingleById(tzFreeContext, id);
    if (workOrder != null) {
        results = workOrder.toJsonObject(request,contextualPackagePath);
    } else {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        results.put("message","A Work Order with the id of '" + id + "' was not found.");
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Returning the results with a 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
