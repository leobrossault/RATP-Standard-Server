var fs = require('fs'),
	fileContents,
	_this = this,
	nbParse = 0,
	parseTimeData,
	parseStopData;

exports.parseGTFS = function (req, res) {
	var type = req.params.type,
		line = req.params.line,
		countRows = 0;

	parseTxt(line, type, 'stop_times');
	parseTxt(line, type, 'stops');
}

function parseTxt (line, type, file) {
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
		    }
	    });

	    if (file == 'stop_times') {
	    	parseTimeData = result;
	    	nbParse ++
	    } else if (file == 'stops') {
	    	parseStopData = result;
	    	nbParse ++
	    }

	    if (nbParse == 2) {
	    	getTrip(parseTimeData, parseStopData);
	    }
	});
}

function getTrip (timeData, stopData) {
	// Changer la logique, d'abord localiser puis regarder les heures, getStop doit venir avant getTime, 
	//on récupère le stop_id puis on va chercher dans stop_time les stop_id correspondantes puis on compare avec l'heure
	
	var allGoodTimes = getTimes(timeData),
		goodStop = getStop(stopData),
		goodTime;
		console.log(goodStop.stop_id);

	for (var l = 0; l < allGoodTimes.length; l ++) {
		console.log(allGoodTimes[l].stop_id);

		if (allGoodTimes[l].stop_id == goodStop.stop_id) {
			goodTime = allGoodTimes[l];
		}
	}

	// console.log(goodTime);
	// console.log(goodStop);
}

function getTimes (data) {
	var date = new Date (),
		hour = date.getHours (),
		minute = date.getMinutes (),
		actualTime,
		goodTimes = [];

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

	for (var i = 0; i < data.length; i ++) {
		if (data[i].arrival_time == actualTime) {
			goodTimes.push(data[i])
		}
	}

	return goodTimes;
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

