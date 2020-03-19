function lineTable(svg, settings, data) {
  console.log("lineTable data: ",data)
  var drawTable = function() {
    var sett = this.settings,
      summaryId = sett.summaryId,
      filteredData = (sett.filterData && typeof sett.filterData === "function") ?
        sett.filterData.call(sett, data) : data,
      tableData,
      parent = sett.attachedToSvg ? svg.select(
        svg.classed("svg-shimmed") ?
          function(){return this.parentNode.parentNode;} :
          function(){return this.parentNode;}
      ) : d3.select(svg),
      details = parent.select("details"),
      keys = (sett.z.getTableKeys && typeof sett.z.getTableKeys === "function") ?
        sett.z.getTableKeys.call(sett, filteredData) : sett.z.getKeys.call(sett, data),
      setRow = function(d) { // d: [ "Monday 0:00", 0.3234158 ]
        var row = d3.select(this),
          cells = row.selectAll("*")
            .data(d),
          getText = function(d) {
            return d; // cell value in row i for each col
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

      tableData = (sett.tableData && typeof sett.tableData === "function") ?
        sett.tableData.call(sett, filteredData) : filteredData;

    if (details.empty()) {
      details = parent
        .append("details")
          .attr("class", "chart-data-table");

      // ** Dropdown menu for table
      if (sett.menuData) {
        var menu, options;

        // Text label for sub-menu
        details.append("div")
          .attr("class", "col-md-3 submenu-label")
          .attr("role", "region")
          .attr("aria-live", "polite")
          .append("label")
            .attr("for", sett.labelFor)
            .text(sett.menuLabel);

        // Details setup
        menu = details.append("div").attr("class", "col-md-4")
          .append("select")
            .attr("id", sett.menuId)
            .attr("class", "form-control");

        // Dropdown sub-menu
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
              console.log(d.text)
              return d.text;
            })

        // Action button to execute selection in sub-menu
        button = details.append("div").attr("class", "col-md-3")
          .append("button")
          .attr("id", sett.actionId)
          .attr("class", "btn btn-primary")
          .attr("type","submit")
          .text("Show Data");
      }
      // ** end dropdown menu

      details.append("summary")
        .attr("id", summaryId);

      table = details
        .append("table")
          .attr("class", "table")
          .attr("aria-labelledby", summaryId)
          .style("display", function() {
            return sett.menuData ? "none" : "table";
          })

      table
        .append("caption");
        // .text(sett.tableTitle); // set in main.js - changes with dropdown menu selection

      header = table.append("thead").append("tr");
      body = table.append("tbody");

    } else { // details not empty
      header = details.select("thead tr");
      body = details.select("tbody");
    }

    headerCols = header.selectAll("th")
      .data(keys);

    headerCols
      .enter()
        .append("th")
        .attr("scope", "col")
        .text(function(d) {
          return d;
        });

    headerCols
    .text(function(d) {
      return d;
    });

    headerCols
      .exit()
      .remove();

    // Set number of rows by appending array in .data
    if (sett.menuData) {
      dataRows = body.selectAll("tr")
      .data(function (d) {
        console.log("menuData d: ", d)
        if (sett.x.getSubText) {
          var pair = sett.x.getSubText.call(sett, tableData[0].values, day);
          // pair = pair.map(function(d, i) {
          //   return [d[0], sett.formatNum ? sett.formatNum(d[1]) : d[1]];
          // });
        }
        console.log("return pair: ", pair)
        return pair;
      });
    }
    else {
      var flatout = [];
      dataRows = body.selectAll("tr")
        .data(function (d) {
            tableData.map(function(d) {
              if (d) {
                return flatout.push(
                  // [ "Trinity-Bellwoods", "6.3" ]
                  sett.pair.getValues.call(sett, d)
                );
              }
            })
            // [["Bay Street Corridor", "7.7"],["Kensington-Chinatown", "7.5"],["University", "7.0" ]]
          return flatout;
        });
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
  x, y, rtnObj, process;

  rtnObj = {
    settings: settings
  };

  process = function() {
    if (settings.datatable === false) return;
    drawTable.apply(rtnObj);
  };
  if (data === undefined) {
    d3.json(settings.url, function(error, xhr) {
      data = xhr;
      process();
    });
  } else {
    process();
  }

return rtnObj;
}
