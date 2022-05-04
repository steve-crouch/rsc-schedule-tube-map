function wrap(text) {
  /**
   * Reformat svg text over multiple lines, with middle vertical alignment
   * @param  {Element} text SVG text element to apply wrapping
   */
  text.each(function () {
    var text = d3.select(this);
    var lines = text.text().split(/\n/);

    var y = text.attr('y');
    var x = text.attr('x');
    var dy = parseFloat(text.attr('dy')) - ((lines.length * 1.1)/2) + 0.55;

    text.text(null);

    for (var lineNum = 0; lineNum < lines.length; lineNum++) {
      text
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', lineNum * 1.1 + dy + 'em')
        .attr('dominant-baseline', "middle")
        .text(lines[lineNum]);
    }
  });
}

var container = d3.select("#tube-map");
var json_datafile = "../data/" + container.attr("map-csv");
var map_x = container.attr("map-x");
var map_y = container.attr("map-y");
var width = container.attr("map-width");
var height = container.attr("map-height");
var height_prop = container.attr("map-height-proportion");
var map_min_zoom = container.attr("map-min-zoom");
var map_max_zoom = container.attr("map-max-zoom");

d3.json(json_datafile)
  .then(jsondata => {

  var activities = jsondata;

  var map = d3
    .tubeMap()
    .on("click", function (name) {
      window.location.href = activities.stations[name].website;
    });
  container.datum(activities).call(map);
  container.style("padding-top", height_prop);

  var svg = container.select("svg");
  svg
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", map_x + " " + map_y + " " + width + " " + height)
    .attr("class", "svg-map-content");

  // Revisit each line adding its label anchored to the first line waypoint
  svg.select(".lines").selectAll("path").each(function (d, i) {
    // Extract first waypoint coords from path
    var x = d3.select(this).node().getPointAtLength(0).x
    var y = d3.select(this).node().getPointAtLength(0).y
    var roleName = this.id;

    activities.lines.forEach(function (line) {
      if (line.name == roleName) {
        svg.select("g")
          .append("text")
          .attr("x", x - 10)
          .attr("y", y)
          .attr("dy", 0)
          .attr("text-anchor", "end")
          .attr("class", "title")
          .style("font-size", "0.8em")
          .style("font-weight", "bold")
          .text(line.label)
          .call(wrap);    // reformat the text over multiple lines
      }
    });
  });

  var zoom = d3.zoom()
    .scaleExtent([map_min_zoom, map_max_zoom])
    .translateExtent([[map_x, map_y], [width, height]])
    .on("zoom", zoomed);
  var zoomContainer = svg.call(zoom);
  var initialScale = map_min_zoom;
  zoom.scaleTo(zoomContainer, initialScale);

  var initialTranslate = [0, 0];
  zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
  );

  function zoomed(event) {
    svg.select("g").attr("transform", event.transform);
  }

});
