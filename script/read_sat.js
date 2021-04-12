
// read in the data found in stations.txt
const fileSelector = document.getElementById("data");
let data;
fileSelector.addEventListener('change', (event) => {
  // console.log(event.target.files[0])
  satellites = readSat(event.target.files[0])

  console.log(satellite)

  // add to world map
  lla = extractLLA(satellites)

  //worldMap.updateSatellites(lla)

  console.log("doing the thing")
  // lla.forEach((pos) => {
  //   console.log("foo")
  //   let longitude = pos.longitude
  //   let latitude  = pos.latitude

  //   // save point location
  

  //   // todo, make this a thing
  //   let circle = d3.geoCircle().center([longitude, latitude]).radius(angle);
  //   d3.select("map").append(circle);
  //   console.log("circle")
  //   console.log(circle)
  // });


})

function readSat(file) {
  let fr = new FileReader();

  let sats = [];
  fr.onload = (e) => {
    let res = e.target.result;

    let lines = res.split("\n")

    // check to see what kind of data to use
    // let mult_sat = lines[0].length == 69;
    // let inc = 2 + mult_sat;

    for (let i = 0; i < lines.length; i += 3) {
      console.log(lines[i + 1])
      console.log(lines[i + 2])
      sats.push(satellite.twoline2satrec(lines[i + 1], lines[i + 2]));
    }

    // add to the graph
    let lla = extractLLA(sats)

    worldMap.updateSatellites(lla)
    
  }

  fr.readAsText(file);
  console.log(sats)
  worldMap.updateSatellites(sats)
  return sats
}

function extractLLA(sattrecs) {
  // gets the latitude, longitude, and altitude of the satellite from the sat data

  lla = [];
  // go through all the sats
  sattrecs.forEach(sat => {
    console.log(sat)

    let positionAndVelocity = satellite.propagate(sat, new Date());

    let gmst = satellite.gstime(new Date());
    // get position geodetic
    let pos = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

    lla.push({
      'lat':satellite.degreesLat(pos.latitude),
      'long':satellite.degreesLong(pos.longitude),
      'alt':pos.height,
      'name':sat.name,
    })
  });

  // return new data type
  return lla;
}