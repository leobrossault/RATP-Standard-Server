# RATP Standard
​
## Concept
This student project was designed at Gobelins, The school of image, we were 2 : me and [Jérémie Drazic](https://github.com/JeremieDrazic). The goal was to take an old object (phone) and think of new creative ways to use it.
Our idea was to inform the user of the schedule of the next bus at the nearest stop.
​
The user picks the phone, and listens. An operator greets him/her saying: "Hello ! Please, choose a bus line".
He/She dials the number of the bus line on the rotary dial. At this moment, the operator speaks out the schedule of the line at the nearest stop.
​
## Technical information
We used an Ardunio card to catch all events comming from the phone. It is connected to a Raspberry Pi 2, which waits for upcomming events thanks to a npm package: "Serial Port".
In order to get the bus line number that the user dialed we used a library made by [Arthur Robert](https://github.com/tournevis/rotoPhone) which the arduino uses.
​
The Raspberry parses the files to find the right schedule at the right stop in the right direction (Each bus line contains 6 files .txt).
To announce the right schedule with the "RATP operator", we use [Voxygen](https://www.voxygen.fr/), and their URLs which return a MP3 file. Voxygen is a Text2speech solution.
Finally to play the sound, we use another npm package : "Player", it allows to play the sound on the Raspberry (the phone is connected to the Raspberry thanks to a jack input).
​
Furthermore, a rgb LED is turned on with the color of the line that the user chose. To get the right color, we used 'Color Thief', a npm package, that allows us to detect the main color in a specific picture (the RATP gives us the pictures of their bus lines, so we were able to get the colors from that ...).
​
## Medias
###### In the phone
![Inside the phone](http://leobrossault.github.io/stock/README/RATP/ratp_1.jpg)
​
###### Develop the server
![Develop the server](http://leobrossault.github.io/stock/README/RATP/ratp_2.jpg)
​
###### Result
![The result](http://leobrossault.github.io/stock/README/RATP/ratp_3.jpg)
