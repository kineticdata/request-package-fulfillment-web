<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
List<Map<String,Object>> items = new ArrayList<Map<String,Object>>();

// Retrieve the parent group that was passed
List<Group> groups;
if (request.getParameter("loginId") != null) {
  String loginId = request.getParameter("loginId");
  String personId = Assignment.getPersonId(context, loginId);

  if (personId != null) {
    groups = Assignment.findGroupsByPersonId(context, personId);

    // Build a string array of group names
    String[] groupIds = new String[groups.size()];
    for (int i = 0; i < groups.size(); i++) {
      groupIds[i] = groups.get(i).getName();
    }

    List<String> groupNames = Assignment.findGroupNamesByIds(context, groupIds);

    for (String name : groupNames) {
      Map<String,Object> item = new LinkedHashMap<String,Object>();
      item.put("name", name);
      items.add(item);
    }

  } else {
    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    results.put("message", "Invalid Login Id: Could not find a User matching the id '" + loginId + "'");
    response.getWriter().write(JsonUtils.toJsonString(results));
    return;
  }
} else {
  String parent = request.getParameter("parent");
  groups = Assignment.findGroupsByParent(context, parent);

  for (Group group : groups) {
    Map<String,Object> item = new LinkedHashMap<String,Object>();
    String[] groupNames = group.getName().split("::");
    item.put("name", groupNames[groupNames.length-1]);
    item.put("childrenCount", group.getChildrenCount());
    items.add(item);
  }

  if (items.size() == 0) {
    if (!Assignment.doesGroupExist(context, parent)) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      results.put("message", "Invalid Group: Could not find the Group '" + parent + "'");
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
    }
  }
}

response.setStatus(HttpServletResponse.SC_OK);
response.getWriter().write(JsonUtils.toJsonString(items));
%>
