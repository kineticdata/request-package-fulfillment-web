<%@page import="com.bmc.thirdparty.org.apache.commons.lang.ArrayUtils"%>
<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%!
    class DateComparator implements Comparator<Object> {
        @Override
        //  01/16/2015 21:01:58
        public int compare(Object a, Object b) {
            String aDateString;
            String bDateString;
            Date aDate;
            Date bDate;
            if (a.getClass() == Note.class) {
                aDateString = ((Note)a).getModifyDate();
            } else {
                aDateString = ((WorkOrderLog)a).getDate();
            }
            
            if (b.getClass() == Note.class) {
                bDateString = ((Note)b).getModifyDate();
            } else {
                bDateString = ((WorkOrderLog)b).getDate();
            }

            // Have run into problems where modify date hasn't populated for
            // notes before. So fail over to create date if modify date is empty
            if (aDateString == "") { aDateString =  ((Note)a).getCreateDate();}
            if (bDateString == "") { bDateString =  ((Note)b).getCreateDate();}
            
            SimpleDateFormat parser = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
            try {
                aDate = parser.parse(aDateString);
                bDate = parser.parse(bDateString);
            } catch (ParseException pe) {
                throw new RuntimeException(pe);
            }
            
            int comp;
            if (aDate.before(bDate)) {
                comp = 1;
            } else if (aDate.after(bDate)) {
                comp = -1;
            } else {
                comp = 0;
            }
            return comp;
        }
    }
%>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> logs = new ArrayList<Map<String,Object>>();

if (request.getMethod() == "GET") {
    // Using a regex to get the work order id. If an id can't be found in the
    // call path, return a 400 BadRequest with a message in results.
    String patternStr="/api/v1/work-orders/(\\w*)/history/?";
    Pattern p = Pattern.compile(patternStr);
    Matcher m = p.matcher(request.getParameter("call"));

    String id = "";
    if (m.find()) {
        id = m.group(1);
    } else {
        results.put("message","Could not find the Work Order Id in the call path.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }

    // Create a Time Zone Free copy of the context to the used to return the time
    // stamps in UTC. Also gets limit and offset integer values based on the 
    // request parameters that were passed. Currently sorting on Create Date ASC.
    HelperContext tzFreeContext = context.getCopy();
    tzFreeContext.setTimezoneOffset(0);

    int limit = request.getParameter("limit") == null ? 0 : Integer.parseInt(request.getParameter("limit"));
    int offset = request.getParameter("offset") == null ? 0 : Integer.parseInt(request.getParameter("offset"));
    
    WorkOrderLog[] workOrderLogs = WorkOrderLog.find(tzFreeContext,id,new String[] {WorkOrderLog.FIELD_CREATE_DATE},0,0,1);
    String qualification = "'" + Note.FIELD_WORK_ORDER_ID + "'=\"" + id + "\"";
    Note[] notes = Note.find(tzFreeContext,qualification,new String[] {Note.FIELD_MODIFY_DATE},0,0,1);
        
    List historyCollection = new ArrayList();
    historyCollection.addAll(Arrays.asList(workOrderLogs));
    historyCollection.addAll(Arrays.asList(notes));
    Collections.sort(historyCollection, new DateComparator());
    
    String order = request.getParameter("order");
    if (order != null && order.toLowerCase().contains("modified asc")) {
        Collections.reverse(historyCollection);
    }
    
    if (limit != 0 || offset != 0) {
        historyCollection = historyCollection.subList(offset, offset+limit);
    }
        
    List history = new ArrayList();
    for (Object o : historyCollection) {
        Map<String,Object> historyObject = new LinkedHashMap<String,Object>();;
        if (o.getClass() == Note.class) {
            Note wi = (Note)o;
            historyObject.put("type", "note");
            historyObject.put("id", wi.getId());
            historyObject.put("created",DateConverter.getIso8601(wi.getCreateDate()));
            historyObject.put("modified",DateConverter.getIso8601(wi.getModifyDate()));
            historyObject.put("userId",wi.getSubmittedBy());
            historyObject.put("entry",wi.getInformation());
            historyObject.put("visibility",wi.getVisibilityFlag());
            
            // If there is no attachment, the attachment map will be set to null.
            Map<String,Object> attachment = null;
            if (wi.getAttachmentName() != "" || wi.getAttachment() != "") {
                attachment = new LinkedHashMap<String,Object>();
                attachment.put("title",wi.getAttachmentName());
                attachment.put("display", wi.getAttachmentUrl(request) + "?disposition=inline");
                attachment.put("download", wi.getAttachmentUrl(request));
            }

            historyObject.put("attachment",attachment);
        } else {
            // Else the history object is a log
            WorkOrderLog log = (WorkOrderLog)o;
            historyObject.put("type", "log");
            historyObject.put("id", log.getLogID());
            historyObject.put("created",DateConverter.getIso8601(log.getDate()));
            historyObject.put("modified",DateConverter.getIso8601(log.getDate()));
            historyObject.put("userId",log.getAssigneeID());
            historyObject.put("entry",log.getLog());
            historyObject.put("visibility","Public");
            historyObject.put("attachment",null);
        }
        history.add(historyObject);
    }

    // Adding the count, limit, offest and logs to the results.
    results.put("count", historyCollection.size());
    results.put("limit",limit);
    results.put("offset",offset);
    results.put("history",history);

    // Returning the results with a status code of 200 OK
    response.setStatus(HttpServletResponse.SC_OK);
    response.getWriter().write(JsonUtils.toJsonString(results));
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
