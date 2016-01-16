var fs = require('fs'),
	fileContents,
	_this = this,
	nbParse = 0,
	parseTimeData,
	parseStopData,
	parseTripsData,
	parseRoutesData,
	jsonResult,
	Player = require('player'),
	player,
	error = 0,
	say = require('say'),
	newUrl = '',
	superagent = require('superagent');

var voice;

var hours,
	minutes,
	moment;

exports.parseGTFS = function (getType, getLine, getDirection, _voice) {
	var type = getType,
		line = getLine,
		direction = getDirection,
		countRows = 0;
		voice = _voice;

	jsonResult = null;
	nbParse = 0;

	parseTxt(line, type, 'stop_times', direction);
	if (error == 0) {
		parseTxt(line, type, 'stops', direction);
		parseTxt(line, type, 'trips', direction);
		parseTxt(line, type, 'routes', direction);
	}
}

function parseTxt (line, type, file, direction) {
	var countRows = 0,
		result = [];

	fs.readFile('datas/'+type+'/'+line+'/'+file+'.txt', 'utf-8', function (err, data) {
	    if (err) {
	    	error = 1;
			player = new Player([
			    "https://demows.voxygen.fr/ws/tts1?text=Il+n%27y+a+pas+d%27infos+disponibles+pour+cette+ligne.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=bc608bac2d0241dff7080864baab1984"
			]).on('error', function(err) {
			    console.log(err);
			}).play();		
	    }

	    if (error == 0) {
		    fileContents = data;

		   	var row = data.split('\n');

		    row.forEach(function (el) {
		    	countRows ++;
		    	if (countRows != null && file == 'stop_times') {
			    	result.push({
			    		'trip_id': el.split(',')[0],
			    		'arrival_time': el.split(',')[1],
			    		'departure_time': el.split(',')[2],
			    		'stop_id': el.split(',')[3],
			    		'stop_sequence': el.split(',')[4],
			    		'stop_headsign': el.split(',')[5],
			    		'shape_dist_traveled': el.split(',')[6],
			    	});
			    } else if (countRows != null && file == 'stops') {
			    	result.push({
			    		'stop_id': el.split(',')[0],
			    		'stop_code': el.split(',')[1],
			    		'stop_name': el.split(',')[2],
			    		'stop_desc': el.split(',')[3],
			    		'stop_lat': el.split(',')[4],
			    		'stop_lon': el.split(',')[5],
			    		'location_type': el.split(',')[6],
			    		'parent_station': el.split(',')[7],
			    	});		    	
			    } else if (countRows != null && file == 'trips') {
			    	result.push({
			    		'route_id': el.split(',')[0],
			    		'service_id': el.split(',')[1],
			    		'trip_id': el.split(',')[2],
			    		'trip_headsign': el.split(',')[3],
			    		'trip_short_name': el.split(',')[4],
			    		'direction_id': el.split(',')[5],
			    		'shape_id': el.split(',')[6],
			    	});		    	
			    } else if (countRows != null && file == 'routes') {
			    	result.push({
			    		'route_id': el.split(',')[0],
			    		'agency_id': el.split(',')[1],
			    		'route_short_name': el.split(',')[2],
			    		'route_long_name': el.split(',')[3],
			    		'route_desc': el.split(',')[4],
			    		'route_type': el.split(',')[5],
			    		'route_url': el.split(',')[6],
			    		'route_color': el.split(',')[7],
			    		'route_text_color': el.split(',')[8],
			    	});		    	
			    }
		    });

		    if (file == 'stop_times') {
		    	parseTimeData = result;
		    	nbParse ++
		    } else if (file == 'stops') {
		    	parseStopData = result;
		    	nbParse ++
		    } else if (file == 'trips') {
		    	parseTripsData = result;
		    	nbParse ++
		    } else if (file == 'routes') {
		    	parseRoutesData = result;
		    	nbParse ++
		    }

		    if (nbParse == 4) {
		    	jsonResult = getSchedule (parseTimeData, parseStopData, parseTripsData, parseRoutesData, direction);
		    }
		}
	});
}

function getSchedule (timeData, stopData, tripsData, routesData, direction) {
	var goodStop = getStop (stopData, direction);

	if (goodStop != null) {
		var goodTrips = getTrips (tripsData, direction);

		if (goodTrips != null && goodTrips[2] != null) {
			var goodRoute = getRoutes (routesData, goodTrips[2].route_id, direction);

			if (goodRoute != null) {
				var goodTime = getTimes (timeData, goodStop.stop_id, goodTrips, goodTrips[2].route_id);
			
				var format_goodStop = goodStop.stop_name.toLowerCase(),
					format_goodRoute = goodRoute.toLowerCase();

				format_goodStop = format_goodStop.replace(/"/g,'');
				format_goodRoute = format_goodRoute.replace(/"/g,'');

				var url = 'Prochain bus à l\'arrêt '+format_goodStop+', direction '+format_goodRoute+', est à '+hours+' heure '+minutes;

				url = encodeURIComponent(url).replace(/%20/g,'+');
				url = url.replace(/'/g,'%27');

				var ua = superagent.agent()
				ua.get('https://www.voxygen.fr/sites/all/modules/voxygen_voices/assets/proxy/index.php?method=redirect&text='+url+'&voice=Loic&ts=1452789303887')
					.set('User-Agent','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36')
				   	.end(function(err, res){
				    	if (err || !res.ok) {
				    	  console.log('Oh no! error');
				    	}

				    	newUrl = res.redirects[0];
				    	console.log(newUrl);

						if (hours > -1 && minutes > -1) {
							if (newUrl != '') {
								player = new Player([
									newUrl
								]).on('error', function(err) {
								    console.log(err);
								}).play();
							}
							// say.speak(null , url);
						} else {
							player = new Player([
							    "https://demows.voxygen.fr/ws/tts1?text=Il+n%27y+a+pas+d%27infos+disponibles+pour+cette+ligne.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=bc608bac2d0241dff7080864baab1984"
							]).on('error', function(err) {
							    console.log(err);
							}).play();
						}
				    });
			} else {
				player = new Player([
				    "https://demows.voxygen.fr/ws/tts1?text=Il+n%27y+a+pas+d%27infos+disponibles+pour+cette+ligne.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=bc608bac2d0241dff7080864baab1984"
				]).on('error', function(err) {
				    console.log(err);
				}).play();
			}
		} else {
			player = new Player([
			    "https://demows.voxygen.fr/ws/tts1?text=Il+n%27y+a+pas+d%27infos+disponibles+pour+cette+ligne.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=bc608bac2d0241dff7080864baab1984"
			]).on('error', function(err) {
			    console.log(err);
			}).play();
		}
	} else {
		player = new Player([
		    "https://demows.voxygen.fr/ws/tts1?text=Il+n%27y+a+pas+d%27infos+disponibles+pour+cette+ligne.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=bc608bac2d0241dff7080864baab1984"
		]).on('error', function(err) {
		    console.log(err);
		}).play();		
	}

		// console.log('Prochain bus à l\'arrêt '+goodStop.stop_name+', direction '+goodRoute+', est à '+goodTime.arrival_time);

	// return('Prochain bus à l\'arrêt '+goodStop.stop_name+', direction '+goodRoute+', est à '+goodTime.arrival_time);
}

function getStop (data, direction) {
	var locationLatMe = 48.837225,
		locationLongMe = 2.3514577,
		stopsArray = [],
		goodStopTemp,
		goodStop = [];

	for (var j = 1; j < data.length - 1; j ++) {
		var locationLatStop = parseFloat(data[j].stop_lat),
			locationLongStop = parseFloat(data[j].stop_lon);

		var dist = distance (locationLatMe, locationLongMe, locationLatStop, locationLongStop, "K");
		stopsArray.push(dist);
	}

	for (var k = 0; k < data.length - 1; k ++) {
		if (Math.min.apply(Math, stopsArray) == stopsArray[k]) {
			goodStopTemp = data[k];
		}
	}

	for (var i = 0; i < data.length - 1; i ++) {
		if (data[i].stop_name == goodStopTemp.stop_name) {
			goodStop.push(data[i]);
		}
	}
	
	return goodStop[direction];
}

function getTrips (trips, direction) {
	var goodTrips = [];

	for (var k = 1; k < trips.length - 1; k ++) {
		if (trips[k].direction_id == direction) {
			goodTrips.push(trips[k]);
		}
	}

	return goodTrips;
}

function getRoutes (routes, route_id, direction) {
	var nameRoute = '';

	for (var p = 1; p < routes.length - 1; p ++) {
		if (routes[p].route_id == route_id) {
			nameRoute = routes[p].route_long_name;

			if (p == 1) {
				nameRoute = nameRoute.substring(nameRoute.lastIndexOf("(")+1,nameRoute.lastIndexOf("<")).slice(0, -1);
			} else {
				nameRoute = nameRoute.substring(nameRoute.lastIndexOf(">")+1,nameRoute.lastIndexOf(")")).substring(1);
			}
		}
	}

	return nameRoute;
}

function getTimes (data, stop_id, data_trip, route_id) {
	var date = new Date (),
		hour = date.getHours (),
		minute = date.getMinutes (),
		actualTime,
		goodTimes = [],
		posGoodTime;

	if (hour < 10) {
		if (minute < 10) {
			actualTime = '0'+hour+':0'+minute+':00';
		} else {
			actualTime = '0'+hour+':'+minute+':00';
		}
	} else {
		if (minute < 10) {
			actualTime = hour+':0'+minute+':00';
		} else {
			actualTime = hour+':'+minute+':00';
		}
	}

	for (var i = 1; i < data.length - 1; i ++) {
		var a = data[i].arrival_time.split(':'),
			b = actualTime.split(':');

		var secondsA = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]),
			secondsB = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);

		for (var k = 0; k < data_trip.length; k ++) {
			if (parseInt(secondsA) > parseInt(secondsB) && data[i].stop_id == stop_id && data[i].trip_id == data_trip[k].trip_id) {
				goodTimes.push(secondsA);
			}
		}
	}

	var totalSecond = Math.min.apply(null, goodTimes);

	var hr  = Math.floor(totalSecond / 3600),
		min = Math.floor((totalSecond - (hr * 3600)) / 60),
		sec = totalSecond - (hr * 3600) - (min * 60);

	hours = hr;
	minutes = min;

	var time = hr + ':' + min;

	return time;
}

/* CALC FUNCTIONS */

function dateCompare (time1, time2) {
	var t1 = new Date();
	var parts = time1.split(":");
	t1.setHours(parts[0],parts[1],parts[2],0);
	var t2 = new Date();
	parts = time2.split(":");
	t2.setHours(parts[0],parts[1],parts[2],0);

	if (t1.getTime()>t2.getTime()) return 1;
	if (t1.getTime()<t2.getTime()) return -1;
	return 0;
}

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180,
		radlat2 = Math.PI * lat2/180,
		radlon1 = Math.PI * lon1/180,
		radlon2 = Math.PI * lon2/180,
		theta = lon1-lon2,
		radtheta = Math.PI * theta/180;

	dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;

	if (unit=="K") { 
		dist = dist * 1.609344;
	}

	if (unit=="N") { 
		dist = dist * 0.8684;
	}

	return dist;
}

