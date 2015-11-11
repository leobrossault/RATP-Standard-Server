var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('express-path'),
	five = require('johnny-five'),
	board = new five.Board({ port : '\\\\.\\COM6' }),
	bus = require('./controllers/bus');

board.on('ready', function() {
	console.log('Board is ready !');
});

getData(91);

function getData (line) {
	bus.parseGTFS ('bus', line, 0);
}

/* EXPORT MODULE AND ADD ROUTES */
var app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
require('./routes/routes')(app);
// app.use(express.static(__dirname + '/public'));

app.listen(8080);

module.exports = app;