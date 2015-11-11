var fs = require('fs'),
	fileContents,
	_this = this,
	nbParse = 0,
	parseTimeData,
	parseStopData,
	parseTripsData,
	parseRoutesData,
	jsonResult;

exports.parseGTFS = function (req, res) {
	var type = req.params.type,
		line = req.params.line,
		direction = req.params.direction,
		countRows = 0;

	jsonResult = null;
	nbParse = 0;
	parseTxt(line, type, 'stop_times', direction);
	parseTxt(line, type, 'stops', direction);
	parseTxt(line, type, 'trips', direction);
	parseTxt(line, type, 'routes', direction);

	setTimeout(function () {
		if (jsonResult != null) {
			res.json(jsonResult);
		}
	}, 500);
}

function parseTxt (line, type, file, direction) {
	var countRows = 0,
		result = [];

	fs.readFile('datas/'+type+'/'+line+'/'+file+'.txt', 'utf-8', function (err, data) {
	    if (err) throw err;
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
	});
}

function getSchedule (timeData, stopData, tripsData, routesData, direction) {
	var goodStop = getStop (stopData),
		goodTrips = getTrips (tripsData, direction),
		goodRoute = getRoutes (routesData, goodTrips[2].route_id, direction),
		goodTime = getTimes (timeData, goodStop.stop_id, goodTrips[2].trip_id);
		console.log('Prochain bus à l\'arrêt '+goodStop.stop_name+', direction '+goodRoute+', est à '+goodTime.arrival_time);
	return('Prochain bus à l\'arrêt '+goodStop.stop_name+', direction '+goodRoute+', est à '+goodTime.arrival_time);
}

function getStop (data) {
	var locationLatMe = 48.837225,
		locationLongMe = 2.3514577,
		stopsArray = [],
		goodStop;

	for (var j = 1; j < data.length - 1; j ++) {
		var locationLatStop = parseFloat(data[j].stop_lat),
			locationLongStop = parseFloat(data[j].stop_lon);

		var dist = distance (locationLatMe, locationLongMe, locationLatStop, locationLongStop, "K");
		stopsArray.push(dist);
	}

	for (var k = 0; k < data.length - 1; k ++) {
		if (Math.min.apply(Math, stopsArray) == stopsArray[k]) {
			goodStop = data[k];
		}
	}

	return goodStop;
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
	var nameRoute;

	for (var p = 1; p < routes.length - 1; p ++) {
		if (routes[p].route_id == route_id) {
			nameRoute = routes[p].route_long_name;
		}
	}

	return nameRoute;
}

function getTimes (data, stop_id, trip_id) {
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
		var hour = dateCompare (data[i].arrival_time, actualTime);
		if (hour == 1 && data[i].stop_id == stop_id) {

			var a = data[i].arrival_time.split(':');
			var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
			goodTimes.push(seconds);

			if (Math.min.apply(null, goodTimes) == seconds) {
				posGoodTime = i;
			}
		}
	}

	return data[posGoodTime];
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

