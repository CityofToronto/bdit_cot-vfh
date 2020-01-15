function choropleth(topojfile, svg, settings, data) {
  var mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  transition = d3.transition()
    .duration(1000),
  flatData = [].concat.apply([], data.map(function(d) {
    return mergedSettings.z.getDataPoints.call(mergedSettings, d);
  })).sort(function(a, b) {return a-b;}),
  dimExtent = d3.extent(flatData),
  colourScale = d3.scaleSequential().domain([dimExtent[0], dimExtent[1]])
              .interpolator(mergedSettings.colour.name),
  draw = function() {
    var sett = this.settings,
    map,
    albersProjection = d3.geoAlbers()
      .parallels([43, 44])
      .scale( 85000 )
      .rotate( [79.388,0] )
      .center( [0, 43.652] )
      .translate( [innerWidth/2,innerHeight/2] ),
    geoPath = d3.geoPath()
      .projection( albersProjection );

    if (dataLayer.empty()) {
      dataLayer = chartInner.append("g")
        .attr("class", "data");
    }

    map = dataLayer
      .selectAll(".subunit")
      .data(topojson.feature(topojfile, topojfile.objects.neighbourhoods_all).features);

    map
      .enter().append("path")
      .attr("class", function(d) { return "subunit " + "nn_"+ d.properties.area_s_cd; })
      .attr("d", geoPath)
      .style("fill", function(d) {
        var val = data.find(element => element.area_s_cd === d.properties.area_s_cd).prop;
        return colourScale(val);
      });

    map
      .attr("class", function(d) { return "subunit " + "nn_"+ d.properties.area_s_cd; })
      .transition(transition)
      .attr("d", geoPath);

    map
      .exit()
        .remove();
  },
  drawLegend = function() {
    // https://bl.ocks.org/mbostock/4573883
    // https://d3-legend.susielu.com/

    var sett = this.settings,
      parent = svg.select(
        svg.classed("svg-shimmed") ? function(){return this.parentNode.parentNode;} : function(){return this.parentNode;}
      ),
      cb = parent.append("g")
                .attr("id", sett.legend.id)

    console.log("colourScale(min): ", colourScale(dimExtent[0]))
    console.log("colourScale(max): ", colourScale(dimExtent[1]))
    console.log("dimExtent ", colourScale(5.0647601854519495))

    var formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

    var threshold = d3.scaleThreshold()
        .domain([0, 5, 10])
        .range(["#FFFFCC", "#FD9942","#800026"]);

    var x = d3.scaleLinear()
        .domain([0, 1])
        .range([dimExtent[0], dimExtent[1]]);

    var xAxis = d3.axisBottom(x)
        .tickSize(13)
        .tickValues(threshold.domain())
        .tickFormat(function(d) { return d === 10 ? formatPercent(d) : formatNumber(d); });

    var cbNode = d3.select("#" + sett.legend.id).call(xAxis);

    cbNode.select(".domain")
      .remove();

    cbNode.selectAll("rect")
      .data(threshold.range().map(function(color) {
        var d = threshold.invertExtent(color);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
      .enter().insert("rect", ".tick")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return threshold(d[0]); });

    cbNode.append("text")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("y", -6)
        .text("Percentage of stops that involved force");

  },
  clear = function() {
    dataLayer.remove();
  },
  rtnObj, process;

  rtnObj = {
    settings: mergedSettings,
    clear: clear,
    svg: svg
  };

  svg
    .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img")
    .attr("aria-label", mergedSettings.alt);


  if (chartInner.empty()) {
    chartInner = svg.append("g")
      .attr("class", "margin-offset")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," +
            mergedSettings.margin.top + ") rotate(" + mergedSettings.rot + ")");

  }

  process = function() {
    draw.apply(rtnObj);
    d3.stcExt.addIEShim(svg, outerHeight, outerWidth);
    if (mergedSettings.legend.maplegend === false) return;
    drawLegend.apply(rtnObj);
  };
  if (data === undefined) {
    d3.json(mergedSettings.url, function(error, xhr) {
      data = xhr;
      process();
    });
  } else {
    process();
  }

return rtnObj;
}
