var five = require("johnny-five");
var board = new five.Board();

var pin1,
	pin2,
	pin1Number = 4,
	pin2Number = 5,
	state1 = 0,
	state2 = 0;

board.on("ready", function(){
	var val = 0;

	// this.pinMode(pin1, INPUT);
	// this.pinMode(pin2, INPUT);
	pin1 = new five.Pin(pin1Number);
	pin2 = new five.Pin(pin2Number);

  	// Create a loop to "flash/blink/strobe" an led
  	this.loop( 100, function() {
  		// state1 = this.digitalRead(pin1);
  		// state2 = this.digitalRead(pin2);

  		// console.log(state1 + '/ ' + state2);
  	});

  	pin1.query(function(state) {
	  console.log(state);
	});
});