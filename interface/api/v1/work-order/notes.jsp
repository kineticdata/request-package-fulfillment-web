<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();

String call = request.getParameter("call");

// Using a regex to get the work order id. If an id can't be found in the
// call path, return a 400 BadRequest with a message in results.
String patternStr="/api/v1/work-orders/(\\w*)/notes/?";
Pattern p = Pattern.compile(patternStr);
Matcher m = p.matcher(call);

String workOrderId = "";
if (m.find()) {
    workOrderId = m.group(1);
} else {
    results.put("message","Could not find the Work Order Id in the call path.");
    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    response.getWriter().write(JsonUtils.toJsonString(results));
    return;
}

// If the request method is a POST, create a new note
if (request.getMethod() == "POST") {
    String entry = null;
    byte[] attachmentContent = null;
    String fileName = null;
    if (request.getContentType().contains("application/json")) {
        // Parsing the POST body to get the input parameters needed for creating a
        // new note
        String body = IOUtils.toString(request.getReader());
        JSONObject json = (JSONObject)JSONValue.parse(body);
        if (json == null) {
            results.put("message","The input data is not recognized as properly formatted JSON");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }

        if (json.containsKey("entry")) { entry = json.get("entry").toString(); }
    } else if (request.getContentType().contains("multipart/form-data")) {
        try {
            List<FileItem> items = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(request);
            for (FileItem item : items) {
                if (item.isFormField()) {
                    // Process regular form field
                    String fieldName = item.getFieldName();
                    String fieldValue = item.getString();
                    if (fieldName.equals("entry")) {
                        entry = URLDecoder.decode(fieldValue);
                    }
                } else {
                    // Process form file field (input type="file").
                    if (item.getFieldName().equals("attachment")) {
                        fileName = FilenameUtils.getName(item.getName());
                        InputStream fileContent = item.getInputStream();
                        attachmentContent = IOUtils.toByteArray(fileContent);
                    }
                }
            }
        } catch (FileUploadException e) {
            throw new ServletException("Cannot parse multipart request.", e);
        }
    } else {
        response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    if (entry == null) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        results.put("message","Creation of Note failed. Cannot create a note without having the 'entry' field.");
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // If the work order with the inputted id exists, the new note will be saved,
    // and the id for that newly created note will be returned.
    String createdId = null;
    if (WorkOrder.findSingleById(context, workOrderId) != null) {
        createdId = Note.saveNote(context, workOrderId, entry, fileName, attachmentContent);
    } else {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        results.put("message","A Work Order with the id of '" + workOrderId + "' was not found.");
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Using the created id, retrieve and return all the information for the
    // note that was just created.
    HelperContext tzFreeContext = context.getCopy();
    tzFreeContext.setTimezoneOffset(0);

    Note createdNote = Note.retrieveById(tzFreeContext, createdId);

    // Return the results with a 201 Created
    response.setStatus(HttpServletResponse.SC_CREATED);
    response.getWriter().write(JsonUtils.toJsonString(createdNote.toJsonObject(request)));

} else if (request.getMethod().equals("GET")) {
    // If the request to the endpoint is a GET request, get the notes associated
    // with the work order id. A qualification is built to retrieve all the notes
    // associated with the id, and then they are iterated through to create note
    // JSON objects.

    // Create a Time Zone Free copy of the context to the used to return the time
    // stamps in UTC. Also gets limit and offset integer values based on the
    // request parameters that were passed. Currently sorting on Modified Date ASC.
    HelperContext tzFreeContext = context.getCopy();
    tzFreeContext.setTimezoneOffset(0);

    int limit = request.getParameter("limit") == null ? 0 : Integer.parseInt(request.getParameter("limit"));
    int offset = request.getParameter("offset") == null ? 0 : Integer.parseInt(request.getParameter("offset"));

    // Set the sorting information. Default to modified date if no sort data
    // was passed in
    String[] orderList;
    int sortDirection = 1; // default to ASC, 2 is DESC
    String order = request.getParameter("order");
    if (order != null) {
        orderList = order.split(",");
        for (int i=0; i<orderList.length; i++) {
            if (i != orderList.length-1) {
                orderList[i] = Note.SORTABLE_FIELDS.get(orderList[i].trim());
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
                    orderList[i] = Note.SORTABLE_FIELDS.get(split[0].trim());
                    if (split[1].toUpperCase().equals("DESC")) {
                        sortDirection = 2;
                    }
                }
            }
        }
    } else {
        orderList = new String[] {Note.SORTABLE_FIELDS.get("modified")};
        sortDirection = 2; // Default Sort order is descending by modified
    }

    // Creating the qualification to return the notes for the specified work order id.
    String qualification = "'" + Note.FIELD_WORK_ORDER_ID + "'=\"" + workOrderId + "\"";
    Note[] notes = Note.find(tzFreeContext,qualification, orderList, limit, offset, sortDirection);
    int count = Note.count(context, qualification);

    List<Map> notesList = new ArrayList<Map>();
    for (Note note : notes) {
        notesList.add(note.toJsonObject(request));
    }

    // Adding the count, limit, offset, and notes to the results.
    results.put("count", count);
    results.put("limit",limit);
    results.put("offset",offset);
    results.put("notes",notesList);

    // Return the results and with a 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
