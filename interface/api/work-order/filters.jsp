<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> filterObjects = new ArrayList<Map<String,Object>>();

String contextualPackagePath = request.getServletContext().getRealPath("/") + bundle.relativePackagePath();

if (request.getMethod() == "GET") {
    Filter[] filters = Filter.getFilters(contextualPackagePath);
    for (Filter filter : filters) {
      // Retrieve the filters and then use that data to build to build up the filter
      // JSON objects.
      Map<String,Object> workOrder = new LinkedHashMap<String,Object>();
      workOrder.put("name",filter.getName());
      workOrder.put("qualification",filter.getQualification());
      workOrder.put("default",filter.isDefault());
      filterObjects.add(workOrder);
    }

    // Adding the count and filters to the results. Limit and offset are both
    // hard-coded to 0 currently because they aren't implemented yet.
    results.put("count",filterObjects.size());
    results.put("limit",0);
    results.put("offset",0);
    results.put("filters",filterObjects);


    // Returning the results with a status code of 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else if (request.getMethod() == "POST") {
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

    // Catch Errors that would happen before actually making the call to create
    if (!json.containsKey("name") || !json.containsKey("qualification")) {
      results.put("message","Creation of Filter failed. Cannot create a filter without having a 'name' and 'qualification'.");
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
    }

    String name = json.get("name").toString();
    String qualification = json.get("qualification").toString();

    Filter filter = null;
    try {
      filter = Filter.createFilter(contextualPackagePath,name,qualification);
    } catch (RuntimeException e) {
      results.put("message",e.getMessage());
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
    }

    if (filter != null) {
      results.put("name", filter.getName());
      results.put("qualification", filter.getQualification());
      results.put("default", filter.isDefault());
    }

    // Returning the results with a status code of 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else if (request.getMethod() == "DELETE") {
  String call = request.getParameter("call");

  // Using a regex to get the filter name. If a name can't be found in the
  // call path, return a 400 BadRequest with a message in results.
  String patternStr="/api/v1/work-orders/filters/([\\w\\s]*)/?";
  Pattern p = Pattern.compile(patternStr);
  Matcher m = p.matcher(call);

  String filterName = "";
  if (m.find()) {
      filterName = m.group(1);
  } else {
      results.put("message","Could not find the Filter name in the call path.");
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
  }

  try {
    Filter.deleteFilter(contextualPackagePath, filterName);
  } catch (RuntimeException e) {
    results.put("message",e.getMessage());
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    response.getWriter().write(JsonUtils.toJsonString(results));
    return;
  }
} else if (request.getMethod() == "PUT") {
  String call = request.getParameter("call");

  // Using a regex to get the filter name. If a name can't be found in the
  // call path, return a 400 BadRequest with a message in results.
  String patternStr="/api/v1/work-orders/filters/([\\w\\s]*)/?";
  Pattern p = Pattern.compile(patternStr);
  Matcher m = p.matcher(call);

  String filterName = "";
  if (m.find()) {
      filterName = m.group(1);
  } else {
      results.put("message","Could not find the Filter name in the call path.");
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
  }

  if (!request.getContentType().contains("application/json")) {
      response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
  }

  // Retrieve the JSON Body
  String body = IOUtils.toString(request.getReader());
  JSONObject json = (JSONObject)JSONValue.parse(body);
  if (json == null) {
      results.put("message","The input data is not recognized as properly formatted JSON");
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getWriter().write(JsonUtils.toJsonString(results));
      return;
  }

  // Get the name and qualification (if they exist)
  String updatedName = null;
  String qualification = null;
  if (json.containsKey("name")) { updatedName = json.get("name").toString(); }
  if (json.containsKey("qualification")) { qualification = json.get("qualification").toString(); }

  Filter filter = null;
  try {
    filter = Filter.modifyFilter(contextualPackagePath,filterName,updatedName,qualification);
  } catch (RuntimeException e) {
    results.put("message",e.getMessage());
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    response.getWriter().write(JsonUtils.toJsonString(results));
    return;
  }

  if (filter != null) {
    results.put("name", filter.getName());
    results.put("qualification", filter.getQualification());
    results.put("default", filter.isDefault());
  }

  // Returning the results with a status code of 200 OK
  response.setStatus(HttpServletResponse.SC_OK);
  response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
