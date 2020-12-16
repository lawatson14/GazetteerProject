<?php

$url = 'https://restcountries.eu/rest/v2/all';
$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);
$value = curl_exec($ch);
$value = json_decode($value, true);
curl_close($ch);

//echo json_encode($value);
$data = array();
foreach($value as $country){
	$info = array(
		'code' => $country['alpha3Code'],
		'country' => $country['name'],
		'continent' => $country['region'],
		'region' => $country['subregion'],
		'capital' => $country['capital'],
		'flag' => $country['flag'],
		'population' => $country['population'],
		'area' => $country['area'],
	);
	array_push($data, $info);
}
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $data;

echo json_encode($output);
?>