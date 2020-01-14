function choropleth(topojfile, svg, settings, data) {
  console.log("ptcvol data: ", data)
  var mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  transition = d3.transition()
    .duration(1000),
  draw = function() {
    var sett = this.settings,
    flatData = [].concat.apply([], data.map(function(d) {
      return sett.z.getDataPoints.call(sett, d);
    })).sort(function(a, b) {return a-b;}),
    dimExtent = d3.extent(flatData),
    colourScale = d3.scaleSequential().domain([dimExtent[0], dimExtent[1]])
                .interpolator(mergedSettings.colour.name),
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
      .data(topojson.feature(topojfile, topojfile.objects.neighbourhoods_all).features)
      .enter().append("path")
      .attr("class", function(d) { return "subunit " + "nn_"+ d.properties.area_s_cd; })
      .attr("d", geoPath)
      .style("fill", function(d) {
        var val = data.find(element => element.area_s_cd === d.properties.area_s_cd).prop;
        return colourScale(val);
      });
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
