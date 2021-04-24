/**
 * Control class for the forecast view
 */
class Forecast {

  INDEX_STEP = 60 * 60 * 1000 // 1 hour in milliseconds

  /**
   * Constructor
   * 
   * map = The map object to update
   */
  constructor(map) {
    // Time indices
    this.epoch = new Date("2021-04-19T00:00:00.000Z");
    this.index = 0;
    this.time = new Date(this.epoch);

    // Need this to update the map object
    this.maplink = map;

    // Cache the cloud data
    this.clouds = {};
  }

  /**
   * Changes the values displayed on the page to the values stored in this class.
   */
  display() {
    d3.select('#forecastEpoch')
      .text(`Forecast Epoch: ${this.epoch.toISOString()}`)

    d3.select('#forecastDate')
      .text(`Displayed Time: ${this.time.toISOString()}`)

    d3.select('#forecastTime')
      .property('value', this.index)
  }

  /**
   * Changes the values in this class based on a change to the input slider.
   * 
   * value - value of the input slider. Must be a multiple of 3 beween 0 and 384.
   */
  update(value) {
    this.index = value;
    this.time.setTime(this.epoch.getTime() + (value * this.INDEX_STEP));

    var fileIndex = value.toString().padStart(3, '0');

    d3.json(`data/clouds/clouds_0000_${fileIndex}.json`)
      .then(function (clouds) {
        worldMap.updateObscura(clouds)
      });

    this.display();
  }
}
