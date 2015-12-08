<%@page pageEncoding="UTF-8" contentType="text/html" trimDirectiveWhitespaces="true"%>
<%@include file="../../../package/initialization.jspf" %>
<header class="header">
  <nav class="navbar navbar-default overlay mgn-none">
    <div class="container">
      <!-- Brand and toggle get grouped for better mobile display -->
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a href="${bundle.spaceLocation}/${kapp.slug}" id="logo" class="navbar-brand col-xs-6 col-sm-6 col-md-8 col-lg-9"></a>
      </div>

<!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul class="nav navbar-nav pull-right">
          <li>
            <a class="profile" href="javascript:void(0)" data-target="div.user-card">
              <i class="gravatar-icon">
                <img src="https://lh4.googleusercontent.com/-6RDPOohcFhI/AAAAAAAAAAI/AAAAAAAAAAw/3xMmdleVrLU/photo.jpg?sz=50" alt="Profile Image" class="avatar">
              </i>
            </a>
          </li>
          <li> 
            <p class="navName">Hello Mike</p>
            <div class="navAccount"><a href="${bundle.spaceLocation}/${kapp.slug}/profile-page">Your Account</a></div>
          </li>
          <li class="dropdown">          
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> 
              <i class="fa fa-th fa-3x"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-right">
              <c:forEach items="${space.kapps}" var="kapps">
                <li> 
                  <a href="/kinetic/${space.slug}/${kapps.slug}">
                    <div class="pull-right">${kapps.name}</div>
                  </a>
                </li>
              </c:forEach>
              <li class="visible-xs-inline-block"> 
                <form role="form"> 
                  <div class="form-group has-feedback">
                    <input type="text" class="form-control" placeholder="search"/>
                  </div>
                </form>
              </li>
            </ul>
          </li>
        </ul>
      </div><!-- /.navbar-collapse -->
    </div><!-- /.container -->
  </nav>
</header>

