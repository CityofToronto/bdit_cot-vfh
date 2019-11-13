mysett = {
  mymargin: {
    top: 20,
    right: 10,
    bottom: 80,
    left: 125
  }
}

// -----------------------------------------------------------------------------
// Small relations
function getWard(o) {
  return Object.keys(o).reduce((object, key) => {
    if (key === "keys" || key === "city" || key === ward) {
      object[key] = o[key]
      }
      return object
    }, {})
}

function findTOD(...args) {
  let dow;
  let win;

  // Find day of week
  const idx = args[0][2];
  if (idx < 24) dow = "Monday";
  else if (idx < 48) dow = "Tuesday";
  else if (idx < 72) dow = "Wednesday";
  else if (idx < 96) dow = "Thursday";
  else if (idx < 120) dow = "Friday";
  else if (idx < 144) dow = "Saturday";
  else dow = "Sunday";

  // Find time window
  const tod = args[0][0];
  if (tod >= 0 && tod < 2) win = "nightII";
  else if (tod >= 2 && tod < 6) win = "nightIII";
  else if (tod >= 7 && tod < 9) win = "amPeak";
  else if (tod >= 10 && tod < 15) win = "midday";
  else if (tod >= 16 && tod < 18) win = "pmPeak";
  else if (tod >= 19 && tod < 23) win = "nightI";

  return [dow, win];
}

// -----------------------------------------------------------------------------
// Hover line for lineChart, plus tooltip
function createOverlay(chartObj, data, onMouseOverCb, onMouseOutCb) {
  chartObj.svg.datum(chartObj);
  chartObj.data = chartObj.settings.filterData(data);

  let overlay = chartObj.svg.select(`#${chartObj.svg.id} .data .overlay`);
  let rect;
  let line;

  if (overlay.empty()) {
    overlay = chartObj.svg.select(`#${chartObj.svg.id} .data`)
        .append("g")
        .attr("class", "overlay");

    rect = overlay
        .append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("class", "overlay");

    line = overlay.append("line")
        .attr("class", "hoverLine")
        .style("display", "inline")
        .style("visibility", "hidden");
  } else {
    rect = overlay.select("rect");
    line = overlay.select("line");
  }

  rect
      .attr("width", chartObj.settings.innerWidth)
      .attr("height", chartObj.settings.innerHeight)
      .on("mousemove", function(e) {
        const chartObj = d3.select(this.ownerSVGElement).datum();
        const x = d3.mouse(this)[0];
        const xD = chartObj.x.invert(x);
        const i = Math.round(xD);
        let d0;
        let d1;
        if (i === 0) { // handle edge case
          d1 = chartObj.data[0].values[i].tod;
          d0 = d1;
        } else {
          d0 = chartObj.data[0].values[i - 1].tod;
          d1 = chartObj.data[0].values[i].tod;
        }

        let d;
        if (d0 && d1) {
          // d = xD - chartObj.settings.x.getValue(d0) > chartObj.settings.x.getValue(d1) - xD ? d1 : d0;
          d = xD - d0 > d1 - xD ? d1 : d0;
        } else if (d0) {
          d = d0;
        } else {
          d = d1;
        }

        const sf = 4.467065868263473; // NOTE
        d = d * sf;

        line.attr("x1", d);
        line.attr("x2", d);
        line.style("visibility", "visible");

        if (onMouseOverCb && typeof onMouseOverCb === "function") {
          const hr = i % 24;
          const hoverData = {};
          hoverData.ward = [hr, data[ward][i], i];
          onMouseOverCb(hoverData);
        }
      })
      .on("mouseout", function() {
        line.style("visibility", "hidden");
        if (onMouseOutCb && typeof onMouseOutCb === "function") {
          onMouseOutCb();
        }
      });

  line
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", chartObj.settings.innerHeight);
}

function hoverlineTip(settings, div, dataObj) {
  const thisHr = `${dataObj.ward[0]}h00`;
  const cityVal = d3.format("(.2f")(dataObj.ward[1]);

  const makeTable = function() {
    let rtnTable = `<table class="table-striped"><tr><td>${i18next.t("y_label", {ns: "ward_towline"})}: ${cityVal}</td></tr>`
    rtnTable = rtnTable.concat(`<tr><td>Hour: ${thisHr}</td></tr>`);
    rtnTable = rtnTable.concat("</table>");
    return rtnTable;
  };

  div.html(makeTable())
      .style("opacity", .999)
      .style("left", ((d3.event.pageX - 50) + "px"))
      .style("top", ((d3.event.pageY - 500) + "px"))
      .style("pointer-events", "none");
}

// -----------------------------------------------------------------------------
// Chart axis label rotation
function rotateLabels(chartId, sett) {
  // axes labels
  d3.select(`#${chartId}`).select(".y.axis").select(".chart-label").attr("transform", function(d) {
    return "translate(" + (sett.y.translateXY[0]) + " " + (sett.y.translateXY[1]) + ")rotate(-90)";
  });

  if (sett.x.translateXY) {
    d3.select(`#${chartId}`).select(".x.axis").select(".chart-label").attr("transform", function(d) {
      return "translate(" + (sett.x.translateXY[0]) + " " + (sett.x.translateXY[1]) + ")";
    });
  }
}
