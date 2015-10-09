var fs = require('fs');
var fileContents;
var _this = this;

exports.parseGTFS = function (req, res) {
	var type = req.query.type;
	var line = req.query.number;
	var countRows = 0;

	var times = _this.parseTxt(type, line, 'stop_times');

	console.log(times);
}

exports.getTimes = function (req, data) {
	
}

exports.parseTxt = function (req, res, file, type, line) {
	var countRows = 0;

	fs.readFile('datas/'+type+'/'+line+'/'+file+'.txt', 'utf-8', function (err, data) {
	    if (err) throw err;
	    fileContents = data;
	    var res = [];

	   	var row = data.split('\n');

	    row.forEach(function (el) {
	    	countRows ++;

	    	if (countRows != null && file == 'stop_times') {
		    	res.push({
		    		'trip_id': el.split(',')[0],
		    		'arrival_time': el.split(',')[1],
		    		'departure_time': el.split(',')[2],
		    		'stop_id': el.split(',')[3],
		    		'stop_sequence': el.split(',')[4],
		    		'stop_headsign': el.split(',')[5],
		    		'shape_dist_traveled': el.split(',')[6],
		    	});
		    } else if (countRows != null && file == 'stop') {

		    }
	    });

	   return res;
	});
}
