<%@page contentType="application/json" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@include file="../../../framework/includes/packageInitialization.jspf" %>
<%
Map<String,Object> results = new LinkedHashMap<String,Object>();
ArrayList<Map<String,Object>> items = new ArrayList<Map<String,Object>>();

// Making a string array out the parents passed as GET parameters
String[] parents = request.getParameterValues("parent[]");

// If there are no parent parameter values passed, the returned object is a Company
if (parents == null) {
    results.put("label", "Company");

    // Making the bridge call to retrieve all the company records, and then
    // storing each unique company name in the companyList.
    BridgeList<CompanyBridge> companyBridgeList = CompanyBridge.findAllCompanies(context, customerRequest.getTemplateId());
    ArrayList<String> companyList = new ArrayList<String>();
    for (CompanyBridge companyBridge : companyBridgeList) {
        if (!companyList.contains(companyBridge.getCompany())) {
            companyList.add(companyBridge.getCompany());
        }
    }

    // For each unique company, make a Bridge call to see how many unique
    // children (organizations) they have. The results to these calls are stored
    // within a HashMap until the results need to be retrieved, which allows
    // BridgeBase to multithread all of the Bridge calls.
    Map<String,BridgeList<OrganizationBridge>> bridgeBaseMap = new LinkedHashMap<String,BridgeList<OrganizationBridge>>();
    for (String company : companyList) {
        BridgeList<OrganizationBridge> compChildren = OrganizationBridge.findByCompany(context, customerRequest.getTemplateId(), company);
        bridgeBaseMap.put(company,compChildren);
    }
    
    // Once all the calls have been started, iterate through the results to
    // build the return JSON. The Id and Name of the company comes from the key
    // of the bridgeBaseMap, while the childrenCount is found by iterating
    // through the OrganizationBridge results and finding the amount of unique
    // organizations that were returned.
    for (Map.Entry<String,BridgeList<OrganizationBridge>> entry : bridgeBaseMap.entrySet()) {
        String company = entry.getKey();
        BridgeList<OrganizationBridge> children = entry.getValue();

        ArrayList<String> organizationList = new ArrayList<String>();
        for (OrganizationBridge organizationBridge : children) {
            if (!organizationList.contains(organizationBridge.getOrganization())) {
                organizationList.add(organizationBridge.getOrganization());
            }
        }

        Map<String,Object> item = new LinkedHashMap<String,Object>();
        item.put("id",company);
        item.put("name",company);
        item.put("childrenCount",organizationList.size());
        items.add(item);
    }
} else {
    // If there was one parent parameter value passed, the returned object is
    // an Organization
    if (parents.length == 1) {
        // Initializing a string to save the company name that was passed in
        // as a parameter
        String company = parents[0];
        results.put("label","Organization");

        // Making the bridge call to retrieve all the company records, and then
        // storing each unique company name in the companyList.
        BridgeList<OrganizationBridge> organizationBridgeList = OrganizationBridge.findByCompany(context, customerRequest.getTemplateId(), company);
        ArrayList<String> organizationList = new ArrayList<String>();
        for (OrganizationBridge organizationBridge : organizationBridgeList) {
            if (!organizationList.contains(organizationBridge.getOrganization())) {
                organizationList.add(organizationBridge.getOrganization());
            }
        }

        // For each unique organization, make a Bridge call to see how many 
        // unique children (groups) they have. The results to these calls are 
        // stored within a HashMap until the results need to be retrieved, which 
        // allows BridgeBase to multithread all of the Bridge calls.
        Map<String,BridgeList<GroupBridge>> bridgeBaseMap = new LinkedHashMap<String,BridgeList<GroupBridge>>();
        for (String organization : organizationList) {
            BridgeList<GroupBridge> orgChildren = GroupBridge.findByCompanyAndOrganization(context, customerRequest.getTemplateId(), company, organization);
            bridgeBaseMap.put(organization,orgChildren);
        }

        // Once all the calls have been started, iterate through the results to
        // build the return JSON. The Id and Name of the organization comes from 
        // the key of the bridgeBaseMap, while the childrenCount is found by 
        // iterating through the GroupBridge results and finding the amount of 
        // unique groups that were returned.
        for (Map.Entry<String,BridgeList<GroupBridge>> entry : bridgeBaseMap.entrySet()) {
            String organization = entry.getKey();
            BridgeList<GroupBridge> children = entry.getValue();

            ArrayList<String> groupList = new ArrayList<String>();
            for (GroupBridge groupBridge : children) {
                if (!groupList.contains(groupBridge.getGroupId())) {
                    groupList.add(groupBridge.getGroupId());
                }
            }

            Map<String,Object> item = new LinkedHashMap<String,Object>();
            item.put("id",organization);
            item.put("name",organization);
            item.put("childrenCount",groupList.size());
            items.add(item);
        }
    } else {
        if (parents.length == 2) {
            // If more than one parent parameter is passed in, the object returned 
            // will be a Group object. Also creating strings for the inputted parent
            // parameters for company and organization.
            String company = parents[0];
            String organization = parents[1];
            results.put("label","Group");

            // Making the bridge call to retrieve the groups under the inputted
            // company and organization hierarchy. The Bridge results are then
            // iterated through 
            BridgeList<GroupBridge> groupBridgeList = GroupBridge.findByCompanyAndOrganization(context, customerRequest.getTemplateId(), company, organization);
            ArrayList<String> groupIdList = new ArrayList<String>();
            for (GroupBridge groupBridge : groupBridgeList) {
                if (!groupIdList.contains(groupBridge.getGroupId())) {
                    groupIdList.add(groupBridge.getGroupId());
                    Map<String,Object> group = new LinkedHashMap<String,Object>();
                    group.put("id",groupBridge.getGroupId());
                    group.put("name",groupBridge.getGroupName());
                    group.put("childrenCount","0");
                    items.add(group);
                }
            }
        }
        // Currently, if the parents provided are greater than 2, it means that
        // it doesn't correspond to any group type and therefore empty json
        // will be returned
    }
}

// Adding the items(company, organization, or group) to the results and then
// returning with a 200 and the JSON. If the results hash doesn't have a
// label already, it means that no group type could be found, so there will
// be no items to add.
if (results.containsKey("label")) {
    results.put("items", items);
}

response.setStatus(HttpServletResponse.SC_OK);
response.getWriter().write(JsonUtils.toJsonString(results));        
%>
