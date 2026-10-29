<?php

include_once('head.php');
$slno=$_POST['slno'];
?>

<BODY>
	<div class=cent>

<?php
include_once('functions.php');

?>
<table>
<?php


#print_r ($_POST);

$slno=$_POST['slno'];
con();
$qry="select distinct count( * ) from ae where dob >= ( select distinct FIRST_DAY( dob)  from ae where slno=$slno ) and slno<$slno and 
dob> last_day(date_sub( CURDATE(),INTERVAL 56
YEAR ))  ;";

$res=mysql_query($qry);
	

	$row=mysql_fetch_row($res);
	$tot= $row[0];
	echo "<tr><td>Your Number in gradation list is : $slno</td></tr>";
	
	
	echo "<tr><td>Total number of seniors younger than you is :";
	echo "$tot</td></tr>";
	
	echo "<tr>";
	if ($tot<=6)
	
				echo "You can reach upto board member";
				
				elseif( $tot<=18)
				
						echo " You can reach upto chief enginner";
						
										elseif( $tot<=89)
										
																echo " you can reach upto DY chief enginner";


						elseif( $tot<=333)
										
																echo "you can reach upto Executive enginner";

						elseif( $tot<=1073)
										
																echo "you can reach upto  Asst Executive enginner";


	
	
	echo "</tr>";

#$qry="SELECT dob FROM `ae` WHERE dob>date_sub( CURDATE(),INTERVAL 56 YEAR ) and slno<$slno order by dob";
$qry="SELECT last_day(dob) as dob FROM `ae` WHERE  slno<$slno and dob <= ( select distinct dob from ae where slno=$slno ) order by dob";
#echo $qry;
$res=mysql_query($qry);
$pro1=0;$pro2=0;$pro3=0;$pro4=0;$pro5=0;
while($rw1=mysql_fetch_assoc($res))
{
	$ret=$rw1['dob'];
//echo "<br>".$ret."<br>";



#$qry1="select count(*) from ae where (dob>\"$ret\") and (dob>date_sub( CURDATE(),INTERVAL 56YEAR ))  and (slno<$slno)";
$qry1="select count(*) from ae where (dob>\"$ret\") and (slno<$slno) ";	
	
#echo $qry1;
$res1=mysql_query($qry1);
$row=mysql_fetch_row($res1);
$count1= $row[0];

#echo "<br>$ret is retirement date and count is $count1<br>";


#echo $count1.'<br>';
if ($count1<=$_POST[mem] and $pro5!=1)
{
echo "<br>Promotion 5 after  ";
$mod_date = strtotime($ret."+56 years");
echo date("d-m-Y",$mod_date) . "\n";

$pro5=1;}

elseif ($count1<=$_POST[mem]+$_POST[ce] and $pro4!=1)
{
echo "<br>Promotion 4 after";
$mod_date = strtotime($ret."+56 years");
echo date("d-m-Y",$mod_date) . "\n";

$pro4=1;}


elseif ($count1<=$_POST[mem]+$_POST[ce]+$_POST[mem]+$_POST[dyce] and $pro3!=1)
{
echo "<br>Promotion 3 after";
$mod_date = strtotime($ret."+56 years");
echo date("d-m-Y",$mod_date) . "\n";

$pro3=1;}


elseif ($count1<=$_POST[mem]+$_POST[ce]+$_POST[mem]+$_POST[dyce]+$_POST[ee] and $pro2!=1)
{
echo "<br>Promotion 2 after";
$mod_date = strtotime($ret."+56 years");
echo date("d-m-Y",$mod_date) . "\n";

$pro2=1;}


elseif ($count1<=$_POST[mem]+$_POST[ce]+$_POST[mem]+$_POST[dyce]+$_POST[ee]+$_POST[aee] and $pro1!=1)
{
echo "<br>Promotion 1 after ";
$mod_date = strtotime($ret."+56 years");
echo date("d-m-Y",$mod_date) . "\n";
#echo $ret;
$pro1=1;}
}
 
?>
	</table>

<?php
	
con();
$qry="select slno,name,dob from ae where dob > ( select distinct FIRST_DAY (dob) from ae where slno=$slno ) and slno<$slno ;";
//echo "here";
$res=mysql_query($qry);	

?>
<table border=1>

<?php

while($rw1=mysql_fetch_assoc($res))

echo "<tr> <td>".$rw1['slno']."</td><td>".$rw1['name']."</td><td>".$rw1['dob']."</td></tr>";

?>

</table>


</div>
	
	
</BODY>


<?php
include_once('foot.php');?>
