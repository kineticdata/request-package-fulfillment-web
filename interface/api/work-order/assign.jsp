<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();

if (request.getMethod() == "POST") {
    // Read the call parameter in do get the work order id from the path
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

    String previousGroups = workOrder.getAssignedGroups();
    String previousMember = workOrder.getAssigneeId();

    String groups = null;
    String member = null;
    if (request.getAttribute("Group") != null || request.getAttribute("Member") != null) {
        // If attributes have been passed, the call is coming from assign-me, so
        // assign that incoming data to the groups and member variables that will
        // be used for the assignment
        if (request.getAttribute("Group") != null) { groups = request.getAttribute("Group").toString(); }
        if (request.getAttribute("Member") != null) { member = request.getAttribute("Member").toString(); }
    } else {
        // If attributes aren't passed, read in the groups and member names
        // from the JSON payload and assign them to their respective variables
        if (!request.getContentType().contains("application/json")) {
            response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }

        String body = IOUtils.toString(request.getReader());
        JSONObject json = (JSONObject)JSONValue.parse(body);
        if (json == null) {
            results.put("message","The input data is not recognized as properly formatted JSON");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }

        if (json.containsKey("group")) { groups = json.get("group").toString(); }
        if (json.containsKey("member")) { member = json.get("member").toString(); }
    }

    // If a member is included in the input, make sure that the member exists in
    // the final group passed.
    if (member != null) {
        if (groups == null) {
            results.put("message","Assignment of Work Order failed. Cannot assign a member without an associated Group.");
        } else {
            // Check to see if the member is in groups
            if (!Assignment.isMemberInGroup(context, member, groups)) {
              results.put("message",String.format("Assignment of Work Order failed. Member '%s' does not exist within the Group '%s'.",member,groups));
            }
        }
    } else {
      // Check to see if the group exists
      if (!Assignment.doesGroupExist(context, groups)) {
          results.put("message", "Assignment of Work Order Failed. The Group '" + groups + "' does not exist.");
      }
    }

    // If there was an error when attempting to assign, it creates a message in
    // the results. If a message is present, return the results and and 400 BadRequest.
    if (results.containsKey("message")) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Assign the member and groups to the work order and then log it
    String memberName = "";
    if (member != null) {
      memberName = Assignment.getPersonName(context, member);
    }

    workOrder.saveGroup(context, groups);
    workOrder.saveMember(context, member, memberName);

    // Do the logging here

    // Finally, return the changed work order object
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(workOrder.toJsonObject(request)));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
