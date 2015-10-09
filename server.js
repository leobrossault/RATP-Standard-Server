var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('express-path');

/* EXPORT MODULE AND ADD ROUTES */
var app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));
require('./routes/routes')(app);
// app.use(express.static(__dirname + '/public'));

app.listen(8080);

module.exports = app;