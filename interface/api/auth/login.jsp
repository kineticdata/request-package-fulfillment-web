<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%@page import="com.kd.kineticSurvey.beans.UserContext"%>
<%
    // Restrict to POST
    Map<String,Object> results = new LinkedHashMap<String,Object>();
    String username = "";
    String password = "";
    if (request.getMethod() == "POST") {
        String body = IOUtils.toString(request.getReader());
        JSONObject inputJson = (JSONObject)JSONValue.parse(body);
        if (inputJson == null) {
            results.put("message","The input data is not recognized as properly formatted JSON");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }
        
        username = inputJson.get("user").toString();
        password = inputJson.get("pass").toString();
    } else if (request.getMethod().equals("GET")) {
        username = request.getParameter("user");
        password = request.getParameter("pass");
    }
    
    HelperContext defaultHelperContext = RemedyHandler.getDefaultHelperContext();
    HelperContext helperContext = new HelperContext(
            username, 
            password, 
            defaultHelperContext.getServerName(), 
            defaultHelperContext.getTcpPort(), 
            defaultHelperContext.getRpcPort());
    
    try {
        helperContext.getContext().login();
        
        // Wrap the cookie return values inside of a Cookie object to make it easier to
        // check if the cookie actually exists or not
        Map<String,Object> cookie = new LinkedHashMap<String,Object>();
        cookie.put("name", "JSESSIONID");
        cookie.put("value", session.getId());
        
        results.put("cookie", cookie);
        
        
        UserContext userContext = new UserContext();
        userContext.setArContext(helperContext);
        userContext.setUserName(username);      
        userContext.setAuthenticated(true);  

        session.setAttribute("UserContext", userContext);
        
        response.setStatus(HttpServletResponse.SC_OK);
        
    } catch (com.bmc.arsys.api.ARException e) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        results = new LinkedHashMap<String,Object>();
    }
    
    response.getWriter().write(JsonUtils.toJsonString(results));
%>
