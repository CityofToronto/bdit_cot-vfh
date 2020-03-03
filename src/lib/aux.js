// -----------------------------------------------------------------------------
// Hover line for lineChart, plus tooltip
function generalOverlay(chartObj, data, onMsOverCb, onMsOutCb, onMsClickCb) {
  chartObj.svg.datum(chartObj);

  const filteredData = chartObj.settings.filterData(data);
  const flatData = [].concat.apply([], filteredData.map(function(d) {
    return chartObj.settings.z.getDataPoints.call(chartObj.settings, d);
  }));

  chartObj.data = flatData;
  console.log("flatData: ", flatData)

  const bisect = d3.bisector((d) => {
    return chartObj.settings.x.getValue(d);
  }).left;

  let overlay = chartObj.svg.select(`#${chartObj.svg.id} .data .overlay`);
  let rect;
  let line;

  let removedSelection = d3.select();

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
        .style("visibility", "visible");

  } else {
    rect = overlay.select("rect");
    line = overlay.select("line");
    textg = overlay.select(".textg");
  }

  rect
      .attr("width", chartObj.settings.innerWidth)
      .attr("height", chartObj.settings.innerHeight)
      .on("touchmove mousemove", function(e) {
        const chartObj = d3.select(this.ownerSVGElement).datum();
        const x = d3.mouse(this)[0];
        const xD = chartObj.x.invert(x);
        const i = Math.round(xD); // bisect(chartObj.data[0].values, xD);
        let d0;
        let d1;
        if (i === 0) { // handle edge case
          d0 = chartObj.data[0].values[i];
        } else {
          d0 = chartObj.data[0].values[i - 1];
          d1 = chartObj.data[0].values[i];
        }

        let d;
        if (d0 && d1) {
          d = xD - chartObj.settings.x.getValue(d0) > chartObj.settings.x.getValue(d1) - xD ? d1 : d0;
        } else if (d0) {
          d = d0;
        } else {
          d = d1;
        }

        line.attr("x1", chartObj.x(chartObj.settings.x.getValue(d)));
        line.attr("x2", chartObj.x(chartObj.settings.x.getValue(d)));
        line.style("visibility", "visible");

        if (onMsOverCb && typeof onMsOverCb === "function") {
          // hr = i % 24;
          // val = d3.format("(,")(data[Object.keys(data)[1]][i]);
          // idx = data.keys.values[i];
          console.log("i, data: ", i, new Date(i), data)



          // onMsOverCb(hoverData);
        }        
      })
      .on("touchleave mouseleave", function() {
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
      .attr("y2", chartObj.settings.innerHeight);
}





// -----------------------------------------------------------------------------
// Tooltip hover (striped table)
function hoverlineTip(div, tr1, tr2, sett) {
  const makeTable = function() {
    let rtnTable = `<table class="table-striped"><tr><td>${tr1}</td></tr>`
    rtnTable = rtnTable.concat(`<tr><td>${tr2}% PTC volume`);
    rtnTable = rtnTable.concat("</table>");
    return rtnTable;
  };
  div.html(makeTable())
      .style("opacity", .999)
      .style("left", ((d3.event.pageX - sett.tooltip.pageX) + "px"))
      .style("top", ((d3.event.pageY - sett.tooltip.pageY) + "px"))
      .style("pointer-events", "none")
      .style("position", "absolute");
}

// Small relations
function findTOD(...args) {
  let dow;
  let win;

  // Find day of week
  const idx = args[0][1];
  if (idx < 24) dow = "Monday";
  else if (idx < 48) dow = "Tuesday";
  else if (idx < 72) dow = "Wednesday";
  else if (idx < 96) dow = "Thursday";
  else if (idx < 120) dow = "Friday";
  else if (idx < 144) dow = "Saturday";
  else dow = "Sunday";

  // Find time window
  const tod = args[0][0];
  if ([19,20,21,22,23,0,1,2].includes(tod)) win = "nightI";
  else if ([3,4,5,6].includes(tod)) win = "nightII";
  else if (idx >= 121) { // weekend
    if (tod >= 7 && tod <= 11) win = "amPeak";
    else if (tod >= 12 && tod <= 18) win = "midday";
  } else if (idx < 121) { // weekday
    if (tod >= 7 && tod <= 9) win = "amPeak";
    else if (tod >= 10 && tod <= 15) win = "midday";
    else if (tod >= 16 && tod <= 18) win = "pmPeak";
  }
  return [dow, win];
}

// Flatten data arrays in object to find full extent of values
function fullExtent(sett, dataObj) {
  let keys = Object.keys(dataObj);

  keys = keys.filter((x)=> {
     return x !== "keys";
  })

  eachArray=[];
  for (p = 0; p < keys.length; p++) {
    eachArray.push(dataObj[keys[p]])
  }
  const concatObj = [].concat.apply([], eachArray);
  let flatData = (concatObj[0] && typeof concatObj[0] === "object") ?
  [].concat.apply([], concatObj.map(function(d) {
    return sett.z.getDataPoints.call(sett, d);
  })) : concatObj;
  flatData = flatData.sort(function(a, b) {return a-b;});
  return d3.extent(flatData);
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
// Display hover tool text in PUDO line chart
function showHoverText(...args) {
  const initText = [{
    id: 1,
    text: `${i18next.t("y_label", {ns: "ward_towline"})}: ${args[0]}, ${args[2][0]} ${args[1]}:00 (${i18next.t(args[2][1], {ns: "timewin"})})`
  }];
  hoverTextBind(initText);
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
function createOverlay(chartObj, data, onMsOverCb, onMsOutCb, onMsClickCb) {
  chartObj.svg.datum(chartObj);
  chartObj.data = chartObj.settings.filterData(data);

  const bisect = d3.bisector((d) => {
    return chartObj.settings.x.getValue(d);
  }).left;

  let overlay = chartObj.svg.select(`#${chartObj.svg.id} .data .overlay`);
  let rect;
  let line;
  let textg;
  let hr;
  let val;
  let thisTOD;

  let removedSelection = d3.select();

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
        .style("visibility", "visible");

    textg = overlay.append("g").attr("class", "textg");
  } else {
    rect = overlay.select("rect");
    line = overlay.select("line");
    textg = overlay.select(".textg");
  }

  // -------------------------------------------------
  hoverTextBind = function(data) {
    // Umbrella group
    const root = textg.selectAll(".lab", function(d) {
        // Binds data by id
        return d.id;
      })
      .data(data);

    // Add div nodes
    const newGroup = root
      .enter()
      .append("g")
      .attr("class", "lab");

    // Add text for each NEW div
    newGroup
        .append("text")
        .html(function(d) {
          return d.text;
        })
        .attr("transform", function() {
          return `translate(${chartObj.settings.tipTextCoords[0]},
                  ${chartObj.settings.tipTextCoords[1]})`;
        });

    // Update text of EXISTING div
    root.select("text")
       .html(function(d) {
         return d.text;
       });

    root.exit().remove();
  }
  // -------------------------------------------------

  rect
      .attr("width", chartObj.settings.innerWidth)
      .attr("height", chartObj.settings.innerHeight)
      .on("touchmove mousemove", function(e) {
        // Allow hoverLine movement only if not frozen by mouse click
        if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
          const chartObj = d3.select(this.ownerSVGElement).datum();
          const x = d3.mouse(this)[0];
          const xD = chartObj.x.invert(x);
          const i = Math.round(xD); // bisect(chartObj.data[0].values, xD);
          let d0;
          let d1;
          if (i === 0) { // handle edge case
            d0 = chartObj.data[0].values[i];
          } else {
            d0 = chartObj.data[0].values[i - 1];
            d1 = chartObj.data[0].values[i];
          }

          let d;
          if (d0 && d1) {
            d = xD - chartObj.settings.x.getValue(d0) > chartObj.settings.x.getValue(d1) - xD ? d1 : d0;
          } else if (d0) {
            d = d0;
          } else {
            d = d1;
          }

          line.attr("x1", chartObj.x(chartObj.settings.x.getValue(d)));
          line.attr("x2", chartObj.x(chartObj.settings.x.getValue(d)));
          line.style("visibility", "visible");

          if (onMsOverCb && typeof onMsOverCb === "function") {
            hr = i % 24;
            val = d3.format("(,")(data[Object.keys(data)[1]][i]);
            idx = data.keys.values[i];
            thisTOD = findTOD([hr, idx]);
            const updateText = [{
              id: 1,
              text: `${i18next.t("y_label", {ns: "ward_towline"})}: ${val}, ${thisTOD[0]} ${hr}:00 (${i18next.t(thisTOD[1], {ns: "timewin"})})`
            }];
            hoverTextBind(updateText);

            // Store info to pass to tooltip
            const hoverData = {};
            hoverData.ward = [i, hr, thisTOD];
            onMsOverCb(hoverData);
          }
        }
      })
      .on("touchleave mouseleave", function() {
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
      .attr("y2", chartObj.settings.innerHeight);
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
function showLineHover(lineCoords) { // Move hoverLine to specified coordinates
  holdHoverLine(lineCoords);
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

  // Show hoverLine and tooltip for ward 1, Mon, amPeak, Humber College
  showLineHover(settPudoLine.initHoverLine.coords);
  pudoHr = settPudoLine.initHoverLine.indices[0];
  pudoIdx = settPudoLine.initHoverLine.indices[1];
  const thisTOD = findTOD([pudoHr, pudoIdx]);
  const val = d3.format("(,")(ptcFraction[ward][Object.keys(ptcFraction[ward])[1]][pudoIdx]);
  showHoverText(val, pudoHr, thisTOD);

  // Set focus and zoom to Humber College
  if (map.getZoom() !== pudoMapSett.hbFocus.zoom) {
    map.setZoom(pudoMapSett.hbFocus.zoom);
  }
  map.flyTo({center: pudoMapSett.hbFocus.xy});

  // Clear ward bd and markers if not in w1 or if in another Day or TOD in w1
  if (ward === "w1" && (pudoDay !== "Monday" || pudoTOD !== "amPeak" ||
      whichPUDO !== "pudo") || ward !== "w1") {
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

  // Draw a highlighting circle around Humber College PUDO circle
  makeStoryLayer(hbId, hbSrc, "pudo","humber");
}
