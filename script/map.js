/** Class implementing the map view. */
class Map {
  /**
   * Creates a Map Object
   */
  constructor() {
    this.projection = d3.geoEquirectangular().scale(150);

  }

  /**
   * Function that clears the map
   */
  clearMap() {

  }

  updateSatellites(satelliteData) {

    //Clear any previous selections;
    console.log(satelliteData)
    let points = d3.selectAll('#grounds')
      .selectAll('circle.groundStation')
      .data(satelliteData)
  
    points.join('circle')
      .attr('r', 2)
      .attr('transform', d => `translate(${this.projection([d.long, d.lat])})`)
      .classed('groundStation', true)
      console.log('dub')

  }

  generateCoverageCircle(long, lat) {
    var path = d3.geoPath().projection(this.projection)

    const circumference = 6371000 * Math.PI * 2;
    let angle = 160934 / circumference * 360;
    var circle = d3.geoCircle().center([long, lat]).radius(angle);

    return path(circle())
  }

  updateGroundStations(groundStations) {

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

  }

}
