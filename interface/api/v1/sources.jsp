<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> sourceObjects = new ArrayList<Map<String,Object>>();

String contextualPackagePath = request.getServletContext().getRealPath("/") + bundle.relativePackagePath();

if (request.getMethod() == "GET") {
    Source[] sources = Source.getSources(contextualPackagePath);
    for (Source source : sources) {
      sourceObjects.add(source.toJsonObject());
    }

    // Adding the count and sources to the results. Limit and offset are both
    // hard-coded to 0 currently because they aren't implemented yet.
    results.put("count",sourceObjects.size());
    results.put("limit",0);
    results.put("offset",0);
    results.put("sources",sourceObjects);


    // Returning the results with a status code of 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else if (request.getMethod() == "POST") {
    if (request.getHeader("X-HTTP-Method") == null || request.getHeader("X-HTTP-Method").equals("POST")) {
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
      if (!json.containsKey("name") || !json.containsKey("url")) {
        results.put("message","Creation of Source failed. Cannot create a source without having a 'name' and 'url'.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
      }

      String name = json.get("name").toString();
      String url = json.get("url").toString();

      Source source = null;
      try {
        source = Source.createSource(contextualPackagePath,name,url);
      } catch (RuntimeException e) {
        results.put("message",e.getMessage());
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
      }

      // Returning the results with a status code of 200 OK
      response.setStatus(HttpServletResponse.SC_OK);
      response.getWriter().write(JsonUtils.toJsonString(source.toJsonObject()));
    } else if (request.getHeader("X-HTTP-Method").equals("DELETE")) {
      String call = request.getParameter("call");

      // Using a regex to get the source name. If a name can't be found in the
      // call path, return a 400 BadRequest with a message in results.
      String patternStr="/api/v1/sources/([\\w\\s]*)/?";
      Pattern p = Pattern.compile(patternStr);
      Matcher m = p.matcher(call);

      String sourceName = "";
      if (m.find()) {
          sourceName = m.group(1);
      } else {
          results.put("message","Could not find the Source name in the call path.");
          response.setStatus(HttpServletResponse.SC_NOT_FOUND);
          response.getWriter().write(JsonUtils.toJsonString(results));
          return;
      }

      try {
        Source.deleteSource(contextualPackagePath, sourceName);
      } catch (RuntimeException e) {
        results.put("message",e.getMessage());
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
      }
    } else if (request.getHeader("X-HTTP-Method").equals("PUT")) {
      String call = request.getParameter("call");

      // Using a regex to get the source name. If a name can't be found in the
      // call path, return a 400 BadRequest with a message in results.
      String patternStr="/api/v1/sources/([\\w\\s]*)/?";
      Pattern p = Pattern.compile(patternStr);
      Matcher m = p.matcher(call);

      String sourceName = "";
      if (m.find()) {
          sourceName = m.group(1);
      } else {
          results.put("message","Could not find the Source name in the call path.");
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

      // Get the name and url (if they exist)
      String updatedName = null;
      String url = null;
      if (json.containsKey("name")) { updatedName = json.get("name").toString(); }
      if (json.containsKey("url")) { url = json.get("url").toString(); }

      Source source = null;
      try {
        source = Source.modifySource(contextualPackagePath,sourceName,updatedName,url);
      } catch (RuntimeException e) {
        results.put("message",e.getMessage());
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
      }

      // Returning the results with a status code of 200 OK
      response.setStatus(HttpServletResponse.SC_OK);
      response.getWriter().write(JsonUtils.toJsonString(source.toJsonObject()));
    }
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>