<?php
//$_REQUEST['key'] = '19548943-e455e89f002924eb9de8bd325';
//$_REQUEST['city'] = 'london';

$url = 'https://pixabay.com/api/?key='.$_REQUEST['key'].'&q='.$_REQUEST['city'].'&image_type=photo&pretty=true';
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