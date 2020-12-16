//Easy read number format
function formatNumber(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

//get time from unix code
function unixGetTime(unix, option = {timeStyle: "medium", hour12: false}){
	let ms = unix * 1000;
	let dateObj = new Date(ms);
	let dateFormat = dateObj.toLocaleString("en-UK", option);
	return dateFormat
}

function getModal(lat, lng){
	//displaying modal
	$('#myModal').modal('show');
	
	//Adding loaders to modal
	addLoader("info");
	addLoader("weather");
	addLoader("finance");
	addLoader("photos");

	//Ajax function to get Location by Coords
	$.ajax({
		"async": true,
		"global": false,
		"url": "php/getLocationByCoords.php",
		"dataType": "json",
		"data": {
			'lat': lat,
			'lng': lng,
		},
		success: function(infoResults1){

			//Ajax function to get location information based on country code returned by previous call.
			$.ajax({
				"async": true,
				"global": false,
				"url": "php/getCountryByCode.php",
				"dataType": "json",
				"data": {
					'code': infoResults1.data.results[0].components.country_code
				},
				success: function(infoResults2){
					//Ajax function to get photos of capital.
					$.ajax({
						"async": true,
						"global": false,
						"url": "php/getPhoto.php",
						"dataType": "json",
						"data":{
							'city': infoResults2.data.capital.toLowerCase(),
						},
						success: function(photoResults){

							//Populating Photos Tab
							if (photoResults.data.photo == null){
								$("#photos").html(`<p>We are unable to provide any photos for ${infoResults2.data.capital}. Please accept our apologies.</p>`);	
							} else {
								$("#photos").html(
									`<picture>
									<source media="(min-width: 768px" srcset="${photoResults.data.photo.image.web}">
									<source media="(min-width: 320px" srcset="${photoResults.data.photo.image.mobile}">
									<img src="${photoResults.data.photo.image.web}" title="${infoResults2.data.capital} by ${photoResults.data.photo.attribution.photographer} ${photoResults.data.photo.attribution.mobile}" alt="${infoResults2.data.capital}" width="100%" height="auto">
									</picture>`
								);
							}
						},
						error: function(){
							$("#photos").html(`<p>We are unable to provide any photos for ${infoResults2.data.capital}. Please accept our apologies.</p>`);
						}
					});

					//Populating Info Tab
					let languages = "" , neighbours = "";
					infoResults2.data.borders.forEach(function(value){
						neighbours += value + ", ";
					});
					neighbours = neighbours.substring(0, neighbours.length - 2);
					infoResults2.data.languages.forEach(function(value){
						languages += value.name + ", ";
					});
					languages = languages.substring(0, languages.length - 2);
					$("#info").html(`
						<br>
						<h5>Country</h5>
						<ul class="list-group">
							<li class="list-group-item"><span>Country: </span>${infoResults1.data.results[0].components.country}</li>
							<li class="list-group-item"><span>Continent: </span>${infoResults1.data.results[0].components.continent}</li>
							<li class="list-group-item"><span>Capital: </span>${infoResults2.data.capital}</li>
							<li class="list-group-item"><span>Country Codes: </span>${infoResults2.data.alpha2Code}, ${infoResults2.data.alpha3Code}, ${infoResults2.data.numericCode}</li>
							<li class="list-group-item"><span>Population: </span>${formatNumber(infoResults2.data.population)} people</li>
							<li class="list-group-item"><span>Area: </span>${formatNumber(infoResults2.data.area)} km<sup>2</sup></li>
							<li class="list-group-item"><span>Neighbours: </span>${neighbours}</li>
							<li class="list-group-item"><span>Languages: </span>${languages}</li>
						</ul>
						<br>
						<h5>Location</h5>
						<ul class="list-group">
							<li class="list-group-item"><span>Latitude: </span>${infoResults1.data.results[0].geometry.lat}</li>
							<li class="list-group-item"><span>Longitude: </span>${infoResults1.data.results[0].geometry.lng}</li>
							<li class="list-group-item"><span>Address: </span>${infoResults1.data.results[0].formatted}</li>
							<li class="list-group-item"><span>What 3 Words: </span>${infoResults1.data.results[0].annotations.what3words.words}</li>
						</ul>
					`);
				},
				error: function(){
					$("#info").html(`<p>We are unable to locate your current position. Please accept our apologies.</p>`);
				}			
			});


			//Ajax function to get finance based on country code at same time
			$.ajax({
				"async": true,
				"global": false,
				"url": "php/getFinanceCurrencies.php",
				"dataType": "json",
				"data": {
					key: "811adb11dbf9410e92c7eaf40b2b34a8",
				},
				success: function(financeResult){
					let currencyOptions = '<option value="" disabled selected >Select Currency</option>';
					Cookies.set('currency', infoResults1.data.results[0].annotations.currency.iso_code);
					for (const [key, value] of Object.entries(financeResult.data)) {
						currencyOptions += `<option value="${key}">${value}</option>`;
					}
					$("#finance").html(`
						<br>
						<h5>Currency</h5>
						<ul class="list-group">
							<li class="list-group-item"><span>Name:</span> ${infoResults1.data.results[0].annotations.currency.name}</li>
							<li class="list-group-item"><span>Symbol:</span> ${infoResults1.data.results[0].annotations.currency.symbol}</li>
							<li class="list-group-item"><span>Code:</span> ${infoResults1.data.results[0].annotations.currency.iso_code}</li>
						</ul>
						<br>
						<h5>Exchange Calculator</h5>
						<form class="form-horizontal">
							<div class="form-group">
								<label class="contol-label col-xs-4" for="localCurrency">Local Currency:</label>
									<div class="col-xs-4">
										<input type="text" id="localCurrency" class="form-control" value="${infoResults1.data.results[0].annotations.currency.name}" readonly>
									</div>
									<div class="col-xs-4">
										<input type="number" id="localValue" class="form-control" value="1">
									</div>
								</div>
								<div class="form-group">
									<label class="contol-label col-xs-4">Select Currency:</label>
									<div class="col-xs-4">
										<select id="exchangeCurrency" class="form-control">${currencyOptions}</select>
									</div>
									<div class="col-xs-4">
										<input type="number" id="exchangeValue" class="form-control" readonly>
									</div>
								</div>
							</form>
					`);
					function exchange(){
						if($("#exchangeCurrency").val() == null){
							alert("Please select an exchange currency.");
						} else {
							let usd = 1;
							let local = Cookies.get('currency');
							let localVal = $("#localValue").val();
							let exchangeCurrency = $("#exchangeCurrency").val();
							$.ajax({
								"async": true,
								"global": false,
								"url": "php/getFinanceExchange.php",
								"dataType": "json",
								"data": {
									key: "811adb11dbf9410e92c7eaf40b2b34a8",
								},
								success: function(exchange){
									//getting USD value by local exchange rate
									for (const [key, value] of Object.entries(exchange.data.rates)) {
										if(key == local){
											tempUSD = localVal / value;
										}
									}
									//Converting USD to excahnge currency
									for (const [key, value] of Object.entries(exchange.data.rates)) {
										if(key == exchangeCurrency){
											exchangeValue = tempUSD * value;
										}
									}
									//Rendering output to user
									$("#exchangeValue").val(exchangeValue);					
								},
								error: function(){
									console.log("error");
								}
							});
						}
					}
					
					//Calling Exchange Function on Currency Change or Value input	
					$("#exchangeCurrency").change(function(){
						exchange();
					});
					$("#localValue").keyup(function(){
						exchange();
					});					
				},
				error: function(){
					$("#finance").html(`<p>We are unable to provide financial information for your current location. Please accept our apologies.</p>`);
				}
			});
		},
		error: function(){
			$("#info").html(`<p>We are unable to locate your current position. Please accept our apologies.</p>`);
		}
	});


	//Getting weather information at same time
	$.ajax({
		"async": true,
		"global": false,
		"url": "php/getWeather.php",
		"dataType": "json",
		"data":{
			'lat': lat,
			'lng': lng,
		},
		success: function(weatherResult){
			let hourly = weatherResult.data.hourly;
			let time;
			if(24 - unixGetTime(hourly[0].dt, {hour: "2-digit", hour12: false}) == 0){
				time = 24;
			} else {
				time = 24 - unixGetTime(hourly[0].dt, {hour: "2-digit", hour12: false});
			}

			//generating daily forecast
			let hourlyRow = "";
			for (let i = 0; i < time; i++){
				hourlyRow += `<td>${unixGetTime(hourly[i].dt, {timeStyle: "short", hour12: false})}<br><img src="https://openweathermap.org/img/wn/${hourly[i].weather[0].icon}@2x.png" title="${hourly[i].weather[0].description}" alt="${hourly[i].weather[0].description} image" width="50px" height="auto"><br>${hourly[i].temp}&#8451</td>`;
			}

			//generating daily forecast
			let daily = weatherResult.data.daily;	
			let dailyRow = "";
			for (i = 0; i < daily.length; i++){
				dailyRow += `<td>${unixGetTime(daily[i].dt, {weekday: "short"})}<br><img src="https://openweathermap.org/img/wn/${daily[i].weather[0].icon}@2x.png" title="${daily[i].weather[0].description}" alt="${daily[i].weather[0].description} image" width="50px" height="auto"><br>${daily[i].temp.day}&#8451</td>`;
			}

			//populating Weather Content
			$("#weather").html(`
				<br>
				<h5>Now</h5>
				<ul class="list-group">
					<li class="list-group-item"><span>Report Time: </span>${unixGetTime(weatherResult.data.current.dt)}</li>
					<li class="list-group-item"><img src="https://openweathermap.org/img/wn/${weatherResult.data.current.weather[0].icon}@2x.png" title="${weatherResult.data.current.weather[0].description}" alt="${weatherResult.data.current.weather[0].description} image">
						<br>${weatherResult.data.current.weather[0].description} 
						<br><span>Temp: </span>${weatherResult.data.current.temp}&#8451
						<br><span>Feels Like: </span>${weatherResult.data.current.feels_like}&#8451
						<div class="accordion" id="accordionExample">
							<div class="card">
								<div class="card-header" id="headingOne">
									<h2 class="mb-0">
										<button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#temperature" aria-expanded="true" aria-controls="temperature">Temperature</button>
									</h2>
								</div>
								<div id="temperature" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
									<div class="card-body">
										<div class="table-responsive">
				        					<table class="table table-bordered">
												<thead>
													<tr>
														<th scope="col">Current</th>
														<th scope="col">Max</th>
														<th scope="col">Min</th>
														<th scope="col">Morning</th>
														<th scope="col">Day</th>
														<th scope="col">Evening</th>
														<th scope="col">Night</th>
													</tr>
												</thead>
												<tbody>
													<tr>
														<td scope="row">${daily[0].temp.max}&#8451</td>
														<td scope="row">${daily[0].temp.max}&#8451</td>
														<td scope="row">${daily[0].temp.min}&#8451</td>
														<td scope="row">${daily[0].temp.morn}&#8451</td>
														<td scope="row">${daily[0].temp.day}&#8451</td>
														<td scope="row">${daily[0].temp.eve}&#8451</td>
														<td scope="row">${daily[0].temp.night}&#8451</td>
													</tr>
												</tbody>
											</table>
										</div>
			      					</div>
			    				</div>
			  				</div>
			  				<div class="card">
								<div class="card-header" id="headingTwo">
									<h2 class="mb-0">
										<button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#sun" aria-expanded="true" aria-controls="sun">Sun</button>
									</h2>
								</div>
								<div id="sun" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
									<div class="card-body">
			        					<table class="table table-bordered">
											<thead>
												<tr>
													<th scope="col">Sunrise</th>
													<th scope="col">Sunset</th>
													<th scope="col">UV Index</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td scope="row">${unixGetTime(weatherResult.data.current.sunrise)}</td>
													<td scope="row">${unixGetTime(weatherResult.data.current.sunset)}</td>
													<td scope="row">${weatherResult.data.current.uvi}</td>
												</tr>
											</tbody>
										</table>
			      					</div>
			    				</div>
			  				</div>
			  				<div class="card">
								<div class="card-header" id="headingThree">
									<h2 class="mb-0">
										<button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#wind" aria-expanded="true" aria-controls="wind">Wind</button>
									</h2>
								</div>
								<div id="wind" class="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
									<div class="card-body">
			        					<table class="table table-bordered">
											<thead>
												<tr>
													<th scope="col">Speed</th>
													<th scope="col">Sunset</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td scope="row">${unixGetTime(weatherResult.data.current.wind_speed)}</td>
													<td scope="row">${unixGetTime(weatherResult.data.current.wind_deg)}</td>
												</tr>
											</tbody>
										</table>
			      					</div>
			    				</div>
			  				</div>
			  			</div>			
					</li>
				</ul>
				<br>
				<h5>Hourly Forecast</h5>
				<div class="table-responsive">
					<table class="table table-bordered">
						<tbody>
							<tr>${hourlyRow}</tr>
						</tbody>
					</table>
				</div>
				<h5>Daily Forecast</h5>
				<div class="table-responsive">
					<table class="table table-bordered">
						<tbody>
							<tr>${dailyRow}</tr>
						</tbody>
					</table>
				</div>
			`);
		},
		error: function(){
			$("#weather").html(`<p>We are unable to provide a weather forecast at this current time. Please accept our apologies.</p>`);  
		}
	});
}