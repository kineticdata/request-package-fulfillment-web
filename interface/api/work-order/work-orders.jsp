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
    int sortDirection = 1; // default to ASC, 2 is DESC
    String order = request.getParameter("order");
    String[] orderIds;
    String[] orderNames;
    if (order != null) {
        orderNames = order.split(",");
        orderIds = new String[orderNames.length];
        for (int i=0; i<orderNames.length; i++) {
            // If there is a space in the Filter Field look for a DESC (b/c
            // there shouldn't be any spaces in field names). If a DESC is
            // found, set the overall sort direction. If it is not found,
            // assume ASC.
            if (orderNames[i].trim().contains(" ") && i != orderNames.length - 1) {
                // Because you cannot currently do ASC, DESC on individual fields
                // (can only do all ASC or all DESC), throw an error if there is
                // an ASC or DESC on an order field that isn't the final field 
                // specified
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                results.put("message", "Invalid Order: Can't do ASC/DESC on individual order fields. Put ASC or DESC at the end of the order string to sort all order fields by ASC or DESC.");
                response.getWriter().write(JsonUtils.toJsonString(results));
                return;
            } else if (orderNames[i].trim().contains(" ")) {
                String[] split = orderNames[i].trim().split(" ");
                orderIds[i] = WorkOrder.SORTABLE_FIELDS.get(split[0].trim());
                if (split[1].toUpperCase().equals("DESC")) {
                    sortDirection = 2;
                }
            } else {
                System.out.println(orderNames[i].trim());
                System.out.println(WorkOrder.SORTABLE_FIELDS.get(orderNames[i].trim()));
                orderIds[i] = WorkOrder.SORTABLE_FIELDS.get(orderNames[i].trim());
            }
        }

        // Go through orderIds to make sure that there aren't any null values,
        // which indicate that the sortable field doesn't exist
        List<String> badFields = null;
        for (int i=0; i<orderIds.length; i++) {
            if (orderIds[i] == null) {
                if (badFields == null) { badFields = new ArrayList<String>(); }
                badFields.add(orderNames[i]);
            }
        }
        // If there are bad fields, throw an error message alerting the user to
        // bad order fields
        if (badFields != null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            results.put("message", "The following filter field(s) were not found: " + StringUtils.join(badFields,", "));
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }
    } else {
        // If not order string was provided, default to sorting by modifiedDate.
        orderIds = new String[] {WorkOrder.SORTABLE_FIELDS.get("modifiedDate")};
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
            workOrderObjects = WorkOrder.find(tzFreeContext, qualification, orderIds, limit, offset, sortDirection);
            count = WorkOrder.count(context, qualification);
        }
        else {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            results.put("message", "A Filter with the name of '" + filterName + "' was not found.");
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }
    } else if (searchQualification != null) { // If a qualification was passed from search.jsp, find the workOrders
        workOrderObjects = WorkOrder.find(tzFreeContext, searchQualification.toString(), orderIds, limit, offset, sortDirection);
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
