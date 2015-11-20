<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();

if (request.getMethod() == "POST") {
    String call = request.getParameter("call");

    // Using a regex to get the work order id, and then using that id to
    // retrieve the work order object. If a work order object can't be found
    // with the inputted id, return the results with a 400 BadRequest
    String workOrderId;
    WorkOrder workOrder;

    String patternStr="/api/v1/work-orders/(\\w*)/assign/?";
    Pattern p = Pattern.compile(patternStr);
    Matcher m = p.matcher(call);

    if (m.find()) {
        workOrderId = m.group(1);
        workOrder = WorkOrder.findSingleById(context, workOrderId);
    } else {
        results.put("message","Assignment of Work Order failed. Could not find the Work Order Id in the call path.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    String group = workOrder.getAssignedGroups();
    String member;

    String loggedInUser = context.getUserName();

    // Check if the user is in the current group that has been assigned
    if (!Assignment.isMemberInGroup(context, loggedInUser, group)) {
      results.put("message","Work Order assignment failed. Cannot automatically assign to current user if they are not assigned to a Group.");
    }

    // If the user is assigned to exactly 1 group, then you can automatically assign it to them
    if (!Assignment.isMemberInGroup(context, loggedInUser, group)) {
      System.out.println(loggedInUser);
      String memberId = Assignment.getPersonId(context, loggedInUser);
      System.out.println(memberId);
      List<Group> groupList = Assignment.findGroupsByPersonId(context, memberId);
      System.out.println(groupList);
      if (groupList.size() == 0) {
        results.put("message","Work Order assignment failed. Cannot automatically assign to current user if they are not assigned to a Group.");
      } else if (groupList.size() > 1) {
        results.put("message","Work Order assignment failed. Cannot automatically assign to current user if they are assigned to more than 1 Group.");
      } else {
        group = groupList.get(0).getName();
      }
    }

    if (results.containsKey("message")) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    request.setAttribute("Group",group);
    request.setAttribute("Member",loggedInUser);

    RequestDispatcher dispatcher = request.getRequestDispatcher("assign.jsp");
    dispatcher.forward(request, response);
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
