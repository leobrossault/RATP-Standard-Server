var bus = require('../controllers/bus');

module.exports = function (app) {
	app.get('/horaire', bus.parseGTFS);
}