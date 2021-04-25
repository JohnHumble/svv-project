
let worldMap = new Map();
let forecast = new Forecast(worldMap);

//Load in json data to make map
d3.json("data/geojson.json")
  .then(function (world) {
    worldMap.drawMap(world);
  });

d3.csv("data/groundstations.csv")
  .then(function (stations) {
    worldMap.updateGroundStations(stations)
  });

forecast.update(0);

// debugging remove later
let l1 = "1 25544U 98067A   21083.89642366  .00001325  00000-0  32280-4 0  9998"
let l2 = "2 25544  51.6458  39.6291 0003151 145.1042 249.9106 15.48938267275534"
let sat = satellite.twoline2satrec(l1, l2)
// console.log(sat);

worldMap.satellites = [sat]
//worldMap.showVisibility();
worldMap.updateSatellites(20, 180, 1);
