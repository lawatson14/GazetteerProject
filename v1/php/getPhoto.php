<?php
//$_REQUEST['city'] = 'london';

$url = 'https://api.teleport.org/api/urban_areas/slug:'.$_REQUEST['city'].'/images/';
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
$value = curl_exec($ch);
$value = json_decode($value, true);
curl_close($ch);

//print_r($value['photos'][0]);


$data = array(
	'photo' => $value['photos'][0],
);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $data;

echo json_encode($output);

?>