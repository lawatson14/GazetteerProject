<?php
//$_REQUEST['key'] = '811adb11dbf9410e92c7eaf40b2b34a8';

$url = 'https://openexchangerates.org/api/currencies.json?app_id='.$_REQUEST['key'];
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
$value = curl_exec($ch);
$value = json_decode($value, true);
curl_close($ch);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $value;

echo json_encode($output);
?>