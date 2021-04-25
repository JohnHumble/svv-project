// pi
const PI = 3.141592653589793238462643;

// read in the data found in stations.txt
const fileSelector = document.getElementById("data");
let data;
fileSelector.addEventListener('change', (event) => {
  readSat(event.target.files[0])
})


/**
 * Reads a file of 2 line satellite data
 * @param {*} file the file with the satellite data
 * @returns 
 */
function readSat(file) {
  let fr = new FileReader();

  fr.onload = (e) => {
    let sats = [];
    let res = e.target.result;

    let lines = res.split("\n")

    const MAX_TLE_LINES = 30

    for (let i = 0; i < lines.length && i < MAX_TLE_LINES; i += 3) {
      // console.log(lines[i + 1])
      // console.log(lines[i + 2])
      if (lines[i + 1] != undefined) {
        sats.push({
          'name': lines[i],
          'tle': satellite.twoline2satrec(lines[i + 1], lines[i + 2])
        });
      }
    }

    // console.log("new satellites made")
    // console.log(sats);

    worldMap.satellites = sats;
    // console.log(sats);
    worldMap.clearLines();
    // console.log(sats);
  }

  fr.readAsText(file);
}

/**
 * Will take the data output from satellite.twoline2satrec() and extract the latitude, longitude and latitude.
 * @param {*} sattrecs data from satelliet.twoline2satrec()
 * @param {*} t_ahead the amount of time to look ahead for each satellite for propagation
 * @param {*} step the step size to propagate
 * @returns 
 */
function extractLLA(sattrecs, startTime = 0, t_ahead = 18, step = 1) {

  lla = [];

  // go through all the sats
  sattrecs.forEach(sat => {
    let sat_loc = propagate_sat(sat['tle'], t_ahead, step, startTime)
    sat_loc.pos.forEach(loc => {
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
function propagate_sat(sat, minutes_ahead, step, start) {
  let out = [];
  let times = [];

  for (let i = start; i < (minutes_ahead + start); i += step) {

    let t_ahead = new Date(i * 60 * 1000);

    let pos_vel = satellite.propagate(sat, t_ahead);
    let gmst = satellite.gstime(t_ahead);
    let pos = satellite.eciToGeodetic(pos_vel.position, gmst);
    times.push(gmst + sat.jdsatepoch);

    out.push(pos);
  }
  return { 'pos': out, 'time': times };
}

function format_lla(pos) {
  return ({
    'lat': satellite.degreesLat(pos.latitude),
    'long': satellite.degreesLong(pos.longitude),
    'alt': pos.height,
  })
}

function lla2geo(lla) {
  let a = 0;
  if (lla.alt !== undefined) {
    a = lla.alt;
  }
  return ({
    'height': a,
    'latitude': lla.lat * PI / 180,
    'longitude': lla.long * PI / 180,
  })
}
