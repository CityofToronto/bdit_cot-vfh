function choropleth(topojfile, svg, settings, data, fullDimExtent) {
  var mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  cbLayer = chartInner.select(".cbdata"),
  colourScale = d3.scaleSequential().domain([fullDimExtent[0], fullDimExtent[1]])
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
      dataLayer = chartInner.append("g")
        .attr("class", "data");
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
      .attr("d", geoPath);

    map
      .exit()
        .remove();
  },
  drawLegend = function() {
    // https://d3-legend.susielu.com/
    var sett = this.settings,
      svgLeg;

    if (cbLayer.empty()) {
      cbLayer = chartInner.append("g")
        .attr("class", "cbdata")
        .attr("id", "vktlg");

      legSvg = cbLayer
        .append("svg")
        .attr("id", "legSvg");
    }
    else {
      // Remove the svg then reappend an svg to cbLayer
      d3.select('#legSvg').remove();
      legSvg = cbLayer
        .append("svg")
        .attr("id", "legSvg");
    }

    legSvg.append("g")
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

    legSvg.select(".legendSequential")
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
