<!DOCTYPE html>
<script type="text/javascript" src="./bootstrap/jquery.js"></script>
<script type="text/javascript" src="grad.js"></script>

<link rel="stylesheet" type="text/css" href="./bootstrap/bootstrap.css">
<link  rel="stylesheet" type="text/css"  href="./bootstrap/font-awesome/css/font-awesome.css">








<?php

//include_once('head.php');
?>

<BODY>
<nav class="navbar  bg-primary">
	

	
  <!-- Navbar content -->
</nav>



<div class=container>
<div class=row>
<div class="col-sm-8 col-sm-offset-2">

				<div class=well>
					
					<div class="panel panel-primary" id=div_login>
					<div class="panel-heading">
        <h5 class="modal-title ">Login</h5>
        </div>
				
			Username <input type=text class="form-control" id=txt_uname>
			Password <input type=password class="form-control" id=txt_passcode>
			
				<button type="button" class="btn btn-link" data-toggle="modal" data-target="#modalRegisteration">
 <p class="text-success">Register</p> 
</button>
	
	
					<button type="button" class="btn btn-primary" id=btn_login >
 Login
</button>			
				</div>

<div id=id_ajax_loading>

<i class="fa fa-snowflake-o" aria-hidden="true" style="color:red"></i>


</div>
<div id=div_ajax_login_response></div>

<div id=div_ajax_career_response></div>


</div>
</div>	
</div>	
</div>	
<!----------------------------------------------modal reg-----------------------------------  ->


<!-- Modal -->
<div class="modal fade"  id="modalRegisteration" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"  aria-hidden="true" style="margin-top: 3cm;">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header bg-primary">
        <h5 class="modal-title " id="exampleModalLabel">Registration</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        
        <div class="panel panel-primary">
  <div class="panel-body">
	  
	  

	 Username <input type=text class="form-control" id=txt_uname1>
	Password <input type=password class="form-control" id=txt_passcode1>
	Email <input type=text class="form-control" id=txt_email>
	Empcode <input type=text class="form-control" id=txt_empcode>
	Phone <input type=text class="form-control" id=txt_phone>
	  
	  
	  
	  </div>
  <div class="panel-footer">Viveks</div>
</div>
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" id=btn_register class="btn btn-primary">Register and Proceed to Log in</button>
      </div>
    </div>
  </div>
</div>






<!----------------------------------------------modal reg-----------------------------------  -->




	
	
	
	
	<div class=cent1>
	
	<?php
//include_once('1.php');?>

	</div>
	
	





<?php
//include_once('foot.php');?>
<script type="text/javascript" src="./bootstrap/bootstrap.js"></script>
