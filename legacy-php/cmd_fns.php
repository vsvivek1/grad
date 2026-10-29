<?php
#session_start();
#print_r($_SESSION);
	if ($_SESSION['login']!=true)
	{
		echo "!!Error.. Wrong Login ID or Password";
		#include_once("login1.php");
	exit;
}
function db($qry)
{
	$con= pg_connect('host=localhost dbname=DIST user=postgres password=');
	$result = pg_query($qry);
	return $result;
	}
	
	function getval($ar)

{
	con();
	
	
	$qry="select code,name from sec_codes where dist_id=$ar";
	$result=pg_query($qry);
	
	return $result;
	 
		
}

function getvalnew($ar,$cod)

{
	
	con();
	$qry1="select disp_id from display where disp_var='$ar'";
	$result1=pg_query($qry1);
	$id1=pg_fetch_assoc ($result1);
	$id=$id1['disp_id'];
	
	
	$qry="select value from sec_code1 where code=$cod and disp_id=$id";
	$result=pg_query($qry);
	$poocha= pg_fetch_assoc($result);//['value'];
	return $poocha['value'];
}
	
function write_old($ar,$dist)
{
	
	#print_r ($ar);
	con();
	#$qry1="select count(*) from information_schema.columns where table_name='sec_codes' and column_name='$ar'";
	#$result=pg_query($qry1);
	#if(pg_fetch_row($result)[0]!=0)
	#{
		$qry="insert into sec_codes (id,code,name,lc,dist_id) values ($ar[code],$ar[code],'$ar[name]',$ar[lc],$dist)";
		echo $qry;
		
		#echo "code is $ar[code]";
		
		$result=pg_query($qry);
	#}
	
}	
	
	
	

function getvalold($ar,$cod)
{
	con();
	switch ($ar)
		
		{
		
		case "sec_sub":
		$qry="select name from offices where code=(Select higher_office_id from offices where code='$cod')";
		$res=pg_query($qry);
		$r=pg_fetch_assoc($res);
		

		return $r['name'];
		
		break;
		case "sec_div":
		
		$qry="select name from offices where code=(select higher_office_id from offices where code=(Select higher_office_id from offices where code='$cod'))
";
		$res=pg_query($qry);
		$r=pg_fetch_assoc($res);
		

		return $r['name'];
		
		
		break;
		
		case "sec_cir":
		
		$qry="select name from offices where code=(select higher_office_id from offices where code=(select higher_office_id from offices where code=(Select higher_office_id from offices where code='$cod')))
";
		$res=pg_query($qry);
		$r=pg_fetch_assoc($res);
		

		return $r['name'];
		break;
		
		default:
	
	$qry1="select count(*) from information_schema.columns where table_name='sec_codes' and column_name='$ar'";
	$result=pg_query($qry1);
	$r=pg_fetch_row($result);
	if($r[0]==0)
			return "";
			else{
		
		
		
		
	$qry="select $ar from sec_codes where code=$cod";
	$result=pg_query($qry);
	$r=pg_fetch_assoc($result);
	return $r[$ar];
	break;
	
}
}


}



function get_hgr()

{
	
}

function dbwrite($qry)

{
	con();
	#echo $qry;
	$result = pg_query($qry);
	return $result;
	
}

function disp($sec_code)

{
	
$qry="select disp_id,value from sec_code1 where code=$sec_code";
$res=pg_query($qry);

#echo $qry;

echo "<table border=1>";
while ($ar=pg_fetch_assoc($res))

{
	
	echo "<tr>";
	echo "<td>".ad($ar['disp_id'])."</td>"."<td>".$ar['value']."</td>";
	
	echo "</tr>";
}
echo "</table>";
exit;
return;

}

function con()

{
	$con= pg_connect('host=localhost dbname=DIST user=postgres password=');
	
	return $con;

	
}

function show_updated($cod)

{
	$qry="select * from sec_code1 where code=$cod";
	
	pg_query($qry);
	echo "<table><tr>";
	while($arr=pg_fetch_array($qry))
	
	{
		echo "<td>"."</td>";
	}
	
	
}
	
	
	function ad($ar)
	
	{
		con();
		
		$qry="select disp_name from display where disp_id=$ar";
		$res=pg_query($qry);
		
		$r= pg_fetch_assoc($res);
		return $r['disp_name'];
	}
	
	function disp_nam($key)
	
	{
		con();
		$qry="select disp_name from display where disp_var='$key'";
		$res=pg_query($qry);
		$r= pg_fetch_assoc($res);
		return $r['disp_name'];
	}
?>
