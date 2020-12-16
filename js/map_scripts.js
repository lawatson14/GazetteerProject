function displayMap(){
	$.ajax({
	   	"async": false,
	   	"global": false,
	   	"url": "js/countryBorders.geo.json",
	   	"dataType": "json",
	   	success: function(geoBorders){
	   		//Display Map
	   		$.ajax({
				"async": true,
				"global": false,
				"url": "php/getAllCountries.php",
				"dataType": "json",
				success: function(allCountries){
					//Styles
					let defaultStyle = { weight: 2, opacity: 1, color: '#fff', dashArray: '5', fillOpacity: 0, fillColor: '#fff'}
					let activeStyle = { weight: 3, color: '#666', dashArray: '', fillOpacity: 0, fillColor: '#fff',}				
					
					//Updating geoBoarders Properties
					geoBorders.features.forEach(function(value){
						for(let i = 0; i<allCountries.data.length; i++){
							if(value.properties.iso_a3 == allCountries.data[i]['code']){
								value.properties.capital = allCountries.data[i]['capital'];
								value.properties.flag = allCountries.data[i]['flag'];
								value.properties.continent = allCountries.data[i]['continent'];
								value.properties.region = allCountries.data[i]['region'];
							}
						}
					});


					//Map Tiles
					let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
					let mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVld2F0c29uMTQiLCJhIjoiY2tpaTYzY2Z6MGUzeTJzbnh3ZTRlOG15NyJ9.dFiW07Q6WfChqlBWfWkaxQ';
					let street = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
					let satellite = L.tileLayer(mbUrl, {id: 'mapbox/satellite-streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
							
					// Map Layer Groups
					let capitalsLayer = L.layerGroup();
					let activeLayer = L.layerGroup()

					//Render Map
					let map = L.map('map', { center: [0, 0], zoom: 3, layers: [street, capitalsLayer, activeLayer] });
							
					//adding country boarders to map
					L.geoJson(geoBorders, {style: defaultStyle, onEachFeature: onEachFeature}).addTo(map);


					//Set view on user location
					getLocation();
							
					//Adding Layer Controls
					let baselayers = { "Street": street, "Satellite": satellite}
					let overlays = { "Capitals": capitalsLayer}
					L.control.layers(baselayers, overlays).addTo(map);

							
					//Info Control
					let info = L.control({position: 'topleft'});
					info.onAdd = function (map) {
						this._div = L.DomUtil.create('div', 'info');
						this.update();
						return this._div;
					};
					//Info update functions
					info.update = function(props){
						this._div.innerHTML = '<h6>Information</h6>' +  (props ? '<img src="' + props.flag + '" height="20px" width="auto"><p><b>Country:</b> ' + props.name + '<br><b>Capital: </b>' +  props.capital + '<br><br>Click on <i class="fas fa-info-circle"></i> below to <br>find out more.</p>' : 'Click on a country');
					}
					info.addTo(map);


					//Legend Control
					let legend = L.control({position: 'bottomleft'});
					legend.onAdd = function (map){
						this._div = L.DomUtil.create('div', 'legend');
						this._div.innerHTML = '<h6>Map Legend</h6><p><img src="images/icons/star-solid.svg" height="16px" width="auto"> Capital City<br><div></div>Country Border</p>';
						return this._div;
					}
					legend.addTo(map);
							
							
					//Customer Markers
					let capitalIcon = L.icon({ iconUrl: 'images/icons/star-solid.svg', iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, 0] });
					//Populating Capital Cities layers
					let capitalGroup = L.markerClusterGroup();
					capitals.forEach(function(value){
						if(value.CapitalLatitude != "" && value.CapitalLongitude != ""){
							geoBorders.features.forEach(function(value2){
								if(value.CountryCode == value2.properties.iso_a2){
									capitalGroup.addLayer(L.marker([value.CapitalLatitude, value.CapitalLongitude], {icon: capitalIcon}).bindPopup(value.CapitalName));		
								}
							});
						}
					});
					capitalsLayer.addLayer(capitalGroup);

					//Map Buttons
					//GPS Button	
					L.easyButton('fa-crosshairs fa-lg', function(btn, map){
						getLocation();
					}).addTo(map);
					//Modal Button
					L.easyButton('fa-info-circle fa-lg', function(btn, map){
						//Updating Lat & Lang
						let lat = Cookies.get('gazetteerLat');
						let lng = Cookies.get('gazetteerLng');
						if(lat == "" || lng == ""){
							alert("Please click on a country");
						} else {		
							getModal(lat, lng);
						}
					}).addTo(map);
					//Refresh Button
					L.easyButton('fa-sync-alt ', function(btn, map){
						activeLayer.clearLayers();
						map.setView([0, 0], 2);
						info.update();
						Cookies.set("gazetteerLat", "");
						Cookies.set("gazetteerLng", "");
					}).addTo(map);	
							
					//Map Functions 
					function zoomToFeature(e) {
						activeLayer.clearLayers();
						L.geoJson(e.target.feature, {style: activeStyle}).addTo(activeLayer);
						info.update(e.target.feature.properties);
						map.fitBounds(e.target.getBounds());
						Cookies.set('gazetteerLat', e.latlng.lat);
						Cookies.set('gazetteerLng', e.latlng.lng);
								
						updateNav(e.target.feature);
						updateCountry(e.target.feature);
					}
							

					function onEachFeature(feature, layer) {
						layer.on({
							click: zoomToFeature,
						});
					}

				
					function getLocation(){
						activeLayer.clearLayers();
					    if (navigator.geolocation) {
					    	navigator.geolocation.getCurrentPosition(function(e){
					        	let lat = e.coords.latitude;
					        	let lng = e.coords.longitude
					        	Cookies.set('gazetteerLat', lat);
					        	Cookies.set('gazetteerLng', lng);

					        	$.ajax({
									"async": true,
									"global": false,
									"url": "php/getLocationByCoords.php",
									"dataType": "json",
									"data": {
										'lat': lat,
										'lng': lng,
									},
									success: function(results){
										let code = results.data.results[0].components.country_code.toUpperCase();
										geoBorders.features.forEach(function(value){
											if(value.properties.iso_a2 == code){
												let country = L.geoJson(value, {
													style: activeStyle,
												});
												country.addTo(activeLayer);
												info.update(value.properties);
												map.fitBounds(country.getBounds());
												L.marker([lat, lng]).addTo(country).bindPopup('You are here!').openPopup();
													updateNav(value);
												updateCountry(value);
											}
										});
									},
									error: function(){
										console.log("Could not get Location");
									}
								});
					        });
						} else {
							alert("Could not get current location. Please enable location.");
							map.setView([0, 0], 3);
						}
					}

					//adding selected nav country to active layer
					function loadCountry(geoBorders, code){
						geoBorders.features.forEach(function(value){
							if(value.properties.iso_a3 == code){
								//Updating Lat & Lng
								$.ajax({
									"async": true,
									"global": false,
									"url": "php/getCountryCoords.php",
									"dataType": "json",
									"data": {
										'city': value.properties.capital,
									},
									success: function(result){
										//console.log(result);
										Cookies.set('gazetteerLat', result.data.results[0].geometry.lat);
										Cookies.set('gazetteerLng', result.data.results[0].geometry.lng);
										
									},
									error: function(){
										console.log("error");
									}
								});
								
								//updating active layer
								activeLayer.clearLayers();
								let country = L.geoJson(value, {
									style: activeStyle,
								});
								country.addTo(activeLayer);
								info.update(value.properties);

								//updating view
								map.fitBounds(country.getBounds());

								//updating modal country
								updateCountry(value);
							}
						});
					}

					function updateNav(obj){
						$("#navSelect > option").each(function() {
					    	$(this).prop("selected", false);
					    	if($(this).val() == obj.properties.iso_a3){
					    		$(this).prop("selected", true);
					    	}
						});
					}


					function updateCountry(obj){
						$("#country").html(`<h5><img src="${obj.properties.flag}" title="${obj.properties.name}" alt="${obj.properties.name}" height="30px" width="auto">&nbsp${obj.properties.name}</h5>`);
					}
							
					//On nav change zoom to country and open modal
						$("#navSelect").change(function(){
							loadCountry(geoBorders, $("#navSelect").val());
						});
				},
				error: function(){
					alert("Error loading map. Please refresh the page.");	
				}
			});


			//Creating Nav Country Select
			//creating default option
			let options = '<option value="" disabled selected>Select Country</option>';
			//sorting geoBorders data
			let countries = [];
			geoBorders.features.forEach(function(value){
				let option = value.properties.name;
				countries.push(option);
			});
			countries.sort();
			//creating options based on sorted countries array
			countries.forEach(function(value){
				geoBorders.features.forEach(function(value2){
					if(value2.properties.name == value ){
						options += '<option value="' + value2.properties.iso_a3 + '">' + value2.properties.name + '</option>';
					}	
				});
			});
			//populating select html
			$("#navSelect").html(options);
	   	}, 
		error: function(){
			console.log("Loading geoBorders.json failed");
		}
	});	
}