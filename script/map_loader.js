
let worldMap = new Map();

//Load in json data to make map
d3.json("data/world.json")
  .then(function (world) {
    worldMap.drawMap(world);
  });

d3.csv("data/groundstations.csv")
  .then(function (stations) {
    worldMap.updateGroundStations(stations)
  });

d3.json("data/clouds.json")
  .then(function (clouds) {
    worldMap.updateObscura(clouds)
  })
