function choropleth(topojfile, svg, settings, data) {
  console.log(data)
  var mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  cbLayer = chartInner.select(".cbdata"),
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
      .scale( 110000 )
      .rotate( [79.388,0] )
      .center( [0, 43.652] )
      .translate( [innerWidth/2,innerHeight/2] ),
    geoPath = d3.geoPath()
      .projection( albersProjection );

    if (dataLayer.empty()) {
      console.log("dataLayer empty")
      dataLayer = chartInner.append("g")
        .attr("class", "data");

      cbLayer = chartInner.append("g")
        .attr("class", "cbdata")
        .attr("id", "vktlg");
    }

    map = dataLayer
      .selectAll(".subunit")
      .data(topojson.feature(topojfile, topojfile.objects.neighbourhoods_all).features);

    map
      .enter().append("path")
      .attr("d", geoPath)
      .style("fill", function(d) {
        var val = data.find(element => element.area_s_cd === d.properties.area_s_cd).prop;
        return colourScale(val);
      });

    map
      .transition(transition)
      .attr("d", geoPath);

    map
      .exit()
        .remove();
  },
  drawLegend = function() {
    console.log("drawLegend")
    // https://d3-legend.susielu.com/

    var sett = this.settings,
      leg;

    leg = d3.select(".cbdata").append("svg");

    leg.append("g")
      .attr("class", "legendSequential")
      .attr("transform", "translate(" + sett.legend.trans[0] + "," +
            sett.legend.trans[1] + ") rotate(-" + sett.rot + ")")
      .attr("role", "img")
      .attr("aria-label", mergedSettings.legend.alt);

    var legendSequential = d3.legendColor()
      .shapeWidth(30)
      .shapeHeight(10)
      .shapePadding(1)
      .title(sett.legend.title)
      .cells(10)
      .orient(sett.legend.orient)
      .labels(
        function({
          i,
          genLength,
          generatedLabels,
          labelDelimiter
        }) {
          if (i === genLength - 1) {
            const values = generatedLabels[i].split(` ${labelDelimiter} `)
            return `${values[0]} %`
          }
          return generatedLabels[i]
        }
      )
      .labelOffset(5)
      .labelAlign(sett.legend.labelAlign)
      .scale(colourScale)

    leg.select(".legendSequential")
      .call(legendSequential);

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
