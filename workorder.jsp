<% 
    // Define the current servlet path for Bundle to use for package context within the layout
    request.setAttribute("lastForwardServletPath", request.getServletPath());
    // Explicitly set the view we want the layout to use as a request attribute 
    // Views are configured in package/config/config.json
    request.setAttribute("view", "workorder");
    // Define dispatcher to forward to the desired layout
    RequestDispatcher dispatcher = request.getRequestDispatcher("interface/layouts/layout.jsp");
    // Forward
    dispatcher.forward(request, response);
    // Return to ensure nothing else is processed
    return;
%>