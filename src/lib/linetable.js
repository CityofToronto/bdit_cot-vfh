function lineTable(svg, settings, data, day) {
  var mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),
  line = d3.line()
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
    y.domain(sett.y.getDomain.call(sett, flatData));
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

    if (xAxisObj.empty()) {
      xAxisObj = chartInner.append("g")
      .attr("class", "x axis")
      .attr("aria-hidden", "true")
      .attr("transform", "translate(0," + innerHeight + ")");

      xAxisObj
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("x", innerWidth)
          .attr("dy", "-0.5em")
          .attr("text-anchor", "end")
          .text(sett.x.label);
    } else {
      xAxisObj.select("text").text(settings.x.label);
    }
    xAxisObj.call(
      d3.axisBottom(x)
        .ticks(sett.x.ticks)
        .tickValues(sett.z.getxtickIdx ? sett.z.getxtickIdx.call(sett, filteredData) : null)
        .tickFormat(sett.x.getTickText ? sett.x.getTickText.bind(sett) : null)
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
    );
  },
  drawTable = function() {
    console.log("DAY: ", day)
    var sett = this.settings,
      summaryId = "chrt-dt-tbl",
      filteredData = (sett.filterData && typeof sett.filterData === "function") ?
        sett.filterData.call(sett, data) : data,
      parent = svg.select(
        svg.classed("svg-shimmed") ? function(){return this.parentNode.parentNode;} : function(){return this.parentNode;}
      ),
      details = parent.select("details"),
      keys = Object.keys(filteredData[0]).slice(-1), // [ "values" ]
      setRow = function(d) { // d: [ "Monday 0h00", 0.3234158 ]
        var row = d3.select(this),
          cells = row.selectAll("*")
            .data(d),
          getText = function(d) {
            return d; // [ "Monday 0h00", 0.3234158 ]
          };

        cells
          .enter()
            .append(function(d, i) {
              return  document.createElement(i === 0 ? "th" : "td");
            })
            .attr("scope", function(d, i) { // COT accessibility
              if (i === 0) return "row";
            })
            .text(getText);

        cells.text(getText);

        cells
          .exit()
            .remove();
      },
      table, header, headerCols, body, dataRows;

    if (details.empty()) {
      details = parent
        .append("details")
          .attr("class", "chart-data-table");

      // Dropdown menu for table
      if (sett.menuData) {
        var menu, options;
        
        menu = details.append("div").attr("class", "col-md-3")
          .append("select")
            .attr("id", "fraction-menu")
            .attr("class", "form-control");

        options = menu.selectAll("option")
          .data(sett.menuData)
          .enter()
            .append("option")
            .attr("value", function(d) {
              return d.val;
            })
            .attr("selected", function(d) {
              if (d.val === "mon") {
                return true;
              }
            })
            .text(function(d) {
              return d.text;
            })
      }
      //

      details.append("summary")
        .attr("id", summaryId);

      table = details
        .append("table")
          .attr("class", "table")
          .attr("aria-labelledby", summaryId);

      table
        .append("caption");
        // .text(sett.tableTitle); // set in main.js - changes with dropdown menu selection

      header = table.append("thead").append("tr");
      body = table.append("tbody");

      header
        .append("td")
        .text(sett.x.label);

    } else {
      header = details.select("thead tr");
      body = details.select("tbody");
    }

    // Set in main.js - changes with dropdown menu selection
    // details.select("summary").text(sett.tableTitle || "Data");

    headerCols = header.selectAll("th")
      .data(sett.z.getKeys.call(sett, data)); // [ "fraction" ]

    headerCols
      .enter()
        .append("th")
        .text(sett.y.label);

    headerCols
      .text(sett.y.label);

    headerCols
      .exit()
      .remove();

    // Set number of rows by appending array in .data
    var flatout = [];
    dataRows = body.selectAll("tr")
      .data(function (d) {
          filteredData[0].values.map(function(d, i) { // array of length 168
            if (day == "mon") {
              if (d.tod < 24) {
                return flatout.push(
                  [sett.x.getText.call(sett, i), sett.formatNum ? sett.formatNum(d.value) : d.value]
                );
              }
            } else if (day == "tues") {
              if (d.tod < 48) {
                return flatout.push(
                  [sett.x.getText.call(sett, i), sett.formatNum ? sett.formatNum(d.value) : d.value]
                );
              }
            }

          })
        return flatout; //[ [ "Monday 0h00", 0.3234158 ], [ "Monday 1h00", 0.21998841 ], ..., [ "Friday 3h00", 0.14364915 ] ]
      })

    dataRow = dataRows
      .enter()
        .append("tr")
          .each(setRow);

    dataRows
        .each(setRow);

      dataRows
        .exit()
          .remove();

    // // th of each row
    // dataRow.append("th").attr("scope", function (d, i) {
    //   return "row";
    // })
    // .text(sett.x.getText.bind(sett)); // index for hour [0...167]
    // console.log("dataRow: ", dataRow)
    //
    // // td of each row
    // dataRow.append("td")
    //   .text(function (d) {
    //     return sett.y.getValue.call(sett, d, keys[0]);
    //   });
    //
    // dataRows
    //   .exit()
    //     .remove();

    if ($ || wb) {
      $(".chart-data-table summary").trigger("wb-init.wb-details");
    }
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
    .attr("aria-label", mergedSettings.altText);

  if (chartInner.empty()) {
    chartInner = svg.append("g")
      .attr("class", "margin-offset")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
  }

  process = function() {
    draw.apply(rtnObj);
    d3.stcExt.addIEShim(svg, outerHeight, outerWidth);
    if (mergedSettings.datatable === false) return;
    drawTable.apply(rtnObj);
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
