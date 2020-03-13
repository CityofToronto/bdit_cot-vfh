// The main javascript file for bdit_cot-vfh.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

$(function () {
  // if (window['CotApp']) { //the code in this 'if' block should be deleted for embedded apps
  //   const app = new CotApp("bdit_cot-vfh",{
  //     hasContentTop: false,
  //     hasContentBottom: false,
  //     hasContentRight: false,
  //     hasContentLeft: false,
  //     searchcontext: 'INTER'
  //   });
  //
  //   app.setBreadcrumb([
  //     {"name": "bdit_cot-vfh", "link": "#"}
  //   ]).render();
  // }
  let container = $("#bdit_cot-vfh_container");
});

// -----------------------------------------------------------------------------
// CUSTOM CODE
// import settPudoLine from "./settings_fractionLine.js";

// data objects
let tpd = {}; // Avg trips per day
let ptcVol = {}; // PTC volume fraction of total traffic
let shareProp = {}; // shared trips (requested and matched)
let cityTod = {}; // Time-of-day trip counts for city
let nnTopo = {}; // Neighbourhood topojson for VKT vol
const ptcFraction = {}; // PTC Trip Fraction by ward
let thisPTC = {}; // PTC for pudo-menu selection
const pudoMap = {}; // PUDO map by ward
let map; // mapbox map
let geoMap = {}; // PUDO map by ward FOR MAPBOX, all days and timewindows
let wardLayer = {}; // ward shapefiles
let nnLayer = {}; // neighbourhood shapefiles

// data selectors
let ptcvolTOD = "allday"; // Time of day for PTC vol fraction
let selShare = "req"; // Requested vs Matched shared trips
let ward = "w1";
let day = "mon"; // Ward trip fraction table sub-menu selector
let pudoDay = "Monday"; // Ward PUDO for whole week
let pudoTOD = "amPeak"; // Time of day for ward PUDOs
let pudoIdx; // index of PUDO line data for hover tool text
let pudoHr; // hour of PUDO line data for hover tool text
let whichPUDO = "pudo"; // Get both pickups and dropoffs for ward fraction

// titles that change with selectors
let shareMapTableTitle;

// Chart SVG names
let tpdSvg;
let vktMapSvg;
let shareMapSvg;
let cityTodSvg;
let fractionLineSvg;
let pudoMapTable;
let wardpudoMap;

// Tooltip div names
let tpdTip;
let vktMapTip;
let shareMapTip;
let cityTodTip;
let saveHoverPos = []; // posn of hoverline to store when frozen and pudo-menu is changed

// PUDO map defaults
let currentCentre; // stores current centre of map moved by user

// -----------------------------------------------------------------------------
// Page texts
function pageTexts() {
  // Intro texts
  d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));

  // VKT
  // ** vkt dropdown menu
  d3.select("#for-vkt label").text(i18next.t("vkt-menu", {ns: "menus"}));
  d3.select("#vkt-menu").node()[0].text = i18next.t("allday", {ns: "menus"});
  d3.select("#vkt-menu").node()[1].text = i18next.t("amPeak", {ns: "menus"});
  d3.select("#vkt-menu").node()[2].text = i18next.t("pmPeak", {ns: "menus"});
  d3.select("#vkt-menu").node()[3].text = i18next.t("postpmPeak", {ns: "menus"});

  // Ward patterns
  // ** text interaction for Humber story
  d3.selectAll(".section-text .highlight-humber")
    .on("click", function() {
      d3.event.preventDefault();
    })
    .on("mouseover", function() {
      humberStory();
      updatePudoMapTitle();
    })
    .on("mouseout", function() {
      // Restore orig layer and hide story layer
      map.setPaintProperty("w1-Monday-amPeak-pudo-pudo", "circle-opacity", 1);
      map.setLayoutProperty("hb-w1-Monday-amPeak-pudo-pudo", "visibility", "none");
      map.setLayoutProperty("hb-w1-Monday-amPeak-pudo-pudo-label", "visibility", "none");
    });
    // Humber Story button
    d3.select("#show-humber")
      .on("click", function() {
        humberStory();
        // updatePudoMapTitle();
      });


  // ** ward dropdown menu
  d3.select("#for-ward label").text(i18next.t("ward-menu", {ns: "menus"}));
  d3.select("#ward-menu").node()[0].text = i18next.t("w1", {ns: "wards"});
  d3.select("#ward-menu").node()[1].text = i18next.t("w1", {ns: "wards"});
  d3.select("#ward-menu").node()[1].text = i18next.t("w10", {ns: "wards"});
  // ** pudo menu
  d3.select("#for-type label").text(i18next.t("pudo-menu", {ns: "menus"}));
  d3.select("#pudo-menu").node()[0].text = i18next.t("pudo", {ns: "pudo"});
  d3.select("#pudo-menu").node()[1].text = i18next.t("pu", {ns: "pudo"});
  d3.select("#pudo-menu").node()[2].text = i18next.t("do", {ns: "pudo"});

  // ** PUDO map
  d3.select("#pudoMapTitle h4").html(i18next.t("title", {ns: "pudoMap"}));
}

function showTPDline() {
  const tpdLine = lineChart(tpdSvg, settTpdLine, tpd);
  // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html
  const filteredData = settTpdLine.filterData(tpd);
  const flatData = [].concat.apply([], filteredData.map(function(d) {
    return settTpdLine.z.getNotNullDataPoints.call(settTpdLine, d);
  }));
  tpdSvg.id = "tpdGrowth"; // used in createOverlay to identify the svg
  circleOverlay(tpdLine, flatData, (d) => { // onMsOverCb
    // console.log("onMsOverCb: ", d)
    // const tr2 = `${d3.format("(,")(d.value)} ${settTpdLine.tooltip.units}`;
    // hoverlineTip(tpdTip, d.date, tr2, settTpdLine)
  }, () => { // onMsOutCb;

  }, () => { // onMsClickCb; toggle between moveable and frozen

  });

  // Legend
  lineLegend(tpdSvg, settTpdLine, tpd);

  // Create data table for VKT vol map
  const tpdTable = lineTable(tpdSvg, settTpdLine, tpd);
}

function showVktMap() {
  const fullDimExtent = fullExtent(vktMapSett, ptcVol);
  choropleth(nnLayer["subway"],nnTopo, vktMapSvg, vktMapSett, ptcVol[ptcvolTOD], fullDimExtent);

  // Create data table for VKT vol map
  const vktTable = lineTable(vktMapSvg, vktMapSett,
    vktMapSett.topTen.call(vktMapSett, ptcVol[ptcvolTOD]));
}

function showShareMap() {
  const fullDimExtent = fullExtent(shareMapSett, shareProp);
  choropleth(nnLayer["subway"],nnTopo, shareMapSvg, shareMapSett, shareProp[selShare], fullDimExtent);

  // Create data table for VKT vol map
  const shareTable = lineTable(shareMapSvg, shareMapSett,
    shareMapSett.topTen.call(shareMapSett, shareProp[selShare]));
}

function showCityTodLine() {
  const citytodLine = lineChart(cityTodSvg, settCityTodLine, cityTod);
  const citytodTable = lineTable(cityTodSvg, settCityTodLine, cityTod);
  // Only show table if action button is clicked
  d3.select(`#${settCityTodLine.actionId}`)
    .on("click", function() {
      d3.select(".citytod .chart-data-table")
        .select("table")
        .style("display", "table");
    });
}

function showFractionLine() {
  // Keep only the timeseries data belonging to whichPUDO selection for the current ward
  // This data will be passed into createOverlay and lineTable
  thisPTC = settPudoLine.z.reduceData(ptcFraction[ward]);

  const fractionLine = lineChart(fractionLineSvg, settPudoLine, ptcFraction[ward]);
  // axes labels
  rotateLabels("fractionline", settPudoLine);

  // hover line
  fractionLineSvg.id = "fractionline"; // used in createOverlay to identify the svg
  createOverlay(fractionLine, thisPTC, (d) => { // onMsOverCb
    // Allow moveable hoverLine only if not frozen by mouse click
    if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
      d3.select(".leaflet-popup").remove(); // remove any open map marker popups
      // Call corresponding PUDO map
      pudoIdx = d.ward[0];
      pudoHr = d.ward[1];
      pudoDay = d.ward[2][0];
      pudoTOD = d.ward[2][1];

      const clearPrevWard = false;
      updatePudoMapTitle();
      updateMapbox(clearPrevWard);
      // Close map table
      d3.select(".maptable").select("details").attr("open", null);
      hideStoryLayer("hb-w1-Monday-amPeak-pudo-pudo");
    }
  }, () => { // onMsOutCb;
    saveHoverLinePos();
    // Update data table for map
    const root = geoMap[ward][pudoDay][pudoTOD];
    const nnCountObj = pudoMapSett.getTableData(root);
    pudoMapTable = lineTable(".maptable", pudoMapSett, nnCountObj);
    updateTitles();
  }, () => { // onMsClickCb; toggle between moveable and frozen
    const mapState = d3.select(".mapboxgl-canvas-container");
    mapState.classed("moveable", !mapState.classed("moveable"));
    if (!mapState.classed("moveable")) {
      saveHoverLinePos();
    }
    // Update data table for map
    const root = geoMap[ward][pudoDay][pudoTOD];
    const nnCountObj = pudoMapSett.getTableData(root);
    pudoMapTable = lineTable(".maptable", pudoMapSett, nnCountObj);
    updateTitles();
  });

  // Data table for trip fraction
  const fractionLineTable = lineTable(fractionLineSvg, settPudoLine, thisPTC);

  // Only show table if action button is clicked
  d3.select(`#${settPudoLine.actionId}`)
    .on("click", function() {
      d3.select(".fractionline .chart-data-table")
        .select("table")
        .style("display", "table");
    });
}
// Fig 5b - PUDO map
function initMapBox() {
  mapboxgl.accessToken = "pk.eyJ1Ijoia2F0aWRldiIsImEiOiJjanplam5wcTUwMWd1M25ucnkyMXRydjJ3In0.YE-q3_27uwg5mxaGNPkx0g";

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: pudoMapSett[`${ward}Focus`].xy,
    zoom: pudoMapSett[`${ward}Focus`].zoom
  });

  map.addControl(new mapboxgl.NavigationControl({showCompass: false}));

  const rootLayer = `${ward}-${pudoDay}-${pudoTOD}`;
  const root = geoMap[ward][pudoDay][pudoTOD];
  map.on("load", function() {
    // Unique pickups layer
    makeLayer(`${rootLayer}-pu`, root["pu"], "pu");
    // Unique dropoffs layer
    makeLayer(`${rootLayer}-do`, root["do"], "do");
    // Overlapping PUDOs
    makePUDOLayer(`${rootLayer}-pudo-pudo`, root["pudo"]);
    // Ward boundary
    makeWardLayer(`${ward}-layer`, wardLayer[ward], pudoMapSett.ward);
    // Neighbourhood boundaries
    const n = Object.keys(nnLayer[ward]);
    for (let idx = 0; idx < n.length; idx++) {
      makeWardLayer(`${n[idx]}-layer`, nnLayer[ward][n[idx]], pudoMapSett.nn);
    }
  });

  // Assign map aria label and moveable state
  d3.select(".mapboxgl-canvas-container")
    .attr("aria-label", i18next.t("alt", {ns: "pudoMap"}))
    .classed("moveable", true);

  // Data table for map
  const nnCountObj = pudoMapSett.getTableData(root);
  pudoMapTable = lineTable(".maptable", pudoMapSett, nnCountObj);
}

function updateMapbox(clearPrevWard) { // called by moving hoverLine & pudo-menu
  // Clear any visible layers before making current pudoDay-pudoTOD layer visible
  let layerObj = map.getStyle().layers;
  // const clearPrevWard = false;
  hideLayers(layerObj, clearPrevWard);

  let rootLayer = `${ward}-${pudoDay}-${pudoTOD}`;
  if (whichPUDO === "pudo") { // display pu, do and pudo-pudo layers
    showLayer(rootLayer, layerObj, "pu"); // pu
    showLayer(rootLayer, layerObj, "do"); // do
  } else { // display whichPUDO layer and whichPUDO-pudo layer
    showLayer(rootLayer, layerObj, whichPUDO); // pu or do layer
  }
  showOverlapLayer(rootLayer, layerObj); // pu-pudo, do-pudo, or pudo-pudo layer
}

// -----------------------------------------------------------------------------
const loadData = function(cb) {
  if (!ptcFraction[ward]) {
    d3.json(`/* @echo SRC_PATH *//data/ptc_counts_${ward}.json`, function(err, todfile) {
      ptcFraction[ward] = todfile;
      d3.json(`/* @echo SRC_PATH *//geojson/${ward}_agg_cutoff_15.geojson`, function(err, wardmapfile) {
        // d3.json(`/resources/geojson/${ward}_boundary.geojson`, function(err, wardfile) {
          geoMap[ward] = wardmapfile;
          // wardLayer[ward] = wardfile;
          cb();
        // })
      })
    })
  } else {
    cb();
  }
};

function updateTitles() {
  const fractionCaptionTitle = `${i18next.t(whichPUDO, {ns: "pudo"})}
    ${i18next.t("captiontitle", {ns: "ward_towline"})}
    ${i18next.t(ward, {ns: "wards"})}`;
  d3.select(".fractionline").select("caption").text(`${fractionCaptionTitle} on ${i18next.t(day, {ns: "days"})}`);

  // pudo map table
  const thisWin = (pudoDay === "Saturday" || pudoDay === "Sunday") ?
    i18next.t(pudoTOD, {ns: "timewinSpan-wkend"}) :
    i18next.t(pudoTOD, {ns: "timewinSpan-wkday"})
  d3.select(".maptable").select("caption")
    .html(`${i18next.t("tableCaption", {ns: "pudoMap"})} in ${i18next.t(ward, {ns: "wards"})},
            ${pudoDay}, ${thisWin}`);
}
function updateTableCaption() {
  const fractionCaptionTitle = `${i18next.t(whichPUDO, {ns: "pudo"})}
    ${i18next.t("captiontitle", {ns: "ward_towline"})}
    ${i18next.t(ward, {ns: "wards"})}`;
  d3.select(".fractionline").select("caption").text(`${fractionCaptionTitle} on ${i18next.t(day, {ns: "days"})}`);
}
function updatePudoMapTitle() {
  const thisWin = (pudoDay === "Saturday" || pudoDay === "Sunday") ?
    i18next.t(pudoTOD, {ns: "timewinSpan-wkend"}) :
    i18next.t(pudoTOD, {ns: "timewinSpan-wkday"})
  if (pudoTOD) {
    d3.select("#pudoMapTitle h4")
      .html(`Trip locations for ${pudoDay},
            ${thisWin}`);
  } else d3.select("#pudoMapTitle h4").html("");
}

// -----------------------------------------------------------------------------
function uiHandler(event) {
  if (event.target.id === "vkt-menu") {
    ptcvolTOD = event.target.value; // "All day" initially
    showVktMap();
    updateTitles();
  }

  if (event.target.id === "share-menu") {
    selShare = event.target.value; // "All day" initially
    showShareMap();
    shareMapTableTitle = `${i18next.t("tableMatchTitle", {ns: "share_map"})}`;
    d3.select(".sharemap").select("summary").text(shareMapTableTitle);
    // let legTitle = selShare === "req" ?
    //   `${i18next.t("legendTitle", {ns: "share_map"})}` :
    //   `${i18next.t("legendTitleMatched", {ns: "share_map"})}`;
    // d3.select("#sharelg .legendTitle")
    //   .text(legTitle);
  }

  if (event.target.id === "pudo-menu") {
    whichPUDO = event.target.value; // "pudos" initially
    const clearPrevWard = false;
    showFractionLine();
    // Update hover tool text
    const val = d3.format("(,")(ptcFraction[ward][whichPUDO][pudoIdx]);
    const thisTOD = findTOD([pudoHr, pudoIdx]);
    showHoverText(val, pudoHr, thisTOD);

    // Update data table for map
    // First close map table
    d3.select(".maptable").select("details").attr("open", null);
    const root = geoMap[ward][pudoDay][pudoTOD];
    const nnCountObj = pudoMapSett.getTableData(root);
    pudoMapTable = lineTable(".maptable", pudoMapSett, nnCountObj);

    updateMapbox(clearPrevWard);
    plotPudoLegend(pudoMapSett.legendMenu[whichPUDO]); // Update map legend
    if (saveHoverPos.length !== 0) holdHoverLine(saveHoverPos);
    else holdHoverLine(settPudoLine.initHoverLine.coords);
    hideTable("fractionline");

    updateTitles();
  }

  if (event.target.id === "ward-menu") {
    ward = event.target.value; // w1 initially
    const clearPrevWard = true;
    updateTitles();

    hideTable("fractionline");

    loadData(() => {
      showWardBoundary();
      updateMapbox(clearPrevWard);
      showFractionLine(); // calls updateMapbox() for hoverLine;
      // Update hover tool text
      const val = d3.format("(,")(ptcFraction[ward][whichPUDO][pudoIdx]);
      const thisTOD = findTOD([pudoHr, pudoIdx]);
      showHoverText(val, pudoHr, thisTOD);

      if (saveHoverPos.length !== 0) holdHoverLine(saveHoverPos);
      else holdHoverLine(settPudoLine.initHoverLine.coords);

      // Update data table for map
      // First close map table
      d3.select(".maptable").select("details").attr("open", null);
      const root = geoMap[ward][pudoDay][pudoTOD];
      const nnCountObj = pudoMapSett.getTableData(root);
      pudoMapTable = lineTable(".maptable", pudoMapSett, nnCountObj);
    });

    if (map.getZoom() !== pudoMapSett[`${ward}Focus`].zoom) {
      map.setZoom(pudoMapSett[`${ward}Focus`].zoom);
    }
    map.flyTo({center: pudoMapSett[`${ward}Focus`].xy});
  }
  // Table menu for trip fraction lineChart table
  else if (event.target.id === settPudoLine.menuId) {
    day = event.target.value;
    updateTableCaption();
    lineTable(fractionLineSvg, settPudoLine, thisPTC);

    // Hide table until action button is clicked
    d3.select(".fractionline .chart-data-table")
      .select("table")
      .style("display", "none");
  }
}

// -----------------------------------------------------------------------------
$(document).ready(function(){
  // ---------------------------------------------------------------------------
  // Chart SVGs
  // Fig 1 - Avg trips per day line chart
  tpdSvg = d3.select(".tpdline")
    .append("svg")
    .attr("id", "tpdGrowth");

  // Fig 2 - VKT map
  vktMapSvg = d3.select(".vktmap.data")
      .append("svg")
      .attr("id", "vktmap");

  // Fig 3 - shared trips map
  shareMapSvg = d3.select(".sharemap.data")
      .append("svg")
      .attr("id", "sharemap");

  // Fig 4 - Time-of-day trip counts for city
  cityTodSvg = d3.select(".citytod.data")
      .append("svg")
      .attr("id", "citytod");

  // Fig 5a - Trip Fraction line chart
  fractionLineSvg = d3.select(".fractionline.data")
      .append("svg")
      .attr("id", "fractionline");

  // Tooltip divs
  tpdTip = d3.select("body").select("#bdit_cot-vfh_container")
    .append("div").attr("id", "tpdTip")
    .attr("class", "panel panel-default")
    .append("div");

  vktMapTip = d3.select("body").select("#bdit_cot-vfh_container")
      .append("div").attr("id", "vktMapTip")
      .attr("class", "panel panel-default")
      .append("div");

  shareMapTip = d3.select("body").select("#bdit_cot-vfh_container")
      .append("div").attr("id", "shareMapTip")
      .attr("class", "panel panel-default")
      .append("div");

  // Initial page load
  i18n.load(["/* @echo SRC_PATH *//i18n"], () => {
    settTpdLine.x.label = i18next.t("x_label", {ns: "tpd"}),
    settTpdLine.y.label = i18next.t("y_label", {ns: "tpd"}),
    shareMapSett.legend.title = i18next.t("legendTitle", {ns: "share_map"}),
    settCityTodLine.x.label = i18next.t("x_label", {ns: "ward_towline"}),
    settCityTodLine.y.label = i18next.t("y_label", {ns: "city_tod"}),
    settPudoLine.alt = i18next.t("alt", {ns: "ward_towline"}),
    settPudoLine.y.label = i18next.t("y_label", {ns: "ward_towline"}),
    settPudoLine.x.label = i18next.t("x_label", {ns: "ward_towline"}),
    settPudoLine.menuLabel = i18next.t("menuLabel", {ns: "ward_towline"}),
    d3.queue()
      .defer(d3.json, "/* @echo SRC_PATH *//data/fig1_dailytrips.json") // Fig 1 - daily trip lineChart in city
      .defer(d3.json, "/* @echo SRC_PATH *//data/ptc_vol.json") // Fig 2 - PTC volume map by nn
      .defer(d3.json, "/* @echo SRC_PATH *//data/fig3_shared_trips_by_nn.json") // Fig 3 - shared trips map by nn
      .defer(d3.json, "/* @echo SRC_PATH *//data/fig4_tod_city.json") // Fig 4 - city time of day lineChart
      .defer(d3.json, "/* @echo SRC_PATH *//data/ptc_counts_w1.json") // Fig5a - PTC counts lineChart ward 1
      .defer(d3.json, "/* @echo SRC_PATH *//geojson/w1_agg_cutoff_15.geojson") // Fig5b - PUDO map ward 1
      .defer(d3.json, "/* @echo SRC_PATH *//geojson/wards.geojson") // wards layer
      .defer(d3.json, "/* @echo SRC_PATH *//geojson/neighbourhoods.geojson") // neighbourhoods layer by ward
      .defer(d3.json, "/* @echo SRC_PATH *//geojson/to_separated_parts.topojson") // all neighbourhoods together
      .await(function(error, fig1, fig2, fig3, fig4, fig5a, fig5b, wardfile, nnfile, nntopofile) {
        // Load data files into objects
        tpd = fig1;
        ptcVol = fig2;
        shareProp = fig3;
        cityTod = fig4;
        ptcFraction[ward] = fig5a;
        geoMap[ward] = fig5b;

        // Load geojsons into objects
        wardLayer = wardfile;
        nnLayer = nnfile;
        nnTopo = nntopofile;

        showTPDline();
        const tpdTableTitle = `${i18next.t("tabletitle", {ns: "tpd"})}`;
        d3.select(".tpdline").select("summary").text(tpdTableTitle);

        showVktMap();
        const vktMapTableTitle = `${i18next.t("tabletitle", {ns: "vkt_map"})},
          ${i18next.t(ptcvolTOD, {ns: "menus"})}`;
        d3.select(".vktmap").select("summary").text(vktMapTableTitle);

        showShareMap();
        shareMapTableTitle = `${i18next.t("tabletitle", {ns: "share_map"})}`;
        d3.select(".sharemap").select("summary").text(shareMapTableTitle);

        showCityTodLine();

        // Display texts
        pageTexts();

        // Line Charts
        showFractionLine();
        const fractionTableTitle = `${i18next.t("tabletitle", {ns: "ward_towline"})}`;
        const fractionCaptionTitle = `${i18next.t(whichPUDO, {ns: "pudo"})}
          ${i18next.t("captiontitle", {ns: "ward_towline"})}
          ${i18next.t(ward, {ns: "wards"})}`;
        d3.select(".fractionline").select("summary").text(fractionTableTitle);
        d3.select(".fractionline").select("caption").text(`${fractionCaptionTitle} on ${i18next.t(day, {ns: "days"})}`);

        // Show hoverLine and tooltip for ward 1, Mon, amPeak, Humber College
        showLineHover(settPudoLine.initHoverLine.coords);
        pudoHr = settPudoLine.initHoverLine.indices[0];
        pudoIdx = settPudoLine.initHoverLine.indices[1];
        const thisTOD = findTOD([pudoHr, pudoIdx]);
        const val = d3.format("(,")(ptcFraction[ward][whichPUDO][pudoIdx]);
        showHoverText(val, pudoHr, thisTOD);

        initMapBox();
        d3.select(".maptable").select("summary").text(`${i18next.t("tabletitle", {ns: "pudoMap"})}`);
        d3.select(".maptable").select("caption")
          .html(`${i18next.t("tableCaption", {ns: "pudoMap"})} in ${i18next.t(ward, {ns: "wards"})},
                  ${pudoDay}, ${i18next.t(pudoTOD, {ns: "timewinSpan-wkday"})}`);
        const legendTexts = pudoMapSett.legendMenu[whichPUDO];
        plotPudoLegend(legendTexts);
      });
  })
})

$(document).on("change", uiHandler);
