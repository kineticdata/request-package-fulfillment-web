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

    // Retrieve the member ids which are then used to return member objects
    String[] memberIds = Assignment.findMemberIdsByGroup(context, groupId);
    List<Member> members = Assignment.findMembersByIds(context, memberIds);

    // Implement sorting on the member list
    String errorMessage = null;
    String sortField = "firstname";
    String sortDirection = "asc";
    if (request.getParameter("order") != null) {
        String[] orderParts = request.getParameter("order").trim().split(" ");
        sortField = orderParts[0];
        sortDirection = orderParts.length == 1 ? "asc" : orderParts[1].toLowerCase();
        if (orderParts.length > 2 || request.getParameter("order").contains(",")) {
            errorMessage = "Invalid Order: Order parameter must be in the form of 'fieldName orderDirection' and can only sort by a single field.";
        } else if (!(sortDirection.equals("asc") || sortDirection.equals("desc"))) {
            errorMessage = "Invalid Order: '"+sortDirection+"' is not a valid order direction"; 
        } else if (members.get(0).get(sortField) == null) {
            errorMessage = "Invalid Order: '"+sortField+"' is not a valid order field";
        }
    }

    if (errorMessage != null) {
        results.put("message",errorMessage);
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Sort the members based on the ASC sort field
    final String finalSortField = sortField;
    if (sortDirection.equals("asc")) {
        Collections.sort(members, new Comparator<Member>() {
            public int compare(Member m1, Member m2) {
                return m1.get(finalSortField).compareTo(m2.get(finalSortField));
            }
        });
    } else { // Sort the members based on the DESC sort field
        Collections.sort(members, new Comparator<Member>() {
            public int compare(Member m1, Member m2) {
                return m2.get(finalSortField).compareTo(m1.get(finalSortField));
            }
        });
    }

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
