var bus = require('../controllers/bus');

module.exports = function (app) {
	app.get('/horaire/:type/:line/:direction', bus.parseGTFS);
}