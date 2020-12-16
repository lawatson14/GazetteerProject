<?php
//$_REQUEST['lat'] = '51.25262';
//$_REQUEST['lng'] = '-0.15132';

$url = 'https://api.opencagedata.com/geocode/v1/json?q='.$_REQUEST['lat'].'+'.$_REQUEST['lng'].'&key=48fc00fa55d245e4b48e11344268a4f4';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
$result = curl_exec($ch);
curl_close($ch);
$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode;
	
echo json_encode($output);

?>
