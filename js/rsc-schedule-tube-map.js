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
var width = 300;
var height = 300;

d3.json(json_datafile)
.then(jsondata => {
  var activities = jsondata;

  var map = d3
    .tubeMap()
    //.width(width)
    //.height(height)
    .margin({
      top: 60,
      right: 60,
      bottom: 60,
      left: 300,
    })
    .on("click", function (name) {
      window.location.href = activities.stations[name].website;
    });
  container.datum(activities).call(map);

  var svg = container.select("svg");
  svg
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "150 30 625 50")
    .attr("class", "svg-map-content");


  zoom = d3.zoom().scaleExtent([0.3, 6]).on("zoom", zoomed);
  var zoomContainer = svg.call(zoom);
  var initialScale = 1;
  var initialTranslate = [0, 0];
  zoom.scaleTo(zoomContainer, initialScale);
  /*zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
  );*/

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
          .attr("x", x - 20)
          .attr("y", y)
          .attr("dy", 0)
          .attr("text-anchor", "end")
          .attr("class", "title")
          .style("font-size", "1em")
          .style("font-weight", "bold")
          .text(line.label)
          .call(wrap);    // reformat the text over multiple lines
      }
    });
  });

  function zoomed(event) {
    svg.select("g").attr("transform", event.transform.toString());
  }

/*
  function updateWindow(){
    x = w.innerWidth || e.clientWidth || g.clientWidth;
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    svg.attr("width", x).attr("height", y);
  }
*/
//  d3.select(window).on('resize.updatesvg', updateWindow);

});
