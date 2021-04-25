
function single_visibility(ground_site, sat, t_ahead, step, start) {
  let sat_locs = propagate_sat(sat, t_ahead, step, start);

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

  return { 'visible': visible, 'window': windows };
}

function site_visibility(ground_site, sat, t_ahead, step, start) {
  let sat_visability = [];

  sat.forEach(sat => {
    sat_visability.push(single_visibility(ground_site, sat, t_ahead, step, start));
  });
  return { 'sat_vis': sat_visability, 'name': ground_site.name, 'sats': sat };
}

function visibility(ground_sites, sat, start = 0, t_ahead = 180, step = 1) {
  let vis = [];

  ground_sites.forEach(site => {
    vis.push(site_visibility(site, sat, t_ahead, step, start));
  })

  return vis;
}

const TIME_OFF = 440;

function addVisibilityPlots(vis, colors = undefined) {

  let div_width = getSize(vis) * TIME_OFF * 2.2;
  // get the div and add new svg
  let svg = d3.select("#visplots")
    .append('svg')
    .attr('width', div_width)
    .attr('height', 1430);

  // get earliest window
  let start = getStart(vis);

  // add the station time segments

  let off = 18;
  let name_off = 160;

  addTimePlot(svg, start, name_off);

  vis.forEach(g_station => {
    for (let i = 0; i < g_station.sat_vis.length; i++) {
      // console.log(off)
      console.log(g_station);
      createVisPlot(
        g_station.sat_vis[i], 
        svg, 
        i * 16 + off, 
        start, 
        g_station.name, 
        g_station.sats[i].satnum, 
        '#1111FF', 
        div_width, name_off);
    }
    off += g_station.sat_vis.length * 16;
  });

  return svg;
}

function getSize(vis) {
  let size = 0;

  // find maximum length of windows
  vis.forEach(g_station => {
    g_station.sat_vis.forEach(sat => {
      let s_l = sat.window.length;
      if (s_l > size) {
        size = s_l;
      }
    })
  });

  return size;
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

function addTimePlot(svg, start, name_off, width = 3, step = 15, time = 180) {

  // add time scale
  for (let i = 0; i < time; i += step) {

    // convert to sidereal day then multiply by width
    let x = i * width;

    //let text = satellite.invjday(start + day);
    let hour = Math.floor(i / 60);
    let minute = i % 60;

    let text = "" + hour + ":" + minute;

    svg.append('text')
      .attr('x', name_off + x)
      .attr('y', 16)
      .text(text)
  }
}

function sidereal2min(sidereal) {
  return sidereal * 1436.068183;
}
//23 hours 56 minutes 4.091

function createVisPlot(vis, svg, dy, start, name, satname, color = '#69a3b2', div = 1280, name_off = 100, width = 3) {

  // make for every 15 seconds
  let step = 15;
  for (let i = 0; i < 180; i += step) {
    let dx = width * step;
    let x = i * width;

    svg.append('rect')
      .attr('x', name_off + x)
      .attr('y', dy)
      .attr('width', dx)
      .attr('height', 16)
      .attr('stroke', '#dddddd')
      .attr('fill', '#aaaaaa')
  }

  let x_off = name_off;
  vis.window.forEach(win => {
    let dt = win[1] - win[0];


    if (!isNaN(dt)) {
      // append the visibility window
      let xloc = sidereal2min(win[0] - start) * width + name_off

      svg.append('rect')
        .attr('x', x_off + xloc)
        .attr('y', dy)
        .attr('width', sidereal2min(dt) * width)
        .attr('height', 16)
        .attr('stroke', 'black')
        .attr('fill', color)

      x_off += TIME_OFF + TIME_OFF + dt * width
    }
  });

  // add a name
  svg.append('text')
    .attr('x', 0)
    .attr('y', dy + 16)
    .text(name + " " + satname);
  console.log(satname);
}

function formatTimeHMS(time) {
  return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
}
