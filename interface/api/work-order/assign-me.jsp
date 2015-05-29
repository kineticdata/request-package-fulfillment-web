<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
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
    
    // Getting the company and organization from the work order object, because
    // they will be needed to check if the user's group is within the valid
    // group hierarchy. Company and organization are required to be already set
    // for the assign/me call to work, because if the Company, Organization, and
    // Group are all stored in separate forms, there is no way to get the 
    // Company and Organization, when starting with just the current logged in
    // users id. 
    String company = workOrder.getCompany();
    String organization = workOrder.getOrganization();
    String groupId = workOrder.getGroupID();
    
    if (company == "" || organization == "") {
        results.put("message","Work Order assignment failed. Cannot automatically assign to current user if the Work Order is not already assigned to a Company and an Organization.");
    } else {
        // After making a call to the bridge list, some error checking is done
        // based on the size of the list. The user can only be automatically
        // assigned to a work order if they are a part of just one group or if
        // they are in the group that is currently assigned
        BridgeList<SupportMemberBridge> memberBridgeList = SupportMemberBridge.findMembersById(context, customerRequest.getTemplateId(), context.getUserName());
        Boolean userInCurrentGroup = false;
        for (SupportMemberBridge smb : memberBridgeList) {
            if (groupId.equals(smb.getGroupId())) {
                userInCurrentGroup = true;
                break;
            }
        }
        
        System.out.println("User In Current Group: " + userInCurrentGroup);
        System.out.println("Member Bridge List Size: " + memberBridgeList.size());
        if (!userInCurrentGroup) {
             if (memberBridgeList.size() == 0) {
                results.put("message","Work Order assignment failed. Cannot automatically assign to current user if they are not assigned to a Group.");
            } else if (memberBridgeList.size() > 1) {
                List<String> groupList = new ArrayList<String>();
                for (SupportMemberBridge smb : memberBridgeList) {
                    groupList.add(smb.getGroupId());
                }
                
                results.put("message","Work Order assignment failed. Cannot automatically assign to current user if they are assigned to more than 1 Group.");
            } else { // If the the size == 1, set the groupId
                groupId = memberBridgeList.get(0).getGroupId();
            }
        }
    }
        
    if (results.containsKey("message")) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }
    
    // Once a userId, groupId, organization and company have been found, pass along to the assign.jsp,
    // which will handle the rest of the error checking as well as the actual assignment
    request.setAttribute("Company",company);
    request.setAttribute("Organization",organization);
    request.setAttribute("Group",groupId);
    request.setAttribute("Member",context.getUserName());
    
    RequestDispatcher dispatcher = request.getRequestDispatcher("assign.jsp");
    dispatcher.forward(request, response);
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
