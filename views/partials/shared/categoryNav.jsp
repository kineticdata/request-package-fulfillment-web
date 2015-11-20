<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="../../../package/initialization.jspf" %>

<div id="tealnav">
  <div class="container">
    <div class="row">
        <ul>
          <c:forEach items="${kapp.categories}" var="category">
          	<li>
              <a class="hidden-xs" href="${bundle.spaceLocation}/${kapp.slug}/categories?category=${category.name}">${app:escape(category.name)} </a>
            </li>
          </c:forEach>
     	</ul>
    </div>
  </div>
</div>


         