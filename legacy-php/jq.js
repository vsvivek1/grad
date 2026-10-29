$(document).ready(


function()

{
	$("#tb").hide();
	$("li.old").hide();
	$("li.nw").hide();
	
	$("h2").click(	function(){

	
	//$(this).hide(1000);
	$(".li").css("background-color","white");
	$(".old").show(1000);
	//$(this).show(1000);
	$(this).text("Welcome to RITU KKD Data bank of sections");
	$(this).css("background-color","red");
	$(this).hide(5000,function()
	
	{$("#tb").show(1000)});
		
		}
		
		
	)



$("table").mouseenter( function(){
$(this).css("background-color","orange");
}
);

$("table").mouseleave( function(){
$(this).css("background-color","green");
}
);
$(".old").show(1000);

$("li").mouseenter( function()
{
	
$("li").css("background-color","cyan");
}
)


$("li.old").hover( function()
{
	
$(this).css("background-color","yellow");
}
)

$(".target").change( function()
{
$(".opt").hide(1000);
$(".opt").show(2000);
}
)


$("li.old").mouseenter(function()

{
	$("li.nw").show(5000);
	})


$("li.old").mouseout(function()

{
	$("li.nw").hide(10000);
	})
}
)
