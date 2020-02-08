<?php
session_start();
include_once('functions.php');

function log_him($user,$emp){
	
	$qry="insert into log (user,emp) values('$user',$emp)";
	
	//echo $qry;
	con();
connect();
$res=mysql_query($qry);

	
	}

function show_career_form(){
	
	{

con();

?>

<table align=center>

	
	<table class="table table-stripped table-bordered">
	<tr><td>Enter Number of Expected Board Members            :</td><td> <input type=text class=form-control id=txt_mem name=mem value=4 ></td></tr>
	<tr><td>Enter Number of Expected Cheif Engineers          :</td><td> <input type=text class=form-control id=txt_ce  name=ce value=16 ></td></tr>
	<tr><td>Enter Number of Expected Dy Cheif Engineers  	  :</td><td> <input type=text class=form-control id=txt_dyce  name=dyce value=75 ></td></tr>
	<tr><td>Enter Number of Expected Executive Engineers      :</td><td> <input type=text class=form-control id=txt_ee  name=ee value=240 ></td></tr>
	<tr><td>Enter Number of Expected Asst Executive Engineers :</td><td> <input type=text class=form-control id=txt_aee  name=aee value=741></td></tr>
	
	
	
	
	
	
</table>

<tr><td>Select your name :</td><td> <select id=sel_emp name=slno class=form-control>


<?php

$res=sel();		
	while($row=mysql_fetch_assoc($res)) 
		{
		?>
		
			<option value=<?php echo $row['slno']?>><?php echo $row['name']?> </option>				

<?php	
}?>
</td><td>
<input type=hidden name=sub value =career> 




</td></tr>
</table>

<button class="btn btn-success" id=btn_career>Career</button>


<?php
	
}
	}





function connect(){
	
	


															if($_SERVER[HTTP_HOST]=="localhost")
	{
								$servername="localhost";
								$username="root";
								$password="";
								$dbname="kseb";
	} else
	{
	

								/*$servername="mysql.hostinger.in";
								$username="u619046258_ea";
								$password="idea@1234";
								$dbname="u619046258_ea";	
								
								/*
								$servername="localhost";
								$username="root";
								$password="";
								$dbname="ksebea";	
								*/		
								
								
							}	
// Create connection

$servername="localhost";
								$username="root";
								$password="";
								$dbname="gradation";
$conn = new mysqli($servername, $username, $password,$dbname);
return $conn;
}
	 function validate_user($loginName,$secret)
		{
			
			
			
	
															if($_SERVER[HTTP_HOST]=="localhost")
	{
								$servername="localhost";
								$username="root";
								$password="";
								$dbname="gradation";
	} else
	{
	

								/*$servername="mysql.hostinger.in";
								$username="u619046258_ea";
								$password="idea@1234";
								$dbname="u619046258_ea";	
								
								/*
								$servername="localhost";
								$username="root";
								$password="";
								$dbname="ksebea";	
								*/		
								
								
							}		
			
			
			if ($conn->connect_error) {
										    die("Connection failed: " . $conn->connect_error);
									  }
									  else
							{
								$qry="select * from users where user_name='$loginName' and pass_word='$secret'";
								
								
								$conn = new mysqli($servername, $username, $password,$dbname);
								$result = $conn->query($qry);
	//echo $qry;
									if ($result->num_rows > 0) 
								
										{
							   
											$row = $result->fetch_assoc(); 
											
											//print_r($row);
							                if($row["user_name"]==$loginName and $row["pass_word"]==$secret)
							                  {
			///login is true
												
												$_SESSION['login']=true;
												$_SESSION['user']=$row["user_name"];
												//$_SESSION['menus']=$row["menus"];
												//$_SESSION['unit']=$row["unit"];
												//$_SESSION['user']=$row["menus"];
												
												
												?>
												<div class="alert alert-success">
  <strong>Welcome <?php echo $_SESSION['user'];?></strong> 
</div>
 <?php
												
												
												
												
												return true;
												
												}
			
												
    
    
    
    
											}
											else {
												
												
												
												?>
												<div class="alert alert-danger">
  <strong>Login failed!</strong> Wrong user credentials or no user registered
</div>
 <?php
										
								return false;
	
	
												}
											$conn->close();
											}
		
		
		
		
									}






	
switch ($_POST[option]){


case "register":
con();
connect();

$user_name=$_POST[user_name];
$pass_word=$_POST[pass_word];
$email=$_POST[email];
$phone=$_POST[phone];
$empcode=$_POST[empcode];

$user_name=($user_name == null) ? 0 : $user_name;
$pass_word=($pass_word == null) ? 0 : $pass_word;
$email=($email == null) ? 0 : $email;
$phone=($phone == null) ? 0 : $phone;
$empcode=($empcode == null) ? 0 : $empcode;

$qry="insert into users (user_name,pass_word,email,phone,empcode) values

('$user_name','$pass_word','$email','$phone','$empcode')";

//echo $qry;
$res=mysql_query($qry);

$loginName=$_POST[user_name];
$secret=$_POST[pass_word];

$login=validate_user($loginName,$secret);
if($login)
{
	
	show_career_form();
	
	echo "***1";
}




break;



case "show_career":

?>
<table>
<?php

$servername="localhost";
								$username="root";
								$password="";
								$dbname="gradation";
$conn = new mysqli($servername, $username, $password,$dbname);
#print_r ($_POST);

$slno=$_POST['employee'];

//print_r($_SESSION);
log_him($_SESSION[user],$slno);
//con();
//connect();
$qry="select distinct count( * ) from ae where dob >= ( select distinct FIRST_DAY( dob)  from ae where slno=$slno ) and slno<$slno and 
dob> last_day(date_sub( CURDATE(),INTERVAL 56
YEAR ))  ;";

//echo $qry;
//$res=$conn->query($qry);
	

	//$row=mysql_fetch_row($res);
	
$res=mysql_query($qry);
$row=mysql_fetch_row($res);
	
	
	$tot= $row[0];
	echo "<tr><td>Your Number in gradation list is : $slno</td></tr>";
	
	
	echo "<tr><td>Total number of seniors younger than you is :";
	echo "$tot</td></tr>";
	
	echo "<tr>";
	if ($tot<=$_POST[mem])
	
				echo "You can reach upto board member";
				
				elseif( $tot<=($_POST[mem]+$_POST[ce]))
				
						echo " You can reach upto chief enginner";
						
										elseif( $tot<=($_POST[mem]+$_POST[ce]+$_POST[dyce]))
										
																echo " You can reach upto DY chief enginner";


						elseif( $tot<=($_POST[mem]+$_POST[ce]+$_POST[dyce]+$_POST[ee]))
										
																echo "You can reach upto Executive enginner";

						elseif( $tot<=($_POST[mem]+$_POST[ce]+$_POST[dyce]+$_POST[ee]+$_POST[aee]))
										
																echo "You can reach upto  Asst Executive enginner";


	
	
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
connect();
$qry="select slno,name,dob from ae where dob > ( select distinct FIRST_DAY (dob) from ae where slno=$slno ) and slno<$slno ;";
//echo "here";
$res=mysql_query($qry);	

?>
<table class="table table-bordered table-stripped"border=1>

<?php

function callClass($count){
	
	if($count<=$_POST[aee]) $class= "text-primary";
	if($count<=$_POST[ee]) $class= "text-success";
	if($count<=$_POST[dyce]) $class= "text-info";
	if($count<=$_POST[ce]) $class= "text-warning";
	if($count<=$_POST[mem]) $class= "text-danger";
	
	echo $class;
	
	
}


$count=0;
while($rw1=mysql_fetch_assoc($res))
{?>
 
 <tr class=<?php callClass($count); ?>> 
 
 
<?php 
$count++;
 echo "<td>$count</td> <td>".$rw1['slno']."</td><td>".$rw1['name']."</td><td>".implode("-",array_reverse(explode("-",$rw1['dob'])))."</td></tr>";




}

break;



	
case "logIn":
include_once("class.php");
$loginName=$_POST[user_name];
$secret=$_POST[pass_word];

$login=validate_user($loginName,$secret);
if($login)
{
	show_career_form();
}

else

{
	//echo "show failed";
}

break;
	
	
	
	
	
	
	
	
	
	
	}




?>
