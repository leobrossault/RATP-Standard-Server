var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('express-path'),
	five = require("johnny-five"),
	board = new five.Board();

board.on("ready", function() {
    var led = new five.Led(2);
    led.blink(500);
});

/* EXPORT MODULE AND ADD ROUTES */
var app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
require('./routes/routes')(app);
// app.use(express.static(__dirname + '/public'));

app.listen(8080);

module.exports = app;