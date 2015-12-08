<!DOCTYPE html>
<html>
    <head>
        <title>Test API Routes!</title>
    </head>
    <body>
        <h3>Http GET Actions</h3>
        <ul>
            <li><a href="?name=fulfillment&call=/v1/assignment/groups">Assignment Groups</a></li>
            <li><a href="?name=fulfillment&call=/v1/assignment/members">Assignment Members</a></li>
            <li><a href="?name=fulfillment&call=/v1/work-orders/filters">Work Order Filters</a></li>
            <li><a href="?name=fulfillment&call=/v1/work-orders">Work Orders</a></li>
            <li><a href="?name=fulfillment&call=/v1/work-orders/1/logs">Work Order Logs -- Id == 1</a></li>
            <li><a href="?name=fulfillment&call=/v1/work-orders/1/view">Work Order View -- Id == 1</a></li>
        </ul>
        <br>
        <h3>Http POST Actions</h3>
        <ul>
            <li>Work Order -- Assign</li>
            <li>Work Order -- Add Note</li>
        </ul>
    </body>
</html>