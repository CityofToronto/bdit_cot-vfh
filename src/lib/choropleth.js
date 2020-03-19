function choropleth(subwayfile, topojfile, svg, settings, data, fullDimExtent) {
            console.log("data: ", data)            
  var mergedSettings = settings,
  propertyKey = settings.z.getPropertyKey.call(settings, data),
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  cbLayer = chartInner.select(".cbdata"),
  legSvg = cbLayer.select(".legSvg"),
  colourScale = d3.scaleSequential().domain([fullDimExtent[0], fullDimExtent[1]])
              .interpolator(mergedSettings.colour.name),
  // hoverlineTip = function(div, tr1, tr2, sett) {
  //   const makeTable = function() {
  //     let rtnTable = `<table class="table-striped"><tr><td>${tr1}</td></tr>`
  //     rtnTable = rtnTable.concat(`<tr><td>${tr2}% PTC volume`);
  //     rtnTable = rtnTable.concat("</table>");
  //     return rtnTable;
  //   };
  //   div.html(makeTable())
  //       .style("opacity", .999)
  //       .style("left", ((d3.event.pageX - sett.tooltip.pageX) + "px"))
  //       .style("top", ((d3.event.pageY - sett.tooltip.pageY) + "px"))
  //       .style("pointer-events", "none")
  //       .style("position", "absolute");
  // },
  draw = function() {
    var sett = this.settings,
      map,
      subwayLayer,
      albersProjection = d3.geoAlbers()
        .parallels([43, 44])
        .scale( 105000 )
        .rotate( [79.388,0] )
        .center( [0, 43.652] )
        .translate( [innerWidth/2,innerHeight/2] ),
      geoPath = d3.geoPath()
        .projection( albersProjection );
    
    console.log("propertyKey: ", propertyKey)

    if (dataLayer.empty()) {
      dataLayer = chartInner.append("g")
        .attr("class", "data");
    }

    map = dataLayer
      .selectAll(".subunit")
      .data(topojson.feature(topojfile, topojfile.objects.to_separated_parts).features,
        sett.z.getId.bind(sett)); // bind an id to each path for controlling enter(), update()

    map
      .exit()
        .remove();

    map
      .enter().append("path")
      .attr("class", "subunit new")
      .attr("d", geoPath)
      .attr("id", function(d) {
        return `nn_${d.properties.area_s_cd}`;
      })
      .merge(map)
      .style("fill", function(d) {
        if (d.properties.area_s_cd === 141 || d.properties.area_s_cd === 142) {
          return sett.colour.null;
        } else {
          var val = data.find(element => element.area_s_cd === d.properties.area_s_cd)[propertyKey];
          return colourScale(val);
        }
      })
      .on("touchmove mousemove", function(d) {
        if (d.properties.area_s_cd !== 141 && d.properties.area_s_cd !== 142) {
          var val = data.find(element => element.area_s_cd === d.properties.area_s_cd)[propertyKey];
          let selectedPath = d3.select(this);
          val <= 10.5 ? selectedPath.classed("nnActiveDarkGray", true) :
            selectedPath.classed("nnActiveGray", true);
          selectedPath.moveToFront();
          d3.selectAll(".subway").moveToFront(); // otherwise lines disappear
          var tr1 = d.properties.area_name.split(" (")[0];
          const tr2 = sett.tooltip.values.call(sett, val);
          hoverlineTip(vktMapTip, tr1, tr2, sett);
        }
      })
      .on("touchend mouseleave", function(d) {
        d3.selectAll("#vktmap path").classed("nnActiveDarkGray", false);
        d3.selectAll("#vktmap path").classed("nnActiveGray", false);
        vktMapTip.style("opacity", 0);
      });

    map
      .attr("class", "subunit updated")
      .attr("d", geoPath)
      .attr("id", function(d) {
        return `nn_${d.properties.area_s_cd}`;
      })
      .merge(map)
      .style("fill", function(d) {
        if (d.properties.area_s_cd === 141 || d.properties.area_s_cd === 142) {
          return sett.colour.null;
        } else {
          var val = data.find(element => element.area_s_cd === d.properties.area_s_cd)[propertyKey];
          return colourScale(val);
        }
      });

    // Add subway
    subwayLayer = dataLayer
      .selectAll(".subway")
      .data(topojson.feature(subwayfile, subwayfile.objects.subway).features)
      .enter().append("path")
      .attr("d", geoPath)
      .attr("class", "subway");

  },
  drawLegend = function() {
    // https://d3-legend.susielu.com/
    var sett = this.settings;

    if (legSvg.empty()) {
      cbLayer = chartInner.append("g")
        .attr("class", "cbdata")
        .attr("id", sett.legend.id);

      legSvg = cbLayer
        .append("svg")
        .attr("class", "legSvg");

      legSvg.append("g")
        .attr("id", svg.id)
        .attr("class", "legendShared")
        .attr("transform", "translate(" + sett.legend.trans[0] + "," +
              sett.legend.trans[1] + ") rotate(-" + sett.rot + ")")
        .attr("role", "img")
        .attr("aria-label", mergedSettings.legend.alt);
    } else {
      if (sett.rmlegend) {
        d3.select(`#${svg.id}`).select(".legendShared")
          .remove();
      }      
    }

    var legendParams = d3.legendColor()
      .shapeWidth(30)
      .shapeHeight(10)
      .shapePadding(1)
      .title(svg.legTitle)
      .cells(sett.legend.cells)
      .orient(sett.legend.orient)
      .labelOffset(5)
      .labelAlign(sett.legend.labelAlign)
      .scale(colourScale);

    legSvg.select(`#${svg.id}`)
      .call(legendParams);

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
