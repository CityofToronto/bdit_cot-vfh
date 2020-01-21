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
  hoverlineTip = function(div, nn, val) {
    const makeTable = function() {
      let rtnTable = `<table class="table-striped"><tr><td>${nn.split(" (")[0]}</td></tr>`
      rtnTable = rtnTable.concat(`<tr><td>${d3.format("(.1f")(val)}% PTC volume`);
      rtnTable = rtnTable.concat("</table>");
      return rtnTable;
    };

    div.html(makeTable())
        .style("opacity", .999)
        .style("left", ((d3.event.pageX - 400) + "px"))
        .style("top", ((d3.event.pageY - 450) + "px"))
        .style("pointer-events", "none");
  },
  draw = function() {
    var sett = this.settings,
      map,
    albersProjection = d3.geoAlbers()
      .parallels([43, 44])
      .scale( 105000 )
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
      .attr("id", function(d) {
        return `nn_${d.properties.area_s_cd}`;
      })
      .style("fill", function(d) {
        var val = data.find(element => element.area_s_cd === d.properties.area_s_cd).prop;
        return colourScale(val);
      })
      .on("mouseover", function(d) {
        // d3.selectAll(".link:not(#" + this.id + ")").style("opacity", 0.5);
        console.log("mouseover: ", d.properties.area_name)
        var val = data.find(element => element.area_s_cd === d.properties.area_s_cd).prop;
        console.log("val: ", val)
        const selectedPath = d3.select(this);
        val <= 10.5 ? selectedPath.classed("nnActiveDarkGray", true) :
          selectedPath.classed("nnActiveGray", true);
        selectedPath.moveToFront();

        hoverlineTip(vktMapTip, d.properties.area_name, val);
      })
      .on("mouseout", function(d) {
        d3.selectAll("#vktmap path").classed("nnActiveDarkGray", false);
        d3.selectAll("#vktmap path").classed("nnActiveGray", false);
        vktMapTip.style("opacity", 0);
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
      .cells(sett.legend.cells)
      .orient(sett.legend.orient)
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

  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  };
  d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
      const firstChild = this.parentNode.firstChild;
      if (firstChild) {
        this.parentNode.insertBefore(this, firstChild);
      }
    });
  };

return rtnObj;
}
