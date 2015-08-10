<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> notes = new ArrayList<Map<String,Object>>();

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
    String note = null;
    byte[] attachmentContent = null;
    String fileName = null;
    if (request.getContentType().contains("application/json")) {
        // Parsing the POST body to get the input parameters needed for creating a
        // new note
        String body = IOUtils.toString(request.getReader());
        JSONObject inputJson = (JSONObject)JSONValue.parse(body);
        if (inputJson == null) {
            results.put("message","The input data is not recognized as properly formatted JSON");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }

        note = inputJson.get("note").toString();
    } else if (request.getContentType().contains("multipart/form-data")) {
        try {
            List<FileItem> items = new ServletFileUpload(new DiskFileItemFactory()).parseRequest(request);
            for (FileItem item : items) {
                if (item.isFormField()) {
                    // Process regular form field
                    String fieldName = item.getFieldName();
                    String fieldValue = item.getString();
                    if (fieldName.equals("note")) {
                        note = URLDecoder.decode(fieldValue);
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

    if (note == null) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        results.put("message","Creation of Note failed. Cannot create a note without having the 'note' field.");
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // If the work order with the inputted id exists, the new note will be saved,
    // and the id for that newly created note will be returned.
    String createdId = null;
    if (WorkOrder.findSingleById(context, workOrderId) != null) {
        createdId = WorkInformation.saveWorkInformationWithAttachment(context, workOrderId, note, fileName, attachmentContent);
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

    WorkInformation createdNote = WorkInformation.findSingleById(tzFreeContext, createdId);

    results.put("type", "note");
    results.put("id", createdNote.getId());
    results.put("created",DateConverter.getIso8601(createdNote.getCreateDate()));
    results.put("modified",DateConverter.getIso8601(createdNote.getModifyDate()));
    results.put("userId",createdNote.getSubmittedBy());
    results.put("note",createdNote.getInformation());

    // If there is no attachment, the attachment map will be set to null.
    Map<String,Object> attachment = null;
    if (createdNote.getAttachmentName() != "" || createdNote.getAttachment() != "") {
        attachment = new LinkedHashMap<String,Object>();
        attachment.put("title",createdNote.getAttachmentName());
        attachment.put("display", createdNote.getAttachmentUrl(request) + "?disposition=inline");
        attachment.put("download", createdNote.getAttachmentUrl(request));
    }

    results.put("attachment",attachment);

    // Return the results with a 201 Created
    response.setStatus(HttpServletResponse.SC_CREATED);
    response.getWriter().write(JsonUtils.toJsonString(results));

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

    // Creating the qualification to return the notes for the specified work order id.
    String qualification = "'" + WorkInformation.FIELD_WORK_ORDER_ID + "'=\"" + workOrderId + "\"";
    WorkInformation[] workOrderNotes = WorkInformation.find(tzFreeContext,qualification, new String[] {WorkInformation.FIELD_MODIFY_DATE}, limit, offset, 1);
    int count = WorkInformation.count(context, qualification);

    for (WorkInformation wi : workOrderNotes) {
        Map<String,Object> workInformation = new LinkedHashMap<String,Object>();
        workInformation.put("id",wi.getId());
        workInformation.put("created",DateConverter.getIso8601(wi.getCreateDate()));
        workInformation.put("modified",DateConverter.getIso8601(wi.getModifyDate()));
        workInformation.put("submittedBy",wi.getSubmittedBy());
        workInformation.put("note",wi.getInformation());

        // If there is no attachment, the attachment map will be set to null.
        Map<String,Object> attachment = null;
        if (wi.getAttachmentName() != "" || wi.getAttachment() != "") {
            attachment = new LinkedHashMap<String,Object>();
            attachment.put("title",wi.getAttachmentName());
            attachment.put("display", wi.getAttachmentUrl(request) + "?disposition=inline");
            attachment.put("download", wi.getAttachmentUrl(request));
        }

        workInformation.put("attachment",attachment);

        notes.add(workInformation);
    }

    // Adding the count, limit, offset, and notes to the results.
    results.put("count", count);
    results.put("limit",limit);
    results.put("offset",offset);
    results.put("notes",notes);

    // Return the results and with a 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
