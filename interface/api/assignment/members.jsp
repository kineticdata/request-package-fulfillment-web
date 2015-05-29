<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> members = new ArrayList<Map<String,Object>>();

if (request.getParameter("group") == null) {
    // If a group is not specified, throw a 400 BadRequest error
    results.put("message","Retrieving members failed. A group needs to be specified to retrieve members.");
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    response.getWriter().write(JsonUtils.toJsonString(results));
    return;
} else {
    String groupId = request.getParameter("group");
    
    // Making a bridge call to retrieve the members that are in the inputted
    // 'group' parameter. After the bridge call is completed, the bridge objects
    // are iterated through to build up the return JSON for each person in the
    // group.
    BridgeList<SupportMemberBridge> memberBridgeList = SupportMemberBridge.findByGroupId(context, customerRequest.getTemplateId(), groupId);
    for (SupportMemberBridge smb : memberBridgeList) {
        Map<String,Object> person = new LinkedHashMap<String,Object>();
        person.put("fullName",smb.getFullName());
        person.put("loginId",smb.getLoginID());
        person.put("firstName",smb.getFirstName());
        person.put("lastName",smb.getLastName());
        members.add(person);
    }
}

// Adding the count and members to the results. Limit and offset are both 
// hard-coded to 0 currently because they aren't implemented yet.
results.put("count",members.size());
results.put("limit",0);
results.put("offset",0);
results.put("members",members);

// Returning the results with a status code of 200 OK 
response.setStatus(HttpServletResponse.SC_OK);
response.getWriter().write(JsonUtils.toJsonString(results));
%>