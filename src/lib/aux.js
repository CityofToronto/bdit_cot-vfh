// -----------------------------------------------------------------------------
// Story values
const humberDropoffs = 169;

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
function createOverlay(chartObj, data, onMouseOverCb, onMouseOutCb, onMouseClickCb) {
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
        .style("visibility", "visible");  // .style("visibility", "hidden");
  } else {
    rect = overlay.select("rect");
    line = overlay.select("line");
  }

  rect
      .attr("width", chartObj.settings.innerWidth)
      .attr("height", chartObj.settings.innerHeight)
      .on("mousemove", function(e) {
        // Allow hoverLine movement only if not frozen by mouse click
        if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
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
            let hr = i % 24;
            let val = data[Object.keys(data)[1]][i];
            let idx = data.keys.values[i];
            let thisTOD = findTOD([hr, val, idx]);

            // Store info to pass to tooltip
            const hoverData = {};
            hoverData.ward = [val, hr, thisTOD];
            onMouseOverCb(hoverData);
          }
        }
      })
      .on("mouseout", function() {
        if (onMouseOutCb && typeof onMouseOutCb === "function") {
          onMouseOutCb();
        }
      })
      .on("click", function() {
        if (onMouseClickCb && typeof onMouseClickCb === "function") {
          onMouseClickCb();
        }
      });

  line
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", chartObj.settings.innerHeight);
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

// -----------------------------------------------------------------------------
// Plot PUDO map according to whichPUDO selected in pudo-menu
function showPudoLayer() {
  // keep current zoom
  let currentZoom = wardpudoMap.map._zoom;
   wardpudoMap.options.zoom = currentZoom;


  if (pudoTOD) {
    if (whichPUDO === "pudo") {
      // Pick-ups
      wardpudoMap.options.markerClass = "pickups";
      wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["pickups"];
      wardpudoMap.addCircle();

      // Drop-offs
      wardpudoMap.options.markerClass = "dropoffs";
      wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["dropoffs"];
      wardpudoMap.addCircle();
    } else if (whichPUDO === "pu") {
      // Pick-ups
      wardpudoMap.options.markerClass = "pickups";
      wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["pickups"];
      wardpudoMap.addCircle();
    } else {
      // Drop-offs
      wardpudoMap.options.markerClass = "dropoffs";
      wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["dropoffs"];
      wardpudoMap.addCircle();
    }
  }
}

// Plot PUDO map according to whichPUDO selected in pudo-menu
function makeLayer(id, data, sett, clsett) {
  const thisSource = `src-${id}`;
  console.log("WHICH COUNT: ", sett.count)

  // Add source only if it does not exist
  if (!map.getSource(thisSource)) {
    map.addSource(thisSource, {
      type: "geojson",
      data: data,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      clusterProperties: {
        sum: clsett.cluster
      }
    });
  }

  // CLUSTERED LAYER
   map.addLayer({
     id: `cl-${id}`,
     type: "circle",
     source: thisSource,
     filter: ["==", "cluster", true],
     paint: {
       // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
       // with three steps to implement three types of circles:
       //   * Blue, 20px circles when point count is less than 100
       //   * Yellow, 30px circles when point count is between 100 and 750
       //   * Pink, 40px circles when point count is greater than or equal to 750
       "circle-color": [
         "step",
         ["get", "point_count"],
         clsett.fillMid, 100, clsett.fillMax
       ],
       "circle-radius": [
         "step",
         ["get", "point_count"],
         // 31, 50, // 31px, < threshold 50
         30, 100, // 50px, threshold 50 - 100
         40] // 60px, threshold >= 100
     }
   });
  // CLUSTERED LAYER LABEL
   map.addLayer({
    id: `cl-count-${id}`,
    type: "symbol",
    source: thisSource,
    filter: ["==", "cluster", true],
    layout: {
      "text-field": "{point_count} ({sum})",
      "text-font": ["Open Sans Regular", "Arial Unicode MS Bold"],
      "text-size": 16
      // "text-allow-overlap": true,
      // "text-ignore-placement": true
    },
    paint: {
       "text-color": sett.text
     }
  });

  // UNCLUSTERED LAYER
  map.addLayer({
      id: id,
      type: "circle",
      source: thisSource,
      filter: ["!=", "cluster", true],
      paint: {
        "circle-radius": 16,
        "circle-color": sett.fill,
        "circle-stroke-color": sett.stroke,
        "circle-stroke-width": 2,
        "circle-opacity": 1 // 0.8
      },
      layout: {
        "visibility": "visible"
      }
  });

  map.addLayer({
    "id": `${id}-label`,
    "type": "symbol",
    "source": thisSource,
    "layout": {
      "text-field": sett.count,
      "text-font": [
        "Open Sans Regular",
        "Arial Unicode MS Bold"
      ],
      "text-size": 16
      // "text-allow-overlap" : true
    },
    paint: {
       "text-color": sett.text
     }
  });
}

function showLayer(rootLayer, layerObj, thisPUDO) {
  // Outputs -pu or -do layer, never -pudo layer
  const sett = pudoMapSettings.circleStyle;
  const clsett = pudoMapSettings.clusterStyle;
  const root = geoMap[ward][pudoDay][pudoTOD];

  if (layerObj.find(({ id }) => id === `${rootLayer}-${thisPUDO}`)) {
    map.setLayoutProperty(`${rootLayer}-${thisPUDO}-label`, "visibility", "visible");
    map.setLayoutProperty(`${rootLayer}-${thisPUDO}`, "visibility", "visible");
    // cluster layers
    map.setLayoutProperty(`cl-${rootLayer}-${thisPUDO}`, "visibility", "visible");
    map.setLayoutProperty(`cl-count-${rootLayer}-${thisPUDO}`, "visibility", "visible");
  } else {
    if (root[thisPUDO]) makeLayer(`${rootLayer}-${thisPUDO}`, root[thisPUDO],
        sett[thisPUDO], clsett[thisPUDO]);
  }
}

function showOverlapLayer(rootLayer, layerObj) {
  // Outputs ${whichPUDO}-pudo layer
  const sett = pudoMapSettings.circleStyle;
  const clsett = pudoMapSettings.clusterStyle;
  const root = geoMap[ward][pudoDay][pudoTOD];

  if (layerObj.find(({ id }) => id === `${rootLayer}-${whichPUDO}-pudo`)) {
    // colour pudo layer according to whichPUDO
    map.setPaintProperty(`${rootLayer}-${whichPUDO}-pudo`, "circle-color", sett[whichPUDO].fill);
    map.setPaintProperty(`${rootLayer}-${whichPUDO}-pudo`, "circle-stroke-color", sett[whichPUDO].stroke);
    map.setPaintProperty(`${rootLayer}-${whichPUDO}-pudo-label`, "text-color", sett[whichPUDO].text);
    // make visible
    map.setLayoutProperty(`${rootLayer}-${whichPUDO}-pudo-label`, "visibility", "visible");
    map.setLayoutProperty(`${rootLayer}-${whichPUDO}-pudo`, "visibility", "visible");
    // cluster layers
    map.setLayoutProperty(`cl-${rootLayer}-${whichPUDO}-pudo`, "visibility", "visible");
    map.setLayoutProperty(`cl-count-${rootLayer}-${whichPUDO}-pudo`, "visibility", "visible");
  } else {
    if (root["pudo"]) makeLayer(`${rootLayer}-${whichPUDO}-pudo`, root["pudo"],
        sett[whichPUDO], clsett[whichPUDO]);
  }
}

// Hide map layers either for all previous wards or all previous selections
// of current ward
function hideLayers(layerObj, clearPrevWard) {
  layerObj.filter((d) => {
    // Hide -pu, -do, and -pudo layers
    if (d.id.indexOf("-pu") !== -1 || d.id.indexOf("-do") !== -1
                                   || d.id.indexOf("-pudo") !== -1) {
      if (clearPrevWard) { // Hide previous ward layers
        if (d.id.indexOf(`${ward}-`) === -1) {
          map.setLayoutProperty(d.id, "visibility", "none");
        }
      } else { // Hide current ward's previous layers
        map.setLayoutProperty(d.id, "visibility", "none");
      }
    }
  });
}

// Plot ward layer
function makeWardLayer(id, geojson, lineColour) {
  map.addLayer({
    "id": id,
    "type": "line",
    "source": {
      "type": "geojson",
      "data": geojson
    },
    "layout": {},
    "paint": {
      "line-color": lineColour,
      "line-width": 2
    }
  });
}

// Hide ward boundary layers except for current ward
function showWardBoundary() {
  let layerExists = false;
  let layerObj = map.getStyle().layers; // obj containing all layers
  layerObj.filter((d) => {
    if (d.id.indexOf(`-layer`) !== -1 && d.id.indexOf(`${ward}-layer`) === -1) {
      map.setLayoutProperty(d.id, "visibility", "none");
    } else if (d.id === `${ward}-layer`) {
      map.setLayoutProperty(d.id, "visibility", "visible");
      layerExists = true;
    }
  });

  if (!layerExists) {
    makeWardLayer(`${ward}-layer`,  wardLayer[ward], pudoMapSettings.wardLayerColour);
  }
  // clear
  layerExists = false;
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

// Text stories
function humberStory() {

  d3.selectAll(".section-text .highlight-humber")
    .on("click", function() {
      d3.event.preventDefault();
  })
  .on("mouseover", function() {
    ward = "w1";
    pudoDay = "Monday";
    pudoTOD = "amPeak";

    // Display ward 1 in ward-menu; Drop-offs in pudo-menu
    d3.select("#ward-menu").node()[0].selected = true;
    d3.select("#pudo-menu").node()[2].selected = true;

    // Unfreeze hoverLine if it was previously frozen
    if (!d3.select(".mapboxgl-canvas-container").classed("moveable")) {
      d3.select(".mapboxgl-canvas-container").classed("moveable", true);
    }

    // Clear any previously frozen hoverLine tooltips
    divHoverLine.style("opacity", 0);
    // Show hoverLine and tooltip for ward 1, Mon, amPeak, Humber College
    showLineHover(settingsFractionLine.initHoverLineArray, settingsFractionLine.initToolTipText,
      settingsFractionLine.initToolTipPosn);

    // Set focus and zoom to Humber College
    wardpudoMap.rmCircle();
    wardpudoMap.options.focus = pudoMapSettings.w1Centre;
    wardpudoMap.options.zoom = pudoMapSettings.initZoom;
    wardpudoMap.gotoFocus();

    // Highlight Humber dropoffs and dim the other markers
    wardpudoMap.options.markerClass = "dropoffs";
    wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["dropoffs"];
    wardpudoMap.addCircle();

    d3.select("#pudoCOTmap").selectAll("span").each(function(d, i) {
      if (d3.select(this).text() == humberDropoffs) {
        d3.select(this.parentNode.parentNode)
          .attr("id", "humberDropoffs");
      }
    })

    d3.selectAll(".marker-cluster:not(#humberDropoffs)")
      .classed("dim-trips", true);
  })
  .on("mouseout", function() {
    d3.selectAll(".marker-cluster")
      .classed("dim-trips", false);
  });
}
