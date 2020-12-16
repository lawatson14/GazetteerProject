//add a page loader until replaced by page information
function addLoader(id, type = "modal"){
	let className;
	if(type == "page"){
		className = 'pageLoader';
	} else {
		className = 'modalLoader';
	}
	document.getElementById(id).innerHTML =
		`<div class="align-middle text-center ${className}">
			<div class="spinner-border" role="status">
				<span class="sr-only">Loading...</span>
			</div>
		</div>`;
}

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

//get and render all Modal Information
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
			getInfo(infoResults1);
			
			//Ajax function to get finance based on country code at same time
			getFinance(infoResults1);
		},
		error: function(){
			$("#info").html(`<p>We are unable to locate your current position. Please accept our apologies.</p>`);
		}
	});

	//Getting weather information at same time
	getWeather(lat, lng);
}

//Get all country information and render inside info tab content
function getInfo(obj){
	$.ajax({
		"async": true,
		"global": false,
		"url": "php/getCountryByCode.php",
		"dataType": "json",
		"data": {
			'code': obj.data.results[0].components.country_code
		},
		success: function(infoResults2){
			//Ajax function to get photos of capital.
			getPhotos(infoResults2);

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
				<h5>Country</h5>
				<table class="table table-bordered">
					<tr>
						<th>Country</th>
						<td>${obj.data.results[0].components.country}</td>
					</tr>
					<tr>
						<th>Continent</th>
						<td>${obj.data.results[0].components.continent}</td>
					</tr>
					<tr>
						<th>Capital</th>
						<td>${infoResults2.data.capital}</td>
					</tr>
					<tr>
						<th>Country Codes</th>
						<td>${infoResults2.data.alpha2Code}, ${infoResults2.data.alpha3Code}, ${infoResults2.data.numericCode}</td>
					</tr>
					<tr>
						<th>Area</th>
						<td>${formatNumber(infoResults2.data.area)} km<sup>2</sup></td>
					</tr>
					<tr>
						<th>Neighbours</th>
						<td>${neighbours}</td>
					</tr>
					<tr>
						<th>Languages</th>
						<td>${languages}</td>
					</tr>
				</table>
				<br>
				<h5>Location</h5>
				<table class="table table-bordered">
					<tr>
						<th>Latitude</th>
						<td>${obj.data.results[0].geometry.lat}</td>
					</tr>
					<tr>
						<th>Longitude</th>
						<td>${obj.data.results[0].geometry.lng}</td>
					</tr>
					<tr>
						<th>Address</th>
						<td>${obj.data.results[0].formatted}</td>
					</tr>
					<tr>
						<th>What 3 Words</th>
						<td>${obj.data.results[0].annotations.what3words.words}</td>
					</tr>
				</table>
			`);
		},
		error: function(){
			$("#info").html(`<p>We are unable to locate your current position. Please accept our apologies.</p>`);
		}			
	});
}

//Get all country weather data and render inside weather tab content
function getWeather(lat, lng){
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
													<th scope="col">Direction</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td scope="row">${weatherResult.data.current.wind_speed} m/s</td>
													<td scope="row">${weatherResult.data.current.wind_deg}&#176</td>
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

//Get all country finance data and render inside finance tab content
function getFinance(obj){
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
			Cookies.set('gazetteerCurrency', obj.data.results[0].annotations.currency.iso_code);
			for (const [key, value] of Object.entries(financeResult.data)) {
				currencyOptions += `<option value="${key}">${value}</option>`;
			}
			$("#finance").html(`
				<h5>Currency</h5>
				<table class="table table-bordered">
					<tr>
						<th>Name</th>
						<td>${obj.data.results[0].annotations.currency.name}</td>
					</tr>
					<tr>
						<th>Symbol</th>
						<td>${obj.data.results[0].annotations.currency.symbol}</td>
					</tr>
					<tr>
						<th>Code</th>
						<td>${obj.data.results[0].annotations.currency.iso_code}</td>
					</tr>
				</table>
				<br>
				<h5>Exchange Calculator</h5>
				<form class="form-horizontal">
					<div class="form-group">
						<label class="contol-label col-xs-4" for="localCurrency">Local Currency:</label>
							<div class="col-xs-4">
								<input type="text" id="localCurrency" class="form-control" value="${obj.data.results[0].annotations.currency.name}" readonly>
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
					let local = Cookies.get('gazetteerCurrency');
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
}

//Get all country photos and render inside photos tab content
function getPhotos(obj){
	$.ajax({
		"async": true,
		"global": false,
		"url": "php/getPhotos.php",
		"dataType": "json",
		"data":{
			'key': "19548943-e455e89f002924eb9de8bd325",
			'city': obj.data.capital.toLowerCase(),
		},
		success: function(photoResults){
			//Populating Photos Tab
			if(photoResults.data.hits.length < 1){
				$("#photos").html(`<p>We are unable to provide any photos for ${obj.data.capital}. Please accept our apologies.</p>`);
			} else {
				let photos = `
					<div class="carousel-item active">
						<img src="${photoResults.data.hits[0].largeImageURL}" class="d-block w-100" alt="${obj.data.capital} by ${photoResults.data.hits[0].user}" title="${obj.data.capital}">
					</div>`;
				for(i = 1; i < photoResults.data.hits.length; i++){
					photos += `
						<div class="carousel-item">
							<img src="${photoResults.data.hits[i].largeImageURL}" class="d-block w-100" alt="${obj.data.capital} by ${photoResults.data.hits[i].user}" title="${obj.data.capital}">
						</div>`;
				}
				$("#photos").html(`
					<div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
						<div class="carousel-inner">${photos}</div>
						<a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
							<span class="carousel-control-prev-icon" aria-hidden="true"></span>
							<span class="sr-only">Previous</span>
						</a>
						<a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
							<span class="carousel-control-next-icon" aria-hidden="true"></span>
							<span class="sr-only">Next</span>
						</a>
					</div> `);
			}
		},
		error: function(){
			$("#photos").html(`<p>We are unable to provide any photos for ${obj.data.capital}. Please accept our apologies.</p>`);
		}
	});
}