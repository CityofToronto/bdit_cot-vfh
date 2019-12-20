function lineTableMap(sett) {
  var summaryId = "mapchrt-dt-tbl",
    parent = d3.select(".mapdiv"),
    details = parent.select("details"),
    table, header, headerCols, body, dataRows;

    if (details.empty()) {
      details = parent
        .append("details")
          .attr("class", "chart-data-table");

      // ** Dropdown menu for table
      if (sett.menuData) {
        var menu, options;

        // Text label for sub-menu
        details.append("div")
          .attr("class", "col-md-2")
          .attr("id", sett.submenuLabel)
          .append("label")
            .attr("for", sett.labelFor)
            .text(sett.menuLabel);

        // Details setup
        menu = details.append("div").attr("class", "col-md-3")
          .append("select")
            .attr("id", sett.subMenuId)
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


}
