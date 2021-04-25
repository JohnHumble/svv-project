// pi
const PI = 3.141592653589793238462643;

// read in the data found in stations.txt
const fileSelector = document.getElementById("data");
let data;
fileSelector.addEventListener('change', (event) => {
  // console.log(event.target.files[0])
  readSat(event.target.files[0])

  //console.log("New Satellite", satellite)

  // add to world map
 // lla = extractLLA(satellites)

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

    //console.log(lines);

    for (let i = 0; i < lines.length; i += 3) {
      console.log(lines[i + 1])
      console.log(lines[i + 2])
      if (lines[i+1] != undefined) {
        sats.push(satellite.twoline2satrec(lines[i + 1], lines[i + 2]));
      }
    }
    
    console.log("new satellites made")
    console.log(sats);

    // add to the graph
    // let lla = extractLLA(sats)

    //console.log(p)
    //worldMap.updateSatellites(lla)

    worldMap.satellites = sats;
    console.log(sats);
    worldMap.clearLines();
    console.log(sats);

    //worldMap.showVisibility();
  }

  fr.readAsText(file);
  //console.log(sats)

  //worldMap.updateSatellites(sats)
}

/**
 * Will take the data output from satellite.twoline2satrec() and extract the latitude, longitude and latitude.
 * @param {*} sattrecs data from satelliet.twoline2satrec()
 * @param {*} t_ahead the amount of time to look ahead for each satellite for propagation
 * @param {*} step the step size to propagate
 * @returns 
 */
function extractLLA(sattrecs, startTime = 0, t_ahead=18, step=1) {

  lla = [];
  // go through all the sats
  //console.log(sattrecs);
  sattrecs.forEach(sat => {

    let sat_loc = propagate_sat(sat, t_ahead, step, startTime)
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
  //console.log("doing the thing");
  // console.log(sat);
  // console.log(start);
  // console.log(minutes_ahead);
  // console.log(step);
  for (let i = start; i < (minutes_ahead + start); i += step) {

    // console.log(i);
    let t_ahead = new Date(i * 60 * 1000);
    //t_ahead.setTime(i * 50000)
    
    let pos_vel = satellite.propagate(sat, t_ahead);
    //console.log(pos_vel.position);
    let gmst = satellite.gstime(t_ahead);
    //console.log(t_ahead);
    let pos = satellite.eciToGeodetic(pos_vel.position, gmst);
    times.push(gmst + sat.jdsatepoch);

    out.push(pos);
    // console.log(pos)

    // let lla2 = format_lla(pos);
    // let lla3 = lla2geo(lla2);
    // console.log(pos.longitude - lla3.longitude);
    // console.log(pos.latitude - lla3.latitude);

    // out.push({
    //   'lat':satellite.degreesLat(pos.latitude),
    //   'long':satellite.degreesLong(pos.longitude),
    //   'alt':pos.height,
    //   'name':sat.name,
    // })
  }
  return {'pos':out, 'time':times};
}

function format_lla(pos) {
  return ({
    'lat':satellite.degreesLat(pos.latitude),
    'long':satellite.degreesLong(pos.longitude),
    'alt':pos.height,
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
