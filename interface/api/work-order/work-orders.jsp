<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> workOrders = new ArrayList<Map<String,Object>>();
String contextualPackagePath = request.getServletContext().getRealPath("/") + bundle.relativePackagePath();

if (request.getMethod() == "GET") {
    // Creating a Time Zone Free copy of the Context so that time stamps 
    // are all returned in UTC.
    HelperContext tzFreeContext = context.getCopy();
    tzFreeContext.setTimezoneOffset(0);

    // Initialize the Work Order list and find the integer values for the limit
    // and offset based on the request parameters that were included.
    WorkOrder[] workOrderObjects = null;
    int limit = request.getParameter("limit") == null ? 0 : Integer.parseInt(request.getParameter("limit"));
    int offset = request.getParameter("offset") == null ? 0 : Integer.parseInt(request.getParameter("offset"));
    int count = 0;

    // Set the sorting information. Default to modified date if no sort data
    // was passed in
    String[] orderList;
    int sortDirection = 1; // default to ASC, 2 is DESC
    String order = request.getParameter("order");
    if (order != null) {
        orderList = order.split(",");
        for (int i=0; i<orderList.length; i++) {
            if (i != orderList.length-1) {
                orderList[i] = WorkOrder.SORTABLE_FIELDS.get(orderList[i].trim());
                if (orderList[i] == null) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    results.put("message", "A field with the name of " + orderList[i] + " was not found.");
                    response.getWriter().write(JsonUtils.toJsonString(results));
                    return;
                }
            } else {
                orderList[i] = orderList[i].trim();
                if (orderList[i].contains(" ")) {
                    String[] split = orderList[i].split(" ");
                    orderList[i] = WorkOrder.SORTABLE_FIELDS.get(split[0].trim());
                    if (split[1].toUpperCase().equals("DESC")) {
                        sortDirection = 2;
                    }
                }
            }
        }
    } else {
        orderList = new String[] {WorkOrder.SORTABLE_FIELDS.get("modifiedDate")};
    }

    List<String> individualFilters = new ArrayList<String>();
    for (Map.Entry<String,String[]> entry : request.getParameterMap().entrySet()) {
        if (entry.getKey().matches("field\\[.*?\\]")) {
            String key = entry.getKey();
            for (String value : entry.getValue()) {
                String field = key.substring("field[".length(), key.length()-1);
                // If the field isn't contained in FILTER_FIELDS, throw an error
                if (!WorkOrder.FILTER_FIELDS.containsKey(field)) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    results.put("message", "'" + field + "' is not a valid filterable field.");
                    response.getWriter().write(JsonUtils.toJsonString(results));
                    return;
                }

                // '{field}' LIKE "%Demo2%"
                String individualFilter;
                if (StringUtils.stripToNull(value) != null) {
                    if (!field.equals("status")) {
                        individualFilter = String.format("'%s' LIKE \"%%%s%%\"",WorkOrder.FILTER_FIELDS.get(field), value);
                    } else {
                        individualFilter = String.format("'%s'=\"%s\"",WorkOrder.FILTER_FIELDS.get(field), value);
                    }
                    individualFilters.add(individualFilter);
                }
            }
        }
    }

    // If the work order page is passed a filter, use the qualification from the
    // filter to return the work orders. If there no filter passed, throw an error.
    // If a search qualification was passed from search.jsp, use that as the
    // qualification for WorkOrder.find().
    Object searchQualification = request.getAttribute("qualification");
    if (request.getParameter("filter") != null) {
        String filterName = request.getParameter("filter");
        Filter filter = Filter.getFilter(context, contextualPackagePath, filterName);
        if (filter != null) {
            // sorting by 1 is ASC, sorting by 0 is DESC. Currently automatically searching by modified date ASC.
            String qualification;
            if (!individualFilters.isEmpty()) {
                qualification = "(" + filter.getQualification() + ") AND " + StringUtils.join(individualFilters," AND ");
            } else {
                qualification = filter.getQualification();
            }
            workOrderObjects = WorkOrder.find(tzFreeContext, qualification, orderList, limit, offset, sortDirection);
            count = WorkOrder.count(context, qualification);
        }
        else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            results.put("message", "A Filter with the name of '" + filterName + "' was not found.");
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }
    } else if (searchQualification != null) { // If a qualification was passed from search.jsp, find the workOrders
        workOrderObjects = WorkOrder.find(tzFreeContext, searchQualification.toString(), orderList, limit, offset, sortDirection);
        count = WorkOrder.count(context, searchQualification.toString());
    } else {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        results.put("message", "Work Orders cannot be retrieved without having a filter specified.");
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Iterate through the Work Order array and make work order JSON objects
    for (WorkOrder workOrder : workOrderObjects) {   
        workOrders.add(workOrder.toJsonObject(request,contextualPackagePath));
    }

    // Adding the count, limit, offset, and work orders to the results.
    results.put("count",count);
    results.put("limit",limit);
    results.put("offset",offset);
    results.put("workOrders",workOrders);

    // Returning the results and a 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
