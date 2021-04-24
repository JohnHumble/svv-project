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

    this.lines = [];
  }

  /**
   * Function that clears the map
   */
  clearMap() {

  }

  showVisibility(start=0) {
    console.log("showing visibility")
    // console.log(this.groundStations)
    // console.log(this.satellites)
    let vis = visibility(this.groundStations, this.satellites, start)

    console.log("adding plots");
    console.log(vis);
    addVisibilityPlots(vis);
  }

  clearVisibility() {
    d3.select("#visplots").select('svg').remove()
  }

  updateSatellites(start=20, time=180, step=40) {

    // remove previous
    //d3.select('#map').select('#satellites').select('path').remove();
    console.log("updating satellites");
    //console.log(this.satellites);

    // convert data
    let lla = [];

    // let satData = extractLLA(this.satellites, start);

    console.log(this.satellites);
    let sat_data = extractLLA(this.satellites, start, time, step);
    
    //console.log(sat_data);
    sat_data.forEach(sat => {
      // console.log(sat);
      lla.push(format_lla(sat, start));
    });
    //console.log(lla);
    
    this.plotLine(lla);
  }

  clearLines() {
    console.log('clearing lines')
    // d3.select('#map').select('#satellites').select('path').remove();
    this.lines.forEach(line => {
      line.remove();
    });
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
      let n = svg.append("path")
        .attr("d", path(link))
        .style("fill", "none")
        .style("stroke", "blue")
        .style("stroke-width", 1.5)

      // set previous to next
      prev = next

      this.lines.push(n);
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
  }

  updateObscura(clouds) {
    this.clouds = clouds
    console.log("Clouds", clouds)

    // console.log("There are", Object.keys(clouds).length, "keys")
    // console.log("The", cloudIndex, "-th cloud header is", clouds[cloudIndex].header)
    // console.log("with forecast time", clouds[cloudIndex].header.forecastTime)
    // console.log("with reftime", clouds[cloudIndex].header.refTime)

    // let numAltitudes = clouds.length
    // let numPoints = clouds[0].data.length

    // var averages = new Array(numPoints).fill(0)
    // for (var i = 0; i < numAltitudes; ++i) {
    //   for (var j = 0; j < numPoints; ++j) {
    //     averages[j] += clouds[i].data[j]
    //   }
    // }
    
    // for (var i = 0; i < averages.length; ++i) {
    //   averages[i] /= numAltitudes
    // }
    // // console.log("averages", averages)

    let mapDims = d3.select('#base').node().getBoundingClientRect()
    let mapWidth = Math.floor(mapDims.width)
    let mapHeight = Math.floor(mapDims.height)

    console.log(`map size (${mapWidth}, ${mapHeight})`)

    // Grid points do not line up exactly with lat / long, but they should be 
    // evenly distributed, so we should be able to solve x * 2x = total points 
    // to translate the 1D array of values to a 2D grid. 

    // After translation, the dimensions of our data are (361 x 180)
    let dataWidth = 361;
    let dataHeight = 180;

    let rectWidth = (mapWidth / dataWidth);
    let rectHeight = (mapHeight / dataHeight);

    d3.select('#clouds')
      .selectAll('rect')
      .data(clouds)
      .join('rect')
      .attr('x', (_, i) => 10 + (i % dataWidth) * rectWidth - 1)
      .attr('y', (_, i) => 10 + Math.floor(i / dataWidth) * rectHeight)
      .attr('width', rectWidth + 2)
      .attr('height', rectHeight)
      .style('fill', 'white')
      .style('fill-opacity', d => d / 100)
  }

  /**
   * Renders the actual map
   * @param the json data with the shape of all countries
   */
  drawMap(world) {

    // Draw the background.
    var pathGenerator = d3.geoPath()
      .projection(this.projection)

    // Make sure and add gridlines to the map.
    var graticuleGenerator = d3.geoGraticule();

    // Draw the graticule
    d3.select('#base')
      .selectAll('path.grat')
      .data([graticuleGenerator()])
      .join('path')
      .classed('grat', true)
      .attr('d', pathGenerator);

    // Draw the country shapes
    d3.select('#base')
      .selectAll('path.countries')
      .data(world.features)
      .join('path')
      .classed('countries', true)
      .attr('d', pathGenerator)
      .attr('id', d => d.id)

    this.showVisibility();

    // Need to convert the topoJSON file to geoJSON.
    // var geojson = topojson.feature(world, world.objects.countries);

    // console.log(geojson)

    // function download(content, fileName, contentType) {
    //   var a = document.createElement("a");
    //   var file = new Blob([content], { type: contentType });
    //   a.href = URL.createObjectURL(file);
    //   a.download = fileName;
    //   a.click();
    // }
    // download(JSON.stringify(geojson), 'geojson.txt', 'text/plain');
  }

}
