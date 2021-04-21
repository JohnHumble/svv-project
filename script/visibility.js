
function single_visibility(ground_site, sat, t_ahead=1000, step=1) {

  let sat_locs = propagate_sat(sat, t_ahead, step);

  let visible = []
  let windows = []

  let has_window = false;
  let ind = -1;

  for (let i = 0; i < sat_locs.pos.length; i++) {
    slla = sat_locs.pos[i];
    sattime = sat_locs.time[i];

    // convert satellite lla
    let setecf = satellite.geodeticToEcf(slla);

    // convert ground site lla
    let gecef = lla2geo(ground_site);

    // get the angle between the two
    let look_angle = satellite.ecfToLookAngles(gecef, setecf);

    //let a1 = vec_angle(gecef, setecf);

    //console.log(look_angle);

    if (look_angle.elevation >= 0) {
      visible.push({
        'time': sattime,
        'lla': format_lla(slla),
        'ecef': setecf,
      })

      if (!has_window) {
        has_window = true
        windows.push([sattime]);
        ind++;
      }
    } else {
      if (has_window) {
        windows[ind].push(sattime);
      }

      has_window = false;
    }
  }

  return {'visible':visible, 'window':windows};
}

function site_visibility(ground_site, sat) {
  let sat_visability = [];

  sat.forEach(sat => {
    sat_visability.push(single_visibility(ground_site, sat));
  });
  return {'sat_vis':sat_visability, 'name':ground_site.name};
}

function visibility(ground_sites, sat) {
  let vis = [];

  ground_sites.forEach(site => {
    vis.push(site_visibility(site, sat));
  })

  return vis;
}

function addVisibilityPlots(vis) {
  // get the div and add new svg
  let svg = d3.select("#visplots")
              .append('svg')
              .attr('width', 1280)
              .attr('height', 1280);

  // get earliest window
  let start = getStart(vis);

  // add the station time segments
  let off = 16;
  let name_off = 100;
  vis.forEach(g_station => {
    for (let i = 0; i < g_station.sat_vis.length; i++) {
      console.log(off)
      createVisPlot(g_station.sat_vis[i], svg, i * 16 + off, start, g_station.name,name_off=name_off);
    }
    off += g_station.sat_vis.length * 16;
  });

  // add the x axis time plot
  for (let i = 0; i < 10; i++) {
    string = satellite.invjday(start).toString()
    svg.append('text')
      .attr('x', name_off + (i * 1000))
      .attr('y', off + 16)
      .text(string);

  }
}

function getStart(vis) {
  let start = Infinity;

  // find min of all elements
  vis.forEach(g_station => {
    //console.log(g_station);
    g_station.sat_vis.forEach(sat => {
      //console.log(sat);
      sat.window.forEach(win => {
        if (win[0] < start) {
          start = win[0];
        }
      });
    });
  });

  return start;
}

function createVisPlot(vis, svg, dy, start, name, name_off=100, width=10000) {
  // create time display data
  console.log(vis);
  console.log(dy);

  svg.append('rect')
    .attr('x', name_off)
    .attr('y', dy)
    .attr('width', 1280)
    .attr('height', 16)
    .attr('stroke', 'black')
    .attr('fill', '#dddddd')

  let x_off = name_off;
  vis.window.forEach(win => {
    let dt = win[1] - win[0];
    // console.log(win[0])

    // console.log(dt);
    // console.log(dy);

    const TIME_OFF = 440;
    let xloc = (win[0] - start) * width + name_off
    svg.append('rect')
      .attr('x', x_off + TIME_OFF)
      .attr('y', dy)
      .attr('width', dt * width)
      .attr('height', 16)
      .attr('stroke', 'black')
      .attr('fill', '#69a3b2')

    // append the time string
    let start_time = satellite.invjday(win[0])
    svg.append('text')
      .attr('x', x_off)
      .attr('y', dy + 16)
      .text(start_time)

    // append the end time
    let end_time = satellite.invjday(win[1])
    svg.append('text')
    .attr('x', x_off + TIME_OFF + dt * width + 5)
    .attr('y', dy + 16)
    .text(formatTimeHMS(end_time))

    x_off += TIME_OFF + 70 + dt * width
  });

  // add a name
  svg.append('text')
    .attr('x', 0)
    .attr('y', dy + 16)
    .text(name);

  // plot visibility data (visibility time)
}

function formatTimeHMS(time) {
  return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
}

function sidereal2UTC(sidereal) {
  // convert the sidereal days into solar days
  let t_diff = new Date();
  t_diff.setHours(23,56,04);

  // number of solar days since 
  let solar_day = t_diff.getUTCDay() * sidereal;


}
