<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();

if (request.getParameter("group") == null) {
    // If a group is not specified, throw a 400 BadRequest error
    results.put("message","Retrieving members failed. A group needs to be specified to retrieve members.");
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    response.getWriter().write(JsonUtils.toJsonString(results));
    return;
} else {
    String groupId = request.getParameter("group");

    String[] memberIds = Assignment.findMemberIdsByGroup(context, groupId);
    List<Member> members = Assignment.findMembersByIds(context, memberIds);
    ArrayList<Map<String,Object>> memberObjs = new ArrayList<Map<String,Object>>();

    for (Member member : members) {
      memberObjs.add(member.toJsonObject());
    }

    results.put("count",memberObjs.size());
    results.put("limit",0);
    results.put("offset",0);
    results.put("members",memberObjs);
}

// Returning the results with a status code of 200 OK
response.setStatus(HttpServletResponse.SC_OK);
response.getWriter().write(JsonUtils.toJsonString(results));
%>
