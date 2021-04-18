
function single_visibility(ground_site, sat, t_ahead=1000, step=1) {
  // for(let i = 0; i < t_ahead; i++){
  //   propagate_sat()
  // }

  let sat_locs = propagate_sat(sat, t_ahead, step);

  let visible = []

  sat_locs.forEach(slla => {
    //console.log(slla);

    // convert satellite lla
    let setecf = satellite.geodeticToEcf(slla);

    //console.log(setecf);

    // convert ground site lla
    let gecef = lla2geo(ground_site);

    //console.log(gecef);

    // get the angle between the two
    let look_angle = satellite.ecfToLookAngles(gecef, setecf);

    //let a1 = vec_angle(gecef, setecf);

    //console.log(look_angle);

    if (look_angle.elevation >= 0) {
      visible.push({
        'lla': format_lla(slla),
        'ecef': setecf,
      })
    }
  });

  return visible;
}

function site_visibility(ground_site, sat) {
  let sat_visability = [];

  sat.forEach(sat => {
    sat_visability.push(single_visibility(ground_site, sat));
  });
  return sat_visability;
}

function visibility(ground_sites, sat) {
  let vis = [];

  ground_sites.forEach(site => {
    vis.push(site_visibility(site, sat));
  })

  return vis;
}

