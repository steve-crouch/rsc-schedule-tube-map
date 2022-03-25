var container = d3.select("#tube-map");
var json_datafile = container.attr("data-csv");
var width = 1600;
var height = 1000;

d3.json(json_datafile)
.then(jsondata => {
  var activities = jsondata;

  var map = d3
    .tubeMap()
    .width(width)
    .height(height)
    .margin({
      top: 20,
      right: 20,
      bottom: 40,
      left: 100,
    })
    .on("click", function (name) {
      window.location.href = activities.stations[name].website;
    });

  container.datum(activities).call(map);

  var svg = container.select("svg");

  zoom = d3.zoom().scaleExtent([0.3, 6]).on("zoom", zoomed);
  var zoomContainer = svg.call(zoom);
  var initialScale = 0.6;
  var initialTranslate = [0, 0];
  zoom.scaleTo(zoomContainer, initialScale);
  zoom.translateTo(
    zoomContainer,
    initialTranslate[0],
    initialTranslate[1]
  );

  function zoomed(event) {
    svg.select("g").attr("transform", event.transform.toString());
  }
});
