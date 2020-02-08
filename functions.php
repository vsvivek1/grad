<?php

function con()

{
	
if(	mysql_connect('localhost','root'))
echo "";
else

echo "connection failed";



if (mysql_select_db('gradation'))
echo "";
		
}

function val($usr1,$pw)

{
	con();
	$qry="SELECT name FROM ae WHERE name=".$usr;
	
	$res=mysql_query($qry);
	
	
	
	$row=mysql_fetch_assoc($res);
	
	
	if($row['name']==$usr)
	
	return $row['sec_name'];
		
}

function sel()

{
	con();
	$qry="select slno,name,dob from ae where dob>date_sub( CURDATE(),INTERVAL 56 YEAR ) order by name";
	$res=mysql_query($qry);
	
	//print_r ($res);
	///while($row=mysql_fetch_assoc($res))
	
	//print_r($row);
	
	
	//
	return  $res;
	
	
	
}






?>

