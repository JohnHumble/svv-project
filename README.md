# svv-project

The purpose of this project is to provide a visualization tool to display satellite visibility from ground locations on the earth.

Satellite data can be found here:
https://celestrak.com/

Documentation for how this data is formated is found here:
https://celestrak.com/NORAD/documentation/tle-fmt.php

## Running the program ##

The web-app needs to be ran from a web server. A quick way to do this is with a simple python command.

`python -m http.server 80`

This will run a local server on port 80 with the web-app.

The app will start with the ISS data already loaded in. You can load more data by clicking on the button for Uploading TLE files.
You can change the time by chaning the visualization slider.

