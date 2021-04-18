/** Class implementing the map view. */
class Map {
  /**
   * Creates a Map Object
   */
  constructor() {
    this.projection = d3.geoEquirectangular().scale(150);

    this.groundStations = [];
    this.satellites = [];

  }

  /**
   * Function that clears the map
   */
  clearMap() {

  }

  showVisibility() {
    console.log(this.groundStations)
    console.log(this.satellites)
    let vis = visibility(this.groundStations, this.satellites)

    console.log(vis)

    vis.forEach(g_station => {
      g_station.forEach(sat_vis => {
        console.log(sat_vis);
        if (sat_vis.length > 1) {

          let lla = [];
          sat_vis.forEach(s => {
            lla.push(s.lla);
          });

          this.plotLine(lla);
        }
      })
    });
  }

  updateSatellites(satelliteData) {

    // convert data
    let lla = [];
    satelliteData.forEach(sat => {
      console.log(sat);
      lla.push(format_lla(sat));
    });

    this.plotLine(lla);
  }

  plotLine(lla_data){
    // get the previous location
    let prev = lla_data[0]
    // cycle through each of the location points
    for (let i = 1; i < lla_data.length; i++) {
      // get the next location
      let next = lla_data[i];
      // create link object
      let link = {
        type: "LineString",
        coordinates: [[prev.long, prev.lat], [next.long, next.lat]]
      }
      // get projection
      let path = d3.geoPath()
        .projection(this.projection)

      // select the plot
      let svg = d3.select("svg")

      // append the link
      svg.append("path")
      .attr("d", path(link))
      .style("fill", "none")
      .style("stroke", "blue")
      .style("stroke-width", 1.5)

      // set previous to next
      prev = next
    }
  }

  generateCoverageCircle(long, lat) {
    var path = d3.geoPath().projection(this.projection)

    const circumference = 6371000 * Math.PI * 2;
    let angle = 160934 / circumference * 360;
    var circle = d3.geoCircle().center([long, lat]).radius(angle);

    return path(circle())
  }

  updateGroundStations(groundStations) {
    this.groundStations = groundStations;
    console.log(groundStations);

    // Draw the actual stations
    let stations = d3.selectAll('#grounds')
      .selectAll('circle.groundStation')
      .data(groundStations)

    stations.join('circle')
      .attr('r', 2)
      .attr('transform', d => `translate(${this.projection([d.long, d.lat])})`)
      .classed('groundStation', true)

    stations.join('text')
      .attr('transform', d => `translate(${this.projection([d.long, d.lat])})`)
      .text(d => d.name)

    let coverage = d3.selectAll('#grounds')
      .selectAll('circle.coverage')
      .data(groundStations)

    coverage.join('path')
      .attr('d', d => this.generateCoverageCircle(d.long, d.lat))
      .attr('stroke', 'red')
      .attr('fill', 'none')
  }

  /**
   * Renders the actual map
   * @param the json data with the shape of all countries
   */
  drawMap(world) {

    // Draw the background.
    var pathGenerator = d3.geoPath()
      .projection(this.projection);

    // Make sure and add gridlines to the map.
    var graticuleGenerator = d3.geoGraticule();

    d3.json('/data/world.json')
      .then(function (data) {

        // Need to convert the topoJSON file to geoJSON.
        var geojson = topojson.feature(data, data.objects.countries);

        var graticule = d3.select('#base')
          .selectAll('path.grat')
          .data([graticuleGenerator()]);

        graticule.exit()
          .remove();

        graticule = graticule.enter()
          .append('path')
          .classed('grat', true)
          .attr('d', pathGenerator);

        var map = d3.select('#base')
          .selectAll('path.countries')
          .data(geojson.features);

        map.exit()
          .remove();

        // Assign an id to each country path
        map = map.enter()
          .append('path')
          .classed('countries', true)
          .merge(map)
          .attr('d', pathGenerator)
          .attr('id', d => d.id)
      });

      this.showVisibility();

  }

}
