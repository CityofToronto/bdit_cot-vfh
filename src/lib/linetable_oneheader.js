function lineTable(svg, settings, data, day) {
  var drawTable = function() {
    var sett = this.settings,
      summaryId = sett.summaryId,
      filteredData = (sett.filterData && typeof sett.filterData === "function") ?
        sett.filterData.call(sett, data) : data,
      parent = sett.attachedToSvg ? svg.select(
        svg.classed("svg-shimmed") ? function(){return this.parentNode.parentNode;} : function(){return this.parentNode;}
      ) : d3.select(svg),
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

      console.log("data: ", data)
      console.log("filteredData: ", filteredData)

    if (details.empty()) {
      details = parent
        .append("details")
          .attr("class", "chart-data-table");

      // ** Dropdown menu for table
      if (sett.menuData) {
        var menu, options;

        // Text label for sub-menu
        details.append("div")
          .attr("class", "col-md-2 submenu-label")
          .append("label")
            .attr("for", sett.labelFor)
            .text(sett.menuLabel);

        // Details setup
        menu = details.append("div").attr("class", "col-md-3")
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
          .style("display", "none");

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
      .data([sett.x.label, sett.y.label]);

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
        if (sett.attachedToSvg) {
          var pair = sett.x.getSubText.call(sett, filteredData[0].values, day);
          pair = pair.map(function(d, i) {
            return [d[0], sett.formatNum ? sett.formatNum(d[1]) : d[1]];
          });
          console.log("pair: ", pair)
          return pair;
        } else {
          var pair = [["nn1", "390"], ["nn2", "227"],["nn3", "152"],["nn4","339"]];
        }
        console.log("pair: ", pair)
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
          return flatout; //[ [ "0h00", 0.3234158 ], [ "1h00", 0.21998841 ], ..., [ "3h00", 0.14364915 ] ]
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
