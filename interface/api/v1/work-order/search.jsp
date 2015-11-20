<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
String contextualPackagePath = request.getServletContext().getRealPath("/") + bundle.relativePackagePath();

if (request.getMethod() == "GET") {
    String query = request.getParameter("query");
    if (query == "" || query == null) {
        // Throws a 422 Unprocessable Entity
        results.put("message", "Search failed. Cannot complete search with an empty query.");
        response.setStatus(422);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }
    
    // Start by first building up the KSR depending on what was passed. If the
    // query cannot be a valid KSR, String ksr will be left null.
    String ksr = null;
    if (query.matches("^\\d{1,12}$")) {
        int zerosNeeded = 12-query.length();
        ksr = "KSR" + StringUtils.repeat("0",zerosNeeded) + query;
    } else if (query.matches("^KSR\\d{1,11}$")) {
        // ksrNumbers strips the "KSR" off the front of the inputted KSR id
        // which allows to make sure that the proper number of digits are
        // included when rebuilding it
        String ksrNumbers = query.replace("KSR","");
        int zerosNeeded = 12-ksrNumbers.length();
        ksr = "KSR" + StringUtils.repeat("0",zerosNeeded) + ksrNumbers;
    } else if (query.matches("^KSR\\d{12}$")) {
        // If the query is 15 characters long and starts with the string KSR,
        // a valid KSR Id was passed
        ksr = query;
    }
    
    // Build Remedy Qualification based off of the input query
    StringBuilder qualification = new StringBuilder();
    qualification.append(Filter.getDefaultFilter(context, contextualPackagePath).getQualification());
    qualification.append(" AND ");
    if (ksr != null) {
        // If the input query was able to be translated to a valid KSR, add a
        // check for that to the qualification
        qualification.append(String.format("'%s'=\"%s\"", WorkOrder.FLD_REQUEST_ID, ksr));
        qualification.append(" OR ");
    }
    qualification.append("('").append(WorkOrder.FLD_WORK_ORDER).append("'");
    qualification.append(" LIKE \"%").append(query).append("%\" ");
    qualification.append("OR");
    qualification.append("'").append(WorkOrder.FLD_ASSIGNEE_ID).append("'");
    qualification.append(" LIKE \"%").append(query).append("%\")");
    
    System.out.println(qualification.toString());
    
    // Pass the qualification and the inputted parameters onto work-orders.jsp, so that the
    // pagination, ordering, and retrieval can be handled there to keep work order retrieval
    // consistent
    request.setAttribute("qualification", qualification.toString());
    RequestDispatcher dispatcher = request.getRequestDispatcher("work-orders.jsp");
    dispatcher.forward(request, response);
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
