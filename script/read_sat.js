
// read in the data found in stations.txt
const fileSelector = document.getElementById("data");
let data;
fileSelector.addEventListener('change', (event) => {
  // console.log(event.target.files[0])
  satellites = readSat(event.target.files[0])

  console.log(satellite)

  // add to world map
  lla = extractLLA(satellites)

})

// debugging remove later
let l1 = "1 25544U 98067A   21083.89642366  .00001325  00000-0  32280-4 0  9998"
let l2 = "2 25544  51.6458  39.6291 0003151 145.1042 249.9106 15.48938267275534"
let sat = satellite.twoline2satrec(l1, l2)

worldMap.updateSatellites(extractLLA([sat]))

/**
 * Reads a file of 2 line satellite data
 * @param {*} file the file with the satellite data
 * @returns 
 */
function readSat(file) {
  let fr = new FileReader();

  let sats = [];
  fr.onload = (e) => {
    let res = e.target.result;

    let lines = res.split("\n")

    for (let i = 0; i < lines.length; i += 3) {
      console.log(lines[i + 1])
      console.log(lines[i + 2])
      sats.push(satellite.twoline2satrec(lines[i + 1], lines[i + 2]));
    }

    // add to the graph
    let lla = extractLLA(sats)

    //console.log(p)
    worldMap.updateSatellites(lla)
  }

  fr.readAsText(file);
  console.log(sats)
  worldMap.updateSatellites(sats)
}

/**
 * Will take the data output from satellite.twoline2satrec() and extract the latitude, longitude and latitude.
 * @param {*} sattrecs data from satelliet.twoline2satrec()
 * @param {*} t_ahead the amount of time to look ahead for each satellite for propagation
 * @param {*} step the step size to propagate
 * @returns 
 */
function extractLLA(sattrecs, t_ahead=10, step=1) {

  lla = [];
  // go through all the sats
  sattrecs.forEach(sat => {

    let sat_loc = propagate_sat(sat, 10, 1)
    sat_loc.forEach(loc => {
      lla.push(loc);
    });

  });

  // return new data type
  return lla;
}

/**
 * Propagate a single satellite and returns the lla for that satellite
 * @param {*} sat 
 * @param {*} hours_ahead 
 * @param {*} step 
 * @returns a list of objects with the latitude, longitude, altitude, and name for
 */
function propagate_sat(sat, hours_ahead, step) {
  let out = [];
  for (let i = 0; i < hours_ahead; i += step) {

    let t_ahead = new Date();
    t_ahead.setTime(i * 50000)
    
    let pos_vel = satellite.propagate(sat, t_ahead);
    let gmst = satellite.gstime(t_ahead);
    let pos = satellite.eciToGeodetic(pos_vel.position, gmst);

    out.push({
      'lat':satellite.degreesLat(pos.latitude),
      'long':satellite.degreesLong(pos.longitude),
      'alt':pos.height,
      'name':sat.name,
    })
  }
  return out;
}
