function lineChart(svg, settings, rawdata) {
  // This fn is a little bit different from the lineChart component in that it
  // plots only one line at a time, according to the user selection, but accepts
  // more than one line in the rawdata object that is passed as an argument to
  // allow caluclation of the full y-domain scale.
  // If there is only one line, data = rawdata, and the scale is calculated as
  // usual: y.domain(sett.y.getDomain.call(sett, flatData))
  // Else data = rawdata[for the selected line] but the scale is calculated from
  // the FULL EXTENT of the rawdata: y.domain(fullExtent(sett, rawdata))
  var data = settings.z.reduceData ? settings.z.reduceData.call(settings, rawdata) :
    rawdata,
  mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  line = d3.line()
    .defined(function(d) {
      if (d) return d;
    })
    .x(function() {
      return x(mergedSettings.x.getValue.apply(mergedSettings, arguments));
    })
    .y(function() {
      return y(mergedSettings.y.getValue.apply(mergedSettings, arguments));
    }),
  transition = d3.transition()
    .duration(1000),
  draw = function() {
    var sett = this.settings,
      filteredData = (sett.filterData && typeof sett.filterData === "function") ?
        sett.filterData.call(sett, data) : data,
      flatData = [].concat.apply([], filteredData.map(function(d) {
        return sett.z.getDataPoints.call(sett, d);
      })),
      showLabel = sett.showLabels !== undefined ? sett.showLabels : filteredData.length > 1,
      xAxisObj = chartInner.select(".x.axis"),
      yAxisObj = chartInner.select(".y.axis"),
      getXScale = function() {
        switch(sett.x.type) {
        case "linear":
          return d3.scaleLinear();
        case "ordinal":
          return d3.scaleOrdinal();
        default:
          return d3.scaleTime();
        }
      },
      labelX = innerWidth,
      labelY = function(d) {
        var points = mergedSettings.z.getDataPoints(d);
        return y(mergedSettings.y.getValue.call(sett, points[points.length - 1]));
      },
      classFn = function(d,i){
        var cl = "dline dline" + (i + 1);
        if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
          cl += " " + sett.z.getClass.apply(sett, arguments);
        }
        return cl;
      },
      lineFn = function() {
        return line(sett.z.getDataPoints.apply(sett, arguments));
      },
      lines, labels;

    x = rtnObj.x = getXScale().range(sett.x.getRange.call(sett, flatData));
    y = rtnObj.y = d3.scaleLinear().range([innerHeight, 0]);

    x.domain(sett.x.getDomain.call(sett, flatData));
    if (Object.keys(rawdata).length > 2) {
      y.domain(fullExtent(sett, rawdata));
    } else y.domain(sett.y.getDomain.call(sett, flatData));
    if (dataLayer.empty()) {
      dataLayer = chartInner.append("g")
        .attr("class", "data");
    }

    lines = dataLayer.selectAll(".dline")
      .data(filteredData, sett.z.getId.bind(sett));

    lines
      .enter()
      .append("path")
        .attr("class", classFn)
        .attr("fill", "none")
        .attr("d", lineFn);

    lines
      .attr("class", classFn)
      .transition(transition)
      .attr("d", lineFn);

    lines
      .exit()
        .remove();

    labels = dataLayer.selectAll(".line-label")
      .data(
        function() {
          if (typeof showLabel === "function") {
            return filteredData.filter(showLabel.bind(sett));
          } else if (showLabel === false) {
            return [];
          }
          return filteredData;
        }()
        , sett.z.getId.bind(sett)
      );

    labels
      .enter()
        .append("text")
          .text(sett.z.getText.bind(sett))
          .attr("aria-hidden", "true")
          .attr("class", "line-label")
          .attr("fill", "#000")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "end");

    labels
      .transition(transition)
      .attr("y", labelY);

    labels
      .exit()
        .remove();

    // if (xAxisObj.empty()) {
    if (yAxisObj.empty()) {
      xAxisObj = chartInner.append("g")
      .attr("class", "x axis")
      .attr("aria-hidden", "true")
      .attr("transform", "translate(0," + innerHeight + ")");

      xAxisObj
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("x", innerWidth)
          // .attr("dy", "-0.5em")
          .attr("dy", sett.x.chartlabel) // x-axis label
          .attr("text-anchor", "end")
          .text(sett.x.label);

      if (sett.extraXlabelX) {
        var extraGroup = xAxisObj
          // .attr("class", "extra-label")
          .selectAll(".xdow")
          .data(Object.keys(sett.extraXlabelX));

        var eachGroup = extraGroup
          .enter()
          .append("g")
          .attr("class", "extra-label");

        eachGroup
          .append("text")
          .attr("fill", "#000")
          .attr("x", function(d, i) {
            return Object.values(sett.extraXlabelX)[i];
          })
          .attr("dy", sett.extraXlabelY)
          .attr("text-anchor", "end")
          .text(function(d) {
            return d;
          })
      }
    } else {
      xAxisObj.select("text").text(settings.x.label);
    }
    xAxisObj.call(
      d3.axisBottom(x)
        .ticks(sett.x.ticks)
        .tickValues(sett.z.getxtickIdx ? sett.z.getxtickIdx.call(sett, filteredData) : null)
        .tickFormat(sett.x.getTickText ? sett.x.getTickText.bind(sett) : null)
        .tickSize(sett.tickSize ? sett.tickSize : 6)
    );

    if (yAxisObj.empty()) {
      yAxisObj = chartInner.append("g")
        .attr("class", "y axis")
        .attr("aria-hidden", "true");

      yAxisObj
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("y", "0")
          .attr("dy", "-0.5em")
          .attr("text-anchor", "start")
          .text(sett.y.label);
    } else {
      yAxisObj.select("text").text(settings.y.label);
    }
    yAxisObj.call(
      d3.axisLeft(y)
        .ticks(sett.y.ticks)
        .tickFormat(sett.y.getTickText ? sett.y.getTickText.bind(sett) : null)
        .tickSize(sett.tickSize ? sett.tickSize : 6)
    );
  },
  clear = function() {
    dataLayer.remove();
  },
  x, y, rtnObj, process;

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
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
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
