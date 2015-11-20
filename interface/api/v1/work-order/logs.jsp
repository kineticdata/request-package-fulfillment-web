<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();

if (request.getMethod() == "GET") {
    // Using a regex to get the work order id. If an id can't be found in the
    // call path, return a 400 BadRequest with a message in results.
    String patternStr="/api/v1/work-orders/(\\w*)/logs/?";
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

    // Create a Time Zone Free copy of the context to the used to return the time
    // stamps in UTC. Also gets limit and offset integer values based on the 
    // request parameters that were passed. Currently sorting on Create Date ASC.
    HelperContext tzFreeContext = context.getCopy();
    tzFreeContext.setTimezoneOffset(0);

    int limit = request.getParameter("limit") == null ? 0 : Integer.parseInt(request.getParameter("limit"));
    int offset = request.getParameter("offset") == null ? 0 : Integer.parseInt(request.getParameter("offset"));

    ArrayList<Map<String,Object>> logList = new ArrayList<Map<String,Object>>();

    Log[] logs = Log.find(tzFreeContext,id,new String[] {Log.FLD_CREATED_DATE},limit,offset,1);
    int count = Log.count(context, id);

    for (Log log : logs) {        
        logList.add(log.toJsonObject());
    }

    // Adding the count, limit, offest and logs to the results.
    results.put("count", count);
    results.put("limit",limit);
    results.put("offset",offset);
    results.put("logs",logList);

    // Returning the results with a status code of 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
