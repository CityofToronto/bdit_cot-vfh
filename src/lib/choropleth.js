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
    // cts scale: http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f

    var sett = this.settings,
      parent = svg.select(
        svg.classed("svg-shimmed") ? function(){return this.parentNode.parentNode;} : function(){return this.parentNode;}
      ),
      legendwidth = 80,
      legendheight = 200;

    var colorScale1 = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([dimExtent[0], dimExtent[1]]);

      cb = parent.append("svg")
        .attr("class", "mapCB")
        .attr("width", legendwidth)
        .attr("height", legendheight)
        .style("vertical-align", "middle");

    // var cbInner = cb.append("g"),
    cbLayer = cb.select(".cbdata");

    if (cbLayer.empty()) {
      console.log("cbLayer empty")
      cbLayer = cb.append("g")
        .attr("class", "cbdata")
        .attr('transform', 'translate(' + sett.legend.margin.left + ',' +
        sett.legend.margin.top + ')');
    }
    console.log("dimExtent: ", dimExtent)

    continuous("#legend1", colorScale1);

    function continuous(selector_id, colorscale) {
      var canvas = d3.select(selector_id)
        .style("height", legendheight + "px")
        .style("width", legendwidth + "px")
        .style("position", "relative")
        .append("canvas")
        .attr("height", legendheight - sett.legend.margin.top - sett.legend.margin.bottom)
        .attr("width", 1)
        .style("height", (legendheight - sett.legend.margin.top - sett.legend.margin.bottom) + "px")
        .style("width", (legendwidth - sett.legend.margin.left - sett.legend.margin.right) + "px")
        .style("border", "1px solid #000")
        .style("position", "absolute")
        .style("top", (sett.legend.margin.top) + "px")
        .style("left", (sett.legend.margin.left) + "px")
        .node();

      var ctx = canvas.getContext("2d");

      var legendscale = d3.scaleLinear()
        .range([1, legendheight - sett.legend.margin.top - sett.legend.margin.bottom])
        .domain(colorscale.domain());

      var image = ctx.createImageData(1, legendheight);
        d3.range(legendheight).forEach(function(i) {
          var c = d3.rgb(colorscale(legendscale.invert(i)));
          image.data[4*i] = c.r;
          image.data[4*i + 1] = c.g;
          image.data[4*i + 2] = c.b;
          image.data[4*i + 3] = 255;
        });
        ctx.putImageData(image, 0, 0);

      var legendaxis = d3.axisRight()
        .scale(legendscale)
        .tickSize(6)
        .ticks(8);

      var svg = d3.select(selector_id)
        .append("svg")
        .attr("height", (legendheight) + "px")
        .attr("width", (legendwidth) + "px")
        .style("position", "absolute")
        .style("left", "0px")
        .style("top", "0px")

      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (legendwidth - sett.legend.margin.left - sett.legend.margin.right + 3) + "," + (sett.legend.margin.top) + ")")
        .call(legendaxis);
    }
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
