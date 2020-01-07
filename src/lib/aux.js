// -----------------------------------------------------------------------------
// Small relations
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

// Save hoverLine position when frozen
function saveHoverLinePos() {
  saveHoverPos = []; // clear
  let x1 = d3.select(".hoverLine").attr("x1");
  let x2 = d3.select(".hoverLine").attr("x2");
  let y1 = d3.select(".hoverLine").attr("y1");
  let y2 = d3.select(".hoverLine").attr("y2");
  return saveHoverPos.push(x1, x2, y1, y2);
}
// Hold frozen hoverLine when PUDO menu toggled
function holdHoverLine(ptArray) {
  d3.select(".hoverLine").attr("x1", ptArray[0]);
  d3.select(".hoverLine").attr("x2", ptArray[1]);
  d3.select(".hoverLine").attr("y1", ptArray[2]);
  d3.select(".hoverLine").attr("y2", ptArray[3]);
}

// Hide table and close details (to be opened with action button)
function hideTable(divClassName) {
  // Hide table until action button is clicked
  d3.select(`.${divClassName} .chart-data-table`)
    .select("table")
    .style("display", "none");
  // close details
  d3.select(`.${divClassName} details`)
    .attr("open", null);
}

// -----------------------------------------------------------------------------
// Hover line for lineChart, plus tooltip
function createOverlay(chrtObj, data, onMsOverCb, onMsOutCb, onMsClickCb) {
  chrtObj.svg.datum(chrtObj);
  chrtObj.data = chrtObj.settings.filterData(data);

  let overlay = chrtObj.svg.select(`#${chrtObj.svg.id} .data .overlay`);
  let rect;
  let line;

  if (overlay.empty()) {
    overlay = chrtObj.svg.select(`#${chrtObj.svg.id} .data`)
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
        .style("visibility", "visible");
  } else {
    rect = overlay.select("rect");
    line = overlay.select("line");
  }

  rect
      .attr("width", chrtObj.settings.innerWidth)
      .attr("height", chrtObj.settings.innerHeight)
      .on("mousemove", function(e) {
        // Allow hoverLine movement only if not frozen by mouse click
        if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
          const chrtObj = d3.select(this.ownerSVGElement).datum();
          const x = d3.mouse(this)[0];
          const xD = chrtObj.x.invert(x);
          const i = Math.round(xD);
          let d0;
          let d1;
          if (i === 0) { // handle edge case
            d1 = chrtObj.data[0].values[i].tod;
            d0 = d1;
          } else {
            d0 = chrtObj.data[0].values[i - 1].tod;
            d1 = chrtObj.data[0].values[i].tod;
          }

          let d;
          if (d0 && d1) {
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

          if (onMsOverCb && typeof onMsOverCb === "function") {
            let hr = i % 24;
            let val = data[Object.keys(data)[1]][i];
            let idx = data.keys.values[i];
            let thisTOD = findTOD([hr, val, idx]);

            // Store info to pass to tooltip
            const hoverData = {};
            hoverData.ward = [val, hr, thisTOD];
            onMsOverCb(hoverData);
          }
        }
      })
      .on("mouseout", function() {
        if (onMsOutCb && typeof onMsOutCb === "function") {
          onMsOutCb();
        }
      })
      .on("click", function() {
        if (onMsClickCb && typeof onMsClickCb === "function") {
          onMsClickCb();
        }
      });

  line
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", chrtObj.settings.innerHeight);
}

function hoverlineTip(div, dataObj) {
  const cityVal = d3.format("(.2f")(dataObj.ward[0]);
  const thisHr = `${dataObj.ward[1]}h00`;
  const day = dataObj.ward[2][0];
  const win = i18next.t(dataObj.ward[2][1], {ns: "timewin"});

  const makeTable = function() {
    let rtnTable = `<table class="table-striped"><tr><td>${i18next.t("y_label", {ns: "ward_towline"})}: ${cityVal}</td></tr>`
    if (win) rtnTable = rtnTable.concat(`<tr><td>${day} ${thisHr}, ${win}</td></tr>`);
    else rtnTable = rtnTable.concat(`<tr><td>${day} ${thisHr}</td></tr>`);
    rtnTable = rtnTable.concat("</table>");
    return rtnTable;
  };

  div.html(makeTable())
      .style("opacity", .999)
      .style("left", ((d3.event.pageX - 50) + "px"))
      .style("top", ((d3.event.pageY - 300) + "px"))
      .style("pointer-events", "none");
}

// -----------------------------------------------------------------------------
// Chart axis label rotation
function rotateLabels(chartId, sett) {
  d3.select(`#${chartId}`).select(".y.axis").select(".chart-label")
    .attr("transform", function(d) {
      return "translate(" + (sett.y.translateXY[0]) + " "
              + (sett.y.translateXY[1]) + ")rotate(-90)";
    });

  if (sett.x.translateXY) {
    d3.select(`#${chartId}`).select(".x.axis").select(".chart-label")
      .attr("transform", function(d) {
        return "translate(" + (sett.x.translateXY[0]) + " "
                + (sett.x.translateXY[1]) + ")";
      });
  }
}

// -----------------------------------------------------------------------------
function showLineHover(lineCoords, hoverText, hoverCoords) {
  // Move hoverLine to specified coordinates
  holdHoverLine(lineCoords);

  // Show tooltip
  divHoverLine.html(hoverText)
    .style("opacity", .999)
    .style("left", ((hoverCoords[0] - 50) + "px"))
    .style("top", ((hoverCoords[1] - 300) + "px"))
    .style("pointer-events", "none");
}

// -----------------------------------------------------------------------------
// Text stories
function humberStory() {
  const hbId = "hb-w1-Monday-amPeak-pudo-pudo";
  const hbSrc = "src-w1-Monday-amPeak-pudo-pudo";

  const layerObj = map.getStyle().layers;
  const rootLayer = "w1-Monday-amPeak";
  const type = "pudo";

  // Display ward 1 in ward-menu; Pick-ups & Drop-offs in pudo-menu
  d3.select("#ward-menu").node()[0].selected = true;
  d3.select("#pudo-menu").node()[0].selected = true;

  // Unfreeze hoverLine if it was previously frozen
  if (!d3.select(".mapboxgl-canvas-container").classed("moveable")) {
    d3.select(".mapboxgl-canvas-container").classed("moveable", true);
  }

  // Clear any previously frozen hoverLine tooltips
  divHoverLine.style("opacity", 0);
  // Show hoverLine and tooltip for ward 1, Mon, amPeak, Humber College
  showLineHover(settPudoLine.initHoverLinePos, settPudoLine.initTipText,
    settPudoLine.initTipPosn);

  // Set focus and zoom to Humber College
  map.flyTo({center: pudoMapSett.hbFocus.xy});
  if (map.getZoom() !== pudoMapSett.hbFocus.zoom) {
    map.setZoom(pudoMapSett.hbFocus.zoom);
  }
    
  // Clear ward bd and markers if not in w1 or if in another Day or TOD in w1
  if (ward === "w1" && (pudoDay !== "Monday" || pudoTOD !== "amPeak")
    || ward !== "w1") {
    hideLayers(layerObj, false);
    map.setLayoutProperty(`${ward}-layer`, "visibility", "none");
    map.setLayoutProperty("w1-layer", "visibility", "visible");

    // reset
    pudoDay = "Monday";
    pudoTOD = "amPeak";
    whichPUDO = "pudo";
    ward = "w1";

    // Display marker layers for w1-Monday-amPeak
    showLayer(rootLayer, layerObj, "pu");
    showLayer(rootLayer, layerObj, "do");
    showOverlapLayer(rootLayer, layerObj);
  }

  // Dim all circles and labels of w1-Monday-amPeak
  map.setPaintProperty("w1-Monday-amPeak-pudo-pudo", "circle-opacity", 0.1);

  // Highlight Humber College PUDO marker only
  if (layerObj.find(({id}) => id === hbId)) {
    map.setLayoutProperty(hbId, "visibility", "visible");
    map.setLayoutProperty(`${hbId}-label`, "visibility", "visible");
  } else {
      makeStoryLayer(hbId, hbSrc, "pudo","humber");
  }
}
