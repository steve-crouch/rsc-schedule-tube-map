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
var json_datafile = container.attr("data-csv");
var height = container.attr("height");

d3.json(json_datafile)
.then(jsondata => {
  var activities = jsondata;

  var map = d3
    .tubeMap()
    .margin({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    })
    .on("click", function (name) {
      window.location.href = activities.stations[name].website;
    });
  container.datum(activities).call(map);
  container.style("height", height);

  var svg = container.select("svg");
  svg
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 800 400")
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
          .style("font-size", "1.0em")
          .style("font-weight", "bold")
          .text(line.label)
          .call(wrap);    // reformat the text over multiple lines
      }
    });

  });

  var zoom = d3.zoom()
    .scaleExtent([0.9, 1.5])
    .translateExtent([[-120, -30], [750, height]])
    .on("zoom", zoomed);
  var zoomContainer = svg.call(zoom);
  var initialScale = 0.9;
  zoom.scaleTo(zoomContainer, initialScale);

  var initialTranslate = [0, 60];
  zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
  );

  function zoomed(event) {
    svg.select("g").attr("transform", event.transform);
  }

});
