var serialport = require('serialport'),
    bus = require('./controllers/bus'),
    portName = '/dev/ttyACM0',
    sp,
    Player = require('player'),
    say = require('say'),
    _player,
    ColorThief = require('color-thief'),
    fs = require('fs'),
    superagent = require('superagent');

var isReady = 0,
    previousNumber,
    actualNumber,
    previousDirection = 'direction1',
    actualDirection = 1,
    phoneReady = 0,
    previousPhoneState = 'hangedUp',
    actualPhoneState;

var voices = ['Helene' ,'Loic', 'Moussa', 'Philippe', 'Mendoo', 'Fabienne'],
    voice = voices[Math.floor(Math.random() * voices.length)];

connectToSerialPort ();
catchNewNumber ();
// getData (91);

// ##
// CONNECTION TO SERIAL PORT
function connectToSerialPort () {
  console.log("Connect to Arduino by seriaPort "+portName);

  sp = new serialport.SerialPort(portName, {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false,
      parser: serialport.parsers.readline("\r\n")
  });

  sp.on('data', function(input) {
    if (input == 'pickedUp') {
      phoneReady = 1;
    } else if (input == 'hangedUp') {
      phoneReady = 0;
    }

    if (isNaN(parseInt(input) / 10) == false) {
      if (input != null) {
        if (input < 9) {
          input ++;
        } else {
          input = 0;
        }

        if (isReady == 1) {
          if (phoneReady == 1) {
            actualNumber = input;
            getNumber (input);
          }
        } else {
          isReady = 1;
        }
      }
    }

    if (input == 'direction1' || input == 'direction2') {
      if (previousDirection != input) {
        if (input == 'direction1') {
          actualDirection = 0;
        } else {
          actualDirection = 1;
        }

        previousDirection = input;
      }
    }

    if (input == 'hangedUp' || input == 'pickedUp') {
      if (previousPhoneState != input) {
        if (input == 'hangedUp') {
          actualPhoneState = 0;
        } else {
          _player = new Player([     
            "https://demows.voxygen.fr/ws/tts1?text=Bonjour%2C+bienvenue+%C3%A0+la+centrale+RATP%2C+veuillez+composer+un+num%C3%A9ro+de+ligne.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=c06c0086084e5ac2a9420681be7849f3"
          ]).on('error', function(err) {
              console.log(err);
          }).play();

          actualPhoneState = 1;
        }

        previousPhoneState = input;
      }
    }
  });
}

var newNumber = 0,
    totalNumber = '';

function getNumber (number) {
  if (newNumber == 0) {
    totalNumber = totalNumber + number;
  }
}

var countSecond = 0;

function catchNewNumber () {
  setInterval (function () {
    if (actualNumber != previousNumber) {
      previousNumber = actualNumber;
      countSecond = 0;
    }

    if (actualNumber == previousNumber && countSecond == 3) {
      if (parseInt(totalNumber) != 0 && parseInt(totalNumber) != undefined && parseInt(totalNumber) != NaN & totalNumber != '') {
        getData (totalNumber);
      }

      countSecond = 0;
      totalNumber = '';
    }

    countSecond ++;
  }, 1000);
}

function getData (number) {
  // Color
  console.log('Ma ligne est : '+ number);
  // say.speak(null , 'Veuillez patientez quelques instant, nous traitons votre demande');

  var colorThief = new ColorThief(),
      colorBus;

  if (fs.existsSync('./datas/colors/'+number+'.png')) {
    colorBus = colorThief.getColor('./datas/colors/'+number+'.png');
  } else {
    colorBus = colorThief.getColor('./datas/colors/Noct-01-genRVB.png');
  }

  var concatColor = colorBus[0] + ',' + colorBus[1] + ',' + colorBus[2];

  sp.write(concatColor , function(err, results) {
    if (err) { console.log(err); }
  });

   console.log(colorBus);

  var player = new Player([     
    "https://demows.voxygen.fr/ws/tts1?text=Veuillez+patienter%2C+nous+traitons+votre+demande.&voice=Loic&header=headerless&coding=mp3%3A128-0&user=anders.ellersgaard%40mindlab.dk&hmac=444bf3ec474b731671b911c83d73125b"
  ]).on('error', function(err) {
    console.log(err);
    setTimeout(function () {
      bus.parseGTFS ('bus', number, actualDirection, voice);
    }, 1000);
  }).play();
}