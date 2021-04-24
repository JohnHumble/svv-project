/** Class implementing the map view. */
class Map {
  /**
   * Creates a Map Object
   */
  constructor() {
    this.projection = d3.geoEquirectangular().scale(150);

    this.groundStations = [];
    this.satellites = [];
    this.obscura = [];

    this.obscuraEpoch = "2021-04-19T00:00:00.000Z"
  }

  /**
   * Function that clears the map
   */
  clearMap() {

  }

  showVisibility() {
    // console.log(this.groundStations)
    // console.log(this.satellites)
    let vis = visibility(this.groundStations, this.satellites)

    // console.log(vis)

    vis.forEach(g_station => {
      g_station.sat_vis.forEach(sat_vis => {
        // console.log(sat_vis);
        if (sat_vis.visible.length > 1) {

          let lla = [];
          sat_vis.visible.forEach(s => {
            // console.log(s);
            lla.push(s.lla);
          });

          this.plotLine(lla);
        }
      })
    });

    addVisibilityPlots(vis);
  }

  updateSatellites(satelliteData) {

    // convert data
    let lla = [];
    satelliteData.forEach(sat => {
      // console.log(sat);
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
      let svg = d3.select("#satellites")

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

  updateGroundStations(groundStations) {
    this.groundStations = groundStations;
    // console.log(groundStations);

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

    // coverage.join('path')
    //   .attr('d', d => this.generateCoverageCircle(d.long, d.lat))
    //   .attr('stroke', 'red')
    //   .attr('fill', 'none')
  }

  updateObscura(clouds) {
    this.clouds = clouds
    // console.log("Clouds", clouds)

    // console.log("There are", Object.keys(clouds).length, "keys")
    // console.log("The", cloudIndex, "-th cloud header is", clouds[cloudIndex].header)
    // console.log("with forecast time", clouds[cloudIndex].header.forecastTime)
    // console.log("with reftime", clouds[cloudIndex].header.refTime)

    let numAltitudes = clouds.length
    let numPoints = clouds[0].data.length

    var averages = new Array(numPoints).fill(0)
    for (var i = 0; i < numAltitudes; ++i) {
      for (var j = 0; j < numPoints; ++j) {
        averages[j] += clouds[i].data[j]
      }
    }
    
    for (var i = 0; i < averages.length; ++i) {
      averages[i] /= numAltitudes
    }
    // console.log("averages", averages)

    let mapDims = d3.select('#base').node().getBoundingClientRect()
    let mapWidth = Math.floor(mapDims.width)
    let mapHeight = Math.floor(mapDims.height)

    // console.log(`map size (${mapWidth}, ${mapHeight})`)

    // Grid points do not line up exactly with lat / long, but they should be 
    // evenly distributed, so we should be able to solve x * 2x = total points 
    // to translate the 1D array of values to a 2D grid. 

    // After translation, the dimensions of our data are (361 x 180)
    let dataWidth = 361;
    let dataHeight = 180;

    let rectWidth = (mapWidth / dataWidth);
    let rectHeight = (mapHeight / dataHeight);

    var weather = d3.select('#clouds')
      .selectAll('rect')
      .data(averages)
      .join('rect')
        .attr('x', (_, i) => 10 + (i % dataWidth) * rectWidth - 1)
        .attr('y', (_, i) => 10 + Math.floor(i / dataWidth) * rectHeight)
        .attr('width', rectWidth + 2)
        .attr('height', rectHeight)
        .style('fill', 'white')
        .style('fill-opacity', d => 1 - d)

    // weather.exit()
    //        .remove();

    // weather.enter()
    //        .append('rect')
    //        .attr('x', (_, i) => 10 + (i % dataWidth) * rectWidth - 1)
    //        .attr('y', (_, i) => 10 + Math.floor(i / dataWidth) * rectHeight)
    //        .attr('width', rectWidth + 2)
    //        .attr('height', rectHeight)
    //        .style('fill', 'white')
    //        .style('fill-opacity', d => 1 - d)

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

    // Need to convert the topoJSON file to geoJSON.
    var geojson = topojson.feature(world, world.objects.countries);

    var graticule = d3.select('#base')
      .selectAll('path.grat')
      .data([graticuleGenerator()]);

    graticule.exit()
      .remove();

    graticule = graticule.enter()
      .append('path')
      .classed('grat', true)
      .attr('d', pathGenerator);

    var countries = d3.select('#base')
      .selectAll('path.countries')
      .data(geojson.features);

    countries.exit()
      .remove();

    // Assign an id to each country path
    countries = countries.enter()
      .append('path')
      .classed('countries', true)
      .merge(countries)
      .attr('d', pathGenerator)
      .attr('id', d => d.id)

    // console.log(graticule.node().getBoundingClientRect())

    // var map = d3.select('#map')

    this.showVisibility();

  }

}
