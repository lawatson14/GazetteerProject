<?php
$key = '15ad3a71ed64363e2e8be33a1824eb3d';
$exclude='minutely,alert';
//$_REQUEST['lat'] = '62.754';
//$_REQUEST['lng'] = '117.070312';


$url = 'https://api.openweathermap.org/data/2.5/onecall?lat='.$_REQUEST['lat'].'&lon='.$_REQUEST['lng'].'&exclude='.$exclude.'&units=metric&appid='.$key;
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
$value = curl_exec($ch);
$value = json_decode($value, true);
curl_close($ch);

//print_r($value);

$data = array(
	'current' => $value['current'],
	'hourly' => $value['hourly'],
	'daily' => $value['daily'],
	'timzone_offset' => $value['timezone_offset'],
);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $data;

echo json_encode($output);

?>