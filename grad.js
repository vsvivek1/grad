var url="grad_ajax.php";
$("#id_ajax_loading").hide();

function show_ajax_loading_image()  
	{
		
	
	$("#id_ajax_loading").css("display","block");
	
	}
	
	
	function stop_ajax_loading_image()
	{
		
		
	$("#id_ajax_loading").hide();
	}	


$(document).on("click","#btn_register",function(){
	
	
	
	
	var user_name=$("#txt_uname1").val();
	var pass_word=$("#txt_passcode1").val();
	
	
	var email=$("#txt_email").val();
	var empcode=$("#txt_empcode").val();
	var phone=$("#txt_phone").val();
	
	
	
	if(user_name=="" || pass_word=="" || email=="" || empcode=="" || phone=="") 
		{
		alert("Please fill all the required details for Registration");
		return false;
	}
	
	 $.ajax({
       url: url,
       type: 'POST',
       data:{user_name:user_name,pass_word:pass_word,email:email,empcode:empcode,phone:phone,option:"register"},
           
        beforeSend: show_ajax_loading_image(),
		complete: stop_ajax_loading_image(),
      
      
       success: function (response) {
		   
		   
		   $("#div_ajax_login_response").html(response);
		  $('#modalRegisteration').modal('toggle');
		  var res=response.split("***");
		  //alert(res[0]);
		  if(res[1]==1)
		  
		  $("#div_login").hide();
		   
		   
         
         
       }
   });
	
		
	
	}

);














$(document).on("click","#btn_login",function(){
	
	var user_name=$("#txt_uname").val();
	var pass_word=$("#txt_passcode").val();
	
	
	 $.ajax({
       url: url,
       type: 'POST',
       data:{user_name:user_name,pass_word:pass_word,option:"logIn"},
           
        beforeSend: show_ajax_loading_image(),
		complete: stop_ajax_loading_image(),
      
      
       success: function (response) {
		   
		   
		   $("#div_ajax_login_response").html(response);
		   $("#div_login").hide();
		   var res=response.split("!");
		   if(!res[0]=="Login failed")
		   $("#div_login").hide();
		   
		   
         
         
       }
   });
	
		
	
	}

);

$(document).on("click","#btn_career",function(){
	
	var employee=$("#sel_emp").val();
	var mem=$("#txt_mem").val();
	var ce=$("#txt_ce").val();
	var dyce=$("#txt_dyce").val();
	var ee=$("#txt_ee").val();
	var aee=$("#txt_aee").val();
	
	
	
	
	 $.ajax({
       url: url,
       type: 'POST',
       data:{employee:employee,aee:aee,ee:ee,dyce:dyce,ce:ce,mem:mem,option:"show_career"},
           
        beforeSend: show_ajax_loading_image(),
		complete: stop_ajax_loading_image(),
      
      
       success: function (response) {
		   
		   
		   $("#div_ajax_career_response").html(response);
		   $("#div_login").hide();
		   
		   
         
         
       }
   });
	
		
	
	}

);
