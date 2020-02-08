<html>
<?php

include_once('functions.php');
con();

?>
<table align=center>
<form name=frm method=post action=show.php>
	
	<table>
	<tr><td>Enter Number of Expected Board Members            :</td><td> <input type=text class=form-control name=mem value=2 ></td></tr>
	<tr><td>Enter Number of Expected Cheif Engineers          :</td><td> <input type=text class=form-control name=ce value=12 ></td></tr>
	<tr><td>Enter Number of Expected Dy Cheif Engineers  	  :</td><td> <input type=text class=form-control name=dyce value=60 ></td></tr>
	<tr><td>Enter Number of Expected Executive Engineers      :</td><td> <input type=text class=form-control name=ee value=240 ></td></tr>
	<tr><td>Enter Number of Expected Asst Executive Engineers :</td><td> <input type=text class=form-control name=aee value=741></td></tr>
	<tr><td></td></tr>
	
	
	
	
	
</table>
<tr><td>Select your name :</td><td> <select name=slno >


<?php

$res=sel();		
	while($row=mysql_fetch_assoc($res)) 
		{
		?>
		
			<option value=<?php echo $row['slno']?>><?php echo $row['name']?> </option>				

<?php	
}?>
</td><td>
<input type=submit name=sub value =career>
</td></tr>
</table>
</form>
</html>



