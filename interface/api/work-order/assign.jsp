<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();

if (request.getMethod() == "POST") {
    // Read the call parameter in do get the work order id from the path
    String call = request.getParameter("call");

    // Using a regex to get the work order id, and then using that id to
    // retrieve the work order object. If a work order object can't be found
    // with the inputted id, return the results with a 400 BadRequest
    String workOrderId;
    WorkOrder workOrder;

    String patternStr="/api/v1/work-orders/(\\w*)/assign/?";
    Pattern p = Pattern.compile(patternStr);
    Matcher m = p.matcher(call);

    if (m.find()) {
        workOrderId = m.group(1);
        workOrder = WorkOrder.findSingleById(context, workOrderId);
    } else {
        results.put("message","Assignment of Work Order failed. Could not find the Work Order Id in the call path.");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    }
    
    // Saving the work order fields that have a possibility to be changed by the
    // assignment call, so it is easier to calculate and log differences after
    // all the assignment has been completed
    String previousCompany = StringUtils.stripToNull(workOrder.getCompany());
    String previousOrganization = StringUtils.stripToNull(workOrder.getOrganization());
    String previousGroup = StringUtils.stripToNull(workOrder.getGroupID());
    String previousMember = StringUtils.stripToNull(workOrder.getAssignedLoginId());

    String company = null;
    String organization = null;
    String group = null;
    String member = null;

    // If the request object has any non-null attribute for Company, Organization,
    // Group or Member, it means that the assign-me.jsp passed on the request.
    // This means that the input data will be combined in the attributes instead
    // of a POST request body. If all those values are null, parse the POST 
    // request body to get inputted company, organiation, group and member values.
    if (request.getAttribute("Company") != null || request.getAttribute("Organization") != null || request.getAttribute("Group") != null || request.getAttribute("Member") != null  ) {
        if (request.getAttribute("Company") != null) {company = request.getAttribute("Company").toString();}
        if (request.getAttribute("Organization") != null) {organization = request.getAttribute("Organization").toString();}
        if (request.getAttribute("Group") != null) {group = request.getAttribute("Group").toString();}
        if (request.getAttribute("Member") != null) {member = request.getAttribute("Member").toString();}
    } else {
        if (!request.getContentType().contains("application/json")) {
            response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }
        String body = IOUtils.toString(request.getReader());
        JSONObject inputJson = (JSONObject)JSONValue.parse(body);
        if (inputJson == null) {
            results.put("message","The input data is not recognized as properly formatted JSON");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(JsonUtils.toJsonString(results));
            return;
        }
        
        if (inputJson.containsKey("Company")) {company = inputJson.get("Company").toString();}
        if (inputJson.containsKey("Organization")) {organization = inputJson.get("Organization").toString();}
        if (inputJson.containsKey("Group")) {group = inputJson.get("Group").toString();}
        if (inputJson.containsKey("Member")) {member = inputJson.get("Member").toString();}
    }

    // If a member is included in the input, check and make sure that the member
    // exists within the specified group. If they are in the group, save the 
    // first name and last name, so that the assignment can happen after the 
    // rest of the input parameters have been error checked as well.
    String memberFirstName = null;
    String memberLastName = null;
    if (member != null) {
        if (organization == null || company == null || group == null) {
            results.put("message","Assignment of Work Order failed. Cannot assign a member without an associated Company, Organization and Group.");
        } else {
            BridgeList<SupportMemberBridge> memberBridgeList = SupportMemberBridge.findByGroupId(context, customerRequest.getTemplateId(), group);
            Boolean validMember = false;
            for (SupportMemberBridge smb : memberBridgeList) {
                if (member.equalsIgnoreCase(smb.getLoginID())) {
                    validMember = true;
                    memberFirstName = smb.getFirstName();
                    memberLastName = smb.getLastName();
                    break;
                }
            }
            
            // Only check here if it is a valid member or not. If the member is 
            // valid, it will be assigned after organization and company have
            // been verified as a valid configuration.
            if (validMember == false) {
                results.put("message","Assignment of Work Order failed. Member '" + member + "' does not exist within the hierarchy of Company='" + company + "', Organization='" + organization + "', and Group='" + group + "'.");
            }
        } 
    }
    
    String groupName = null;
    if (group != null) {
        // If a group is included in the input, check and make sure the group is
        // included within the hierarchy of the provided company and organization
        // by making a bridge call to find by company and organization and 
        // verifying that the inputted group id is included in the bridge results.
        if (organization == null || company == null) {
            results.put("message","Assignment of Work Order failed. Cannot assign a group without an associated Company and Organization.");
        } else {
            BridgeList<GroupBridge> groupBridgeList = GroupBridge.findByCompanyAndOrganization(context, customerRequest.getTemplateId(), company, organization);
            Boolean validGroup = false;
            for (GroupBridge gb : groupBridgeList) {
                if (group.equalsIgnoreCase(gb.getGroupId())) {
                    validGroup = true;
                    groupName = gb.getGroupName();
                    break;
                }
            }
            
            if (validGroup == false) {
                results.put("message","Assignment of Work Order failed. Group '" + group + "' does not exist within the hierarchy of Company='" + company + "' and Organization='" + organization + "'.");
            }
        }
    } else if (organization != null) {
        // Check to make sure that the organization included can be found under
        // the included company, and if it is not, add a message to results,
        // which will indicate that an error will have to be thrown before the
        // actual assignment happens
        if (company == null) {
            results.put("message","Assignment of Work Order failed. Cannot assign an Organization without an associated Company.");
        } else {
            BridgeList<OrganizationBridge> organizationBridgeList = OrganizationBridge.findByCompany(context, customerRequest.getTemplateId(), company);
            Boolean validOrg = false;
            for (OrganizationBridge ob : organizationBridgeList) {
                if (organization.equalsIgnoreCase(ob.getOrganization())) {
                    validOrg = true;
                    break;
                }
            }
            
            if (validOrg == false) {
                results.put("message","Assignment of Work Order failed. Organization '" + organization + "' does not exist within the hierarchy of Company='" + company + "'");
            }
        }
    } else if (company != null) {
        // If just a company is included, just check to make sure that the
        // company exists, and if it is not, add a message to results,
        // which will indicate that an error will have to be thrown before the
        // actual assignment happens
        BridgeList<CompanyBridge> bl = CompanyBridge.findAllCompanies(context, customerRequest.getTemplateId());
        Boolean validCompany = false;
        for (CompanyBridge cb : bl) {
            if (company.equalsIgnoreCase(cb.getCompany())) {
                validCompany = true;
                break;
            }
        }
            
        if (validCompany == false) {
            results.put("message","Assignment of Work Order failed. Company '" + company + "' cannot be found.");
        }
    }
    
    // If there was an error when attempting to assign, it creates a message in
    // the results. If a message is present, return the results and and 400 BadRequest.
    if (results.containsKey("message")) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.getWriter().write(JsonUtils.toJsonString(results));
        return;
    } else {
        // Assign the member and groups to the work order and then log it
        workOrder.saveGroup(context, company, organization, group, groupName);
        workOrder.saveMember(context, member, memberFirstName, memberLastName);

        // Check with the saved previous work order assignment fields to see
        // what has changed and therefore what needs to be logged. Then use a
        // string builder to build up all the logs that need to be saved, and
        // then save the entry.
        StringBuilder logEntry = new StringBuilder();
        logEntry.append("Assignment: ");
        // Creating log entry if the company has changed
        if (!StringUtils.equals(previousCompany,company)) {
            logEntry.append(String.format("[Company] changed from '%s' to '%s'; ",
                    StringUtils.stripToEmpty(previousCompany),StringUtils.stripToEmpty(company)));
        }

        // Creating log entry if the organization has changed
        if (!StringUtils.equals(previousOrganization,organization)) {
            logEntry.append(String.format("[Organization] changed from '%s' to '%s'; ",
                    StringUtils.stripToEmpty(previousOrganization),StringUtils.stripToEmpty(organization)));
        }

        // Creating log entry if the group has changed
        if (!StringUtils.equals(previousGroup,group)) {
            logEntry.append(String.format("[Group] changed from '%s' to '%s' (%s); ", StringUtils.stripToEmpty(previousGroup),
                    StringUtils.stripToEmpty(group),StringUtils.stripToEmpty(groupName)));
        }

        // Creating log entry if the member has changed
        if (!StringUtils.equals(previousMember,member)) {
            logEntry.append(String.format("[Member] changed from '%s' to '%s' (%s %s); ", StringUtils.stripToEmpty(previousMember),
                    StringUtils.stripToEmpty(member),StringUtils.stripToEmpty(memberFirstName),StringUtils.stripToEmpty(memberLastName)));
        }
        
        // Create the assignment status. If the company is equal to null, that 
        // means that the rest of organization, group, and member all need to be
        // null as well if there was no error thrown, which means that everything
        // should be unassigned
        String assignmentStatus = "Assigned";
        if (company == null) {assignmentStatus = null;}
        
        if (!logEntry.toString().equals("Assignment: ")) { // If logEntry is still equal to Assignment:, nothing has changed in the assignment
            WorkOrderLog.saveLog(context, workOrderId, member, assignmentStatus, logEntry.toString().trim(), "Assignment", "");
        }

        // Finally, return the changed work order object
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(JsonUtils.toJsonString(workOrder.toJsonObject(request)));
    }
} else {
    response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    response.getWriter().write(JsonUtils.toJsonString(results));
}
%>
