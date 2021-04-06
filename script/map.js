/** Class implementing the map view. */
class Map {
  /**
   * Creates a Map Object
   */
  constructor() {
    this.projection = d3.geoEquirectangular().scale(150).translate([400, 350]);

  }

  /**
   * Function that clears the map
   */
  clearMap() {

  }

  updateMap(worldcupData) {

    //Clear any previous selections;
    this.clearMap();

    console.log(worldcupData)

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

        var graticule = d3.select('#map')
          .selectAll('path.grat')
          .data([graticuleGenerator()]);

        graticule.exit()
          .remove();

        graticule = graticule.enter()
          .append('path')
          .classed('grat', true)
          .attr('d', pathGenerator);

        var map = d3.select('#map')
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
