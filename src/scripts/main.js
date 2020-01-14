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
const ptcFraction = {}; // PTC Trip Fraction by ward
let thisPTC = {}; // PTC for pudo-menu selection
const pudoMap = {}; // PUDO map by ward
let map;
let geoMap = {}; // PUDO map by ward FOR MAPBOX, all days and timewindows
let wardLayer = {}; // ward shapefiles
let nnLayer = {}; // neighbourhood shapefiles
let ptcVol = {}; // PTC volume fraction of total traffic

// data selectors
let ward = "w1";
let day = "mon"; // Ward trip fraction table menu selector
let mapday = "mon"; // Day for map table menu
let pudoDay = "Monday"; // Ward PUDO for whole week
let pudoTOD = "amPeak"; // Time of day for ward PUDOs
let whichPUDO = "pudo"; // Get both pickups and dropoffs for ward fraction
let ptcvolTOD = "allday"; // Time of day for PTC vol fraction

// Chart names
let fractionLineChart;
let fractionTableTitle;
let pudoMapTableTitle;
let wardpudoMap;

// Tooltip div names
let divHoverLine;
let saveHoverPos = []; // posn of hoverline to store when frozen and pudo-menu is changed

// PUDO map defaults
let currentCentre; // stores current centre of map moved by user

// -----------------------------------------------------------------------------
// Page texts
function pageTexts() {
  // Intro texts
  d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
  d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));

  // VKT
  // Ward patterns
  d3.select("#section3").html(i18next.t("section3", {ns: "indexhtml"}));
  d3.select("#section3-text1").html(i18next.t("section3-text1", {ns: "indexhtml"}));

  // Ward patterns
  d3.select("#section4").html(i18next.t("section4", {ns: "indexhtml"}));
  d3.select("#section4-text1a").html(i18next.t("section4-text1a", {ns: "indexhtml"}));
  d3.select("#section4-text1b").html(i18next.t("section4-text1b", {ns: "indexhtml"}));
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

  d3.select("#for-hover label").text(i18next.t("hover-freeze", {ns: "indexhtml"}));
  // ** PUDO map
  d3.select("#pudoMapTitle h4").html(i18next.t("title", {ns: "pudoMap"}));
  d3.select("#puOnly").append("text").html(i18next.t("puOnly", {ns: "pudoMap"}));
  d3.select("#puMax").append("text").html(i18next.t("puMax", {ns: "pudoMap"}));
  d3.select("#puMid").append("text").html(i18next.t("puMid", {ns: "pudoMap"}));
  d3.select("#puMin").append("text").html(i18next.t("puMin", {ns: "pudoMap"}));
  d3.select("#doOnly").append("text").html(i18next.t("doOnly", {ns: "pudoMap"}));
}

function showVktMap(topojfile) {

  choropleth(topojfile, vktMap, vktMapSett, ptcVol[ptcvolTOD]);
}

function showFractionLine() {
  // Keep only the timeseries data belonging to whichPUDO selection for the current ward
  // This data will be passed into lineChart, createOverlay, and lineTable
  let thisKey;
  thisPTC = Object.keys(ptcFraction[ward]).reduce((object, key) => {
    if (key === "keys" || key === whichPUDO) {
      thisKey = key === "keys" ? key : "fraction";
      object[thisKey] = ptcFraction[ward][key]
    }
    return object
  }, {})

  const fractionLine = lineChart(fractionLineChart, settPudoLine, thisPTC);

  // axes labels
  rotateLabels("fractionline", settPudoLine);

  // hover line
  fractionLineChart.id = "fractionline"; // used in createOverlay to identify the svg
  createOverlay(fractionLine, thisPTC, (d) => { // onMsOverCb
    // Allow moveable hoverLine only if not frozen by mouse click
    if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
      d3.select(".leaflet-popup").remove(); // remove any open map marker popups
      hoverlineTip(divHoverLine, d);
      // Call corresponding PUDO map
      pudoDay = d.ward[2][0];
      pudoTOD = d.ward[2][1];
      const clearPrevWard = false;
      updatePudoMapTitle();
      updateMapbox(clearPrevWard);
    }
  }, () => { // onMsOutCb; hide tooltip on exit only if hoverLine not frozen
    // if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
    //   divHoverLine.style("opacity", 0);
    // } else {
    //   saveHoverLinePos();
    // }
    divHoverLine.style("opacity", 1);
    saveHoverLinePos();
  }, () => { // onMsClickCb; toggle between moveable and frozen
    const mapState = d3.select(".mapboxgl-canvas-container");
    mapState.classed("moveable", !mapState.classed("moveable"));
    if (!mapState.classed("moveable")) {
      saveHoverLinePos();
    }
  });

  // Data table for trip fraction
  const fractionLineTable = lineTable(fractionLineChart, settPudoLine, thisPTC, day);

  // Only show table if action button is clicked
  d3.select(`#${settPudoLine.actionId}`)
    .on("click", function() {
      d3.select(".fractionline .chart-data-table")
        .select("table")
        .style("display", "table");
    });
}
// Fig 4b - PUDO map
function initMapBox() {
  mapboxgl.accessToken = "pk.eyJ1Ijoia2F0aWRldiIsImEiOiJjanplam5wcTUwMWd1M25ucnkyMXRydjJ3In0.YE-q3_27uwg5mxaGNPkx0g";

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: pudoMapSett[`${ward}Focus`].xy,
    zoom: pudoMapSett[`${ward}Focus`].zoom
  });

  map.addControl(new mapboxgl.NavigationControl({showCompass: false}));

  map.on("load", function() {
    const rootLayer = `${ward}-${pudoDay}-${pudoTOD}`;
    const root = geoMap[ward][pudoDay][pudoTOD];
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
  let mockNN = [
    {"values": [{"nn":"NN1", "value": 390},
    {"nn":"NN2", "value": 227}, {"nn":"NN3", "value": 152}, {"nn":"NN4", "value": 339} ]}
  ]
  //
  const mapTable = lineTable(".maptable", pudoMapSett, mockNN, mapday);

  // Only show table if action button is clicked
  d3.select(`#${pudoMapSett.actionId}`)
    .on("click", function() {
      d3.select(".maptable .chart-data-table")
        .select("table")
        .style("display", "table");
    });
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
    d3.json(`/resources/data/fig4a_dummy_tripfraction_${ward}.json`, function(err, todfile) {
      ptcFraction[ward] = todfile;
      d3.json(`/resources/geojson/${ward}_agg_cutoff.geojson`, function(err, wardmapfile) {
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
  fractionTableTitle = `${settPudoLine.tableTitle}, ${i18next.t(ward, {ns: "wards"})}`;
  d3.select(".fractionline").select("summary").text(fractionTableTitle);
  d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);
}
function updateTableCaption() {
  d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);
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
  if (event.target.id === "pudo-menu") {
    whichPUDO = event.target.value; // pudos initially
    const clearPrevWard = false;
    showFractionLine();
    updateMapbox(clearPrevWard);
    if (saveHoverPos.length !== 0) holdHoverLine(saveHoverPos);
    else holdHoverLine(settPudoLine.initHoverLinePos);
    hideTable("fractionline");
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
      if (saveHoverPos.length !== 0) holdHoverLine(saveHoverPos);
      else holdHoverLine(settPudoLine.initHoverLinePos);

    });

    map.flyTo({center: pudoMapSett[`${ward}Focus`].xy});
    if (map.getZoom() !== pudoMapSett[`${ward}Focus`].zoom) {
      map.setZoom(pudoMapSett[`${ward}Focus`].zoom);
    }
  }
  // Table menu for trip fraction lineChart table
  else if (event.target.id === settPudoLine.menuId) {
    day = event.target.value;
    updateTableCaption();
    lineTable(fractionLineChart, settPudoLine, thisPTC, day);

    // Hide table until action button is clicked
    d3.select(".fractionline .chart-data-table")
      .select("table")
      .style("display", "none");
  }
  // Table menu for PUDO map table
  else if (event.target.id === pudoMapSett.menuId) {
    mapboxday = event.target.value;
    // updateTableCaption();

    let mockNN = [
      {"values": [{"nn":"NN1", "value": 390},
      {"nn":"NN2", "value": 227}, {"nn":"NN3", "value": 152}, {"nn":"NN4", "value": 339} ]}
    ]
    lineTable(".maptable", pudoMapSett, mockNN, mapday);

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
  // VKT map
  vktMap = d3.select(".vktmap.data")
      .append("svg")
      .attr("id", "vktmap");

  // Fig 4a - Trip Fraction line chart
  fractionLineChart = d3.select(".fractionline.data")
      .append("svg")
      .attr("id", "fractionline");

  // Tooltip divs
  divHoverLine = d3.select("body").select("#bdit_cot-vfh_container")
      .append("div").attr("id", "hoverLineFraction")
      .attr("class", "panel panel-default")
      .append("div").attr("class", "list-group");

  // Initial page load
  i18n.load(["/resources/i18n"], () => {
    settPudoLine.alt = i18next.t("alt", {ns: "ward_towline"}),
    settPudoLine.y.label = i18next.t("y_label", {ns: "ward_towline"}),
    settPudoLine.x.label = i18next.t("x_label", {ns: "ward_towline"}),
    settPudoLine.tableTitle = i18next.t("tabletitle", {ns: "ward_towline"}),
    settPudoLine.menuLabel = i18next.t("menuLabel", {ns: "ward_towline"}),
    pudoMapSett.y.label = i18next.t("y_label", {ns: "pudoMap"}),
    pudoMapSett.x.label = i18next.t("x_label", {ns: "pudoMap"}),
    pudoMapSett.tableTitle = i18next.t("tabletitle", {ns: "pudoMap"}),
    d3.queue()
      .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w1.json") // trip fraction for ward 1
      .defer(d3.json, "/resources/geojson/w1_agg_cutoff.geojson")
      .defer(d3.json, "/resources/geojson/wards.geojson")
      .defer(d3.json, "/resources/geojson/neighbourhoods.geojson")
      .defer(d3.json, "/resources/geojson/neighbourhoods_all.topojson")
      .defer(d3.json, "/resources/data/ptc_vol.json")
      .await(function(error, ptcfractionfile, mapboxfile, wardfile, nnfile, nntopo, ptcvolfile) {
        // Load data files into objects
        ptcFraction[ward] = ptcfractionfile;
        geoMap[ward] = mapboxfile;
        wardLayer = wardfile;
        nnLayer = nnfile;
        ptcVol = ptcvolfile;

        showVktMap(nntopo);

        // initial titles
        fractionTableTitle = `${settPudoLine.tableTitle}, ${i18next.t(ward, {ns: "wards"})}`;
        pudoMapTableTitle = `${pudoMapSett.tableTitle}, ${i18next.t(ward, {ns: "wards"})}`;

        // Display texts
        pageTexts();

        // Line Charts
        showFractionLine();
        d3.select(".fractionline").select("summary").text(fractionTableTitle);
        d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);

        // Show hoverLine and tooltip for ward 1, Mon, amPeak, Humber College
        showLineHover(settPudoLine.initHoverLinePos, settPudoLine.initTipText, settPudoLine.initTipPosn);

        initMapBox();
        d3.select(".maptable").select("summary").text(pudoMapSett.tableTitle);
        d3.select(".maptable").select("caption").text(`${pudoMapSett.tableTitle}, ${i18next.t(day, {ns: "days"})}`);
      });
  })
})

$(document).on("change", uiHandler);
