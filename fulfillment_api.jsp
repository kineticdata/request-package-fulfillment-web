<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="framework/includes/packageInitialization.jspf" %>
<%
    String call = request.getParameter("call");

    String forwardJsp = null;
    if ("/api/v1/auth/ping".equals(call)) { forwardJsp = "interface/api/auth/ping.jsp";}
    else if ("/api/v1/auth/login".equals(call)) { forwardJsp = "interface/api/auth/login.jsp"; }
    else if (call != null) {
        if (context == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{}");
        } else {
            if (call.matches("/api/v1/filters/?(.*?)(\\z|/)")) {forwardJsp = "interface/api/filters.jsp";}
            else if (call.matches("/api/v1/sources/?(.*?)(\\z|/)")) {forwardJsp = "interface/api/sources.jsp";}
            else if (call.matches("/api/v1/work-orders/?")) { forwardJsp = "interface/api/work-order/work-orders.jsp";}
            else if (call.matches("/api/v1/work-orders/search/?")) {forwardJsp = "interface/api/work-order/search.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/view/?")) {forwardJsp = "interface/api/work-order/view.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/logs/?")) {forwardJsp = "interface/api/work-order/logs.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/notes/?")) {forwardJsp = "interface/api/work-order/notes.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/history/?")) {forwardJsp = "interface/api/work-order/history.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/assign/me/?")) {forwardJsp = "interface/api/work-order/assign-me.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/assign/?")) {forwardJsp = "interface/api/work-order/assign.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/related/?")) {forwardJsp = "interface/api/work-order/related.jsp";}
            else if (call.matches("/api/v1/work-orders/\\w*/?")) {forwardJsp = "interface/api/work-order/work-order.jsp";}
            else if (call.matches("/api/v1/assignment/groups/?")) {forwardJsp = "interface/api/assignment/groups.jsp";}
            else if (call.matches("/api/v1/assignment/members/?")) {forwardJsp = "interface/api/assignment/members.jsp";}
            else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{}");
            }
        }
    }
    else { forwardJsp = "interface/views/fulfillment/fulfillment_api.jsp"; }

    if (forwardJsp != null) {
        RequestDispatcher dispatcher = request.getRequestDispatcher(forwardJsp);
        dispatcher.forward(request, response);
    }
%>