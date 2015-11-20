<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="framework/includes/packageInitialization.jspf" %>
<%
    String call = request.getParameter("call");

    String version = null;
    if (call.matches("/api/v1/.*")) {version = "v1";}

    String forwardJsp = null;
    if (version != null) {
        String apiFolderPath = "interface/api/" + version;
        if (call.matches("/api/.*?/auth/ping")) { forwardJsp = apiFolderPath+"/auth/ping.jsp";}
        else if (call.matches("/api/.*?/auth/login")) { forwardJsp = apiFolderPath+"/auth/login.jsp"; }
        else if (call != null) {
            if (context == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{}");
            } else {
                if (call.matches("/api/.*?/filters/?(.*?)(\\z|/)")) {forwardJsp = apiFolderPath+"/filters.jsp";}
                else if (call.matches("/api/.*?/sources/?(.*?)(\\z|/)")) {forwardJsp = apiFolderPath+"/sources.jsp";}
                else if (call.matches("/api/.*?/work-orders/?")) { forwardJsp = apiFolderPath+"/work-order/work-orders.jsp";}
                else if (call.matches("/api/.*?/work-orders/search/?")) {forwardJsp = apiFolderPath+"/work-order/search.jsp";}
                else if (call.matches("/api/.*?/work-orders/\\w*/logs/?")) {forwardJsp = apiFolderPath+"/work-order/logs.jsp";}
                else if (call.matches("/api/.*?/work-orders/\\w*/notes/?")) {forwardJsp = apiFolderPath+"/work-order/notes.jsp";}
                else if (call.matches("/api/.*?/work-orders/\\w*/assign/me/?")) {forwardJsp = apiFolderPath+"/work-order/assign-me.jsp";}
                else if (call.matches("/api/.*?/work-orders/\\w*/assign/?")) {forwardJsp = apiFolderPath+"/work-order/assign.jsp";}
                else if (call.matches("/api/.*?/work-orders/\\w*/related/?")) {forwardJsp = apiFolderPath+"/work-order/related.jsp";}
                else if (call.matches("/api/.*?/work-orders/\\w*/?")) {forwardJsp = apiFolderPath+"/work-order/work-order.jsp";}
                else if (call.matches("/api/.*?/assignment/groups/?")) {forwardJsp = apiFolderPath+"/assignment/groups.jsp";}
                else if (call.matches("/api/.*?/assignment/members/?")) {forwardJsp = apiFolderPath+"/assignment/members.jsp";}
                else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("{}");
                }
            }
        }
        else { forwardJsp = "interface/views/fulfillment/fulfillment_api.jsp"; }
    }

    if (forwardJsp != null) {
        RequestDispatcher dispatcher = request.getRequestDispatcher(forwardJsp);
        dispatcher.forward(request, response);
    }
%>