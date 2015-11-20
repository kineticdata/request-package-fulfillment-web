<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
//ArrayList<Map<String,Object>> workOrders = new ArrayList<Map<String,Object>>();

if (request.getMethod() == "GET") {
    String query = request.getParameter("query");
    String call = request.getParameter("call");

    // Using a regex to get the work order id. If an id can't be found in the
    // call path, return a 400 BadRequest with a message in results.
    String patternStr="/api/v1/work-orders/(\\w*)/related/?";
    Pattern p = Pattern.compile(patternStr);
    Matcher m = p.matcher(call);

    String workOrderId = "";
    if (m.find()) {
        workOrderId = m.group(1);
    } else {
        results.put("message","Could not find the Work Order Id in the call path.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    WorkOrder workOrder = WorkOrder.findSingleById(context, workOrderId);

    if (workOrder == null) {
        results.put("message","Could not find a Work Order corresponding to the id '" + workOrderId + "'.");
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    String originatingId = workOrder.getOriginatingId();

    // Build Remedy Qualification to find other Work Orders with the same id
    String qualification = "'" + WorkOrder.FLD_ORIGINATING_ID + "'=\"" + originatingId + "\" AND ";
    qualification += "'" + WorkOrder.FLD_SUBMIT_TYPE + "'=\"workOrder\" AND ";
    qualification += "'" + WorkOrder.FLD_REQUEST_ID + "'!=\"" + workOrderId + "\"";
    
    // Pass the qualification and the inputted parameters onto work-orders.jsp, so that the
    // pagination, ordering, and retrieval can be handled there to keep work order retrieval
    // consistent
    request.setAttribute("qualification", qualification);
    RequestDispatcher dispatcher = request.getRequestDispatcher("work-orders.jsp");
    dispatcher.forward(request, response);
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>