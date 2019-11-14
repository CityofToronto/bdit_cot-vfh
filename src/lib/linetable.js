function lineTable(svg, settings, data, day) {
  var mergedSettings = settings,
  outerWidth = mergedSettings.width,
  outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
  innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
  innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
  chartInner = svg.select("g.margin-offset"),
  dataLayer = chartInner.select(".data"),

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
      columns = sett.z.getKeyNames.call(sett, data), // sett.z.getDataPoints.call(sett, data[keys[0]]),
      headerText = (sett.x.getValue).bind(sett),
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

      console.log("table filteredData: ", filteredData)

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
      .data(columns); // [ "city", "w1" ]

    headerCols
      .enter()
        .append("th")
        .text(function(d, i) {
          return columns[i];
        });

    headerCols
      .text(function(d, i) {
          return columns[i];
        });

    headerCols
      .exit()
      .remove();

    // Set number of rows by appending array in .data
    if (sett.menuData) {
      dataRows = body.selectAll("tr")
      .data(function (d) {
        var pair = sett.x.getSubText.call(sett, filteredData[0].values, day);
        pair = pair.map(function(d, i) {
          return [d[0], sett.formatNum ? sett.formatNum(d[1]) : d[1]];
        });
        return pair;
      })
    }
    else {
      var flatout = [];
      dataRows = body.selectAll("tr")
        .data(function (d) {
            filteredData[0].values.map(function(d, i) { // array of length 168
              return flatout.push(
                [sett.x.getText.call(sett, i), sett.formatNum ? sett.formatNum(d.value) : d.value]
              );
            })
          return flatout; //[ [ "Monday 0h00", 0.3234158 ], [ "Monday 1h00", 0.21998841 ], ..., [ "Friday 3h00", 0.14364915 ] ]
        })
    }

    dataRow = dataRows
      .enter()
        .append("tr")
          .each(setRow);

    dataRows
        .each(setRow);

      dataRows
        .exit()
          .remove();

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
