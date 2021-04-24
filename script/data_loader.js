
let worldMap = new Map();
let forecast = new Forecast(worldMap);

//Load in json data to make map
d3.json("data/world.json")
  .then(function (world) {
    worldMap.drawMap(world);
  });

d3.csv("data/groundstations.csv")
  .then(function (stations) {
    worldMap.updateGroundStations(stations)
  });

forecast.update(0);
