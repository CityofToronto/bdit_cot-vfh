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
// import settingsFractionLine from "./settings_fractionLine.js";

// data objects
const ptcFraction = {}; // PTC Trip Fraction by ward
let thisPTC = {}; // PTC for pudo-menu selection
const pudoMap = {}; // PUDO map by ward
let map;
let geoMap = {}; // PUDO map by ward FOR MAPBOX, all days and timewindows
let wardLayer = {}; // ward shapefiles

// data selectors
let ward = "w1";
let day = "mon"; // Ward trip fraction table menu selector
let pudoDay = "Monday"; // Ward PUDO for whole week
let pudoTOD = "amPeak"; // Ward PUDO for all times of day
let whichPUDO = "pudo"; // Get both pickups and dropoffs for ward fraction

// Chart names
let fractionLineChart;
let fractionTableTitle;
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

  // Ward patterns
  d3.select("#section4").html(i18next.t("section4", {ns: "indexhtml"}));
  d3.select("#section4-text1a").html(i18next.t("section4-text1a", {ns: "indexhtml"}));
  d3.select("#section4-text1b").html(i18next.t("section4-text1b", {ns: "indexhtml"}));
  // d3.select("#section4-text1c").html(i18next.t("section4-text1c", {ns: "indexhtml"}));
  // ** ward dropdown menu
  d3.select("#ward-menu").node()[0].text = i18next.t("w1", {ns: "wards"});
  d3.select("#ward-menu").node()[1].text = i18next.t("w10", {ns: "wards"});
  // ** pudo menu
  d3.select("#pudo-menu").node()[0].text = i18next.t("pudo", {ns: "pudo"});
  d3.select("#pudo-menu").node()[1].text = i18next.t("pu", {ns: "pudo"});
  d3.select("#pudo-menu").node()[2].text = i18next.t("do", {ns: "pudo"});

  // Interactive text for Section 4
  d3.selectAll(".section-text .highlight-total")
    .on("click", function() {
      d3.event.preventDefault();
    })
    .on("mouseover", function() {
      d3.selectAll(".marker-cluster:not(#humberDropoffs)")
        .style("opacity", 0.3);
    });
}

// Text story interactions
function storyTexts() {
  humberStory();
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

  const fractionLine = lineChart(fractionLineChart, settingsFractionLine, thisPTC);

  // axes labels
  rotateLabels("fractionline", settingsFractionLine);

  // hover line
  fractionLineChart.id = "fractionline"; // used in createOverlay to identify the svg
  createOverlay(fractionLine, thisPTC, (d) => { // onMouseOverCb
    // Allow moveable hoverLine only if not frozen by mouse click
    if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
      d3.select(".leaflet-popup").remove(); // remove any open map marker popups
      hoverlineTip(divHoverLine, d);
      // Call corresponding PUDO map
      pudoDay = d.ward[2][0];
      pudoTOD = d.ward[2][1];
      const clearPrevWard = false;
      updateMapbox(clearPrevWard);
    }
  }, () => { // onMouseOutCb; hide tooltip on exit only if hoverLine not frozen
    // if (d3.select(".mapboxgl-canvas-container").classed("moveable")) {
    //   divHoverLine.style("opacity", 0);
    // } else {
    //   saveHoverLinePos();
    // }
    divHoverLine.style("opacity", 1);
    saveHoverLinePos();
  }, () => { // onMouseClickCb; toggle between moveable and frozen
    const mapState = d3.select(".mapboxgl-canvas-container");
    mapState.classed("moveable", !mapState.classed("moveable"));
    if (!mapState.classed("moveable")) {
      saveHoverLinePos();
    }
  });

  // Data table for trip fraction
  const fractionLineTable = lineTable(fractionLineChart, settingsFractionLine, thisPTC, day);

  // Only show table if action button is clicked
  d3.select("#fraction-action")
    .on("click", function() {
      d3.select(".fractionline .chart-data-table")
        .select("table")
        .style("display", "table");
    });
}
// Fig 4b - PUDO map
function initWardPUDOMap() {
  pudoMapSettings = $.extend({
    mapCenter: pudoMapSettings.w1Centre, // w1 Humber College
    zoom: pudoMapSettings.initZoom
  }, pudoMapSettings || {});

  wardpudoMap = new cot_map("pudoCOTmap", pudoMapSettings);
  d3.select("#pudoCOTmap")
    .attr("aria-label", i18next.t("alt", {ns: "pudoMap"}))
    .classed("moveable", true);

  if (d3.select("#pudoCOTmap").select(".leaflet-pane").empty()) wardpudoMap.render();

  // Pick-ups
  wardpudoMap.options.markerClass = "pickups";
  wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["pickups"];
  wardpudoMap.addCircle();

  // Drop-offs
  wardpudoMap.options.markerClass = "dropoffs";
  wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD]["dropoffs"];
  wardpudoMap.addCircle();

  // Label certain clusters for story
  d3.select("#pudoCOTmap").selectAll("span").each(function(d, i) {
    if (d3.select(this).text() == humberDropoffs) {
      d3.select(this.parentNode.parentNode)
        .attr("id", "humberDropoffs");
    }
  })
}
function initMapBox() {
  mapboxgl.accessToken = "pk.eyJ1Ijoia2F0aWRldiIsImEiOiJjanplam5wcTUwMWd1M25ucnkyMXRydjJ3In0.YE-q3_27uwg5mxaGNPkx0g";

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: pudoMapSettings[`${ward}Focus`],
    zoom: 15 // starting zoom
  });

  map.on("load", function() {
    const rootLayer = `${ward}-${pudoDay}-${pudoTOD}`;
    const root = geoMap[ward][pudoDay][pudoTOD];
    const sett = pudoMapSettings.circleStyle;
    const clsett = pudoMapSettings.clusterStyle;
    // Unique pickups layer
    makeLayer(`${rootLayer}-pu`, root["pu"], sett["pu"], clsett["pu"]);
    // Unique dropoffs layer
    makeLayer(`${rootLayer}-do`, root["do"], sett["do"], clsett["do"]);
    // Overlapping PUDOs
    makeLayer(`${rootLayer}-pudo-pudo`, root["pudo"], sett["pudo"], clsett["pudo"]);
    // Ward boundary
    makeWardLayer(`${ward}-layer`, wardLayer[ward], pudoMapSettings.wardLayerColour);
  });

  // Assign map aria label and moveable state
  d3.select(".mapboxgl-canvas-container")
    .attr("aria-label", i18next.t("alt", {ns: "pudoMap"}))
    .classed("moveable", true);
}

function updateMapbox(clearPrevWard) { // called by moving hoverLine
  // Clear any visible layers before making current pudoDay-pudoTOD layer visible
  let layerObj = map.getStyle().layers;
  // const clearPrevWard = false;
  hideLayers(layerObj, clearPrevWard);

  let rootLayer = `${ward}-${pudoDay}-${pudoTOD}`;

  if (pudoTOD) { // can be undefined
    if (whichPUDO === "pudo") { // display pu, do and pudo-pudo layers
      showLayer(rootLayer, layerObj, "pu"); // pu
      showLayer(rootLayer, layerObj, "do"); // do
    } else { // display whichPUDO layer and whichPUDO-pudo layer
      showLayer(rootLayer, layerObj, whichPUDO); // pu or do layer
    }
    showOverlapLayer(rootLayer, layerObj); // pu-pudo, do-pudo, or pudo-pudo layer
  }
}

// -----------------------------------------------------------------------------
const loadData = function(cb) {
  if (!ptcFraction[ward]) {
    d3.json(`/resources/data/fig4a_dummy_tripfraction_${ward}.json`, function(err, todfile) {
      ptcFraction[ward] = todfile;
      d3.json(`/resources/geojson/${ward}_agg_cutoff.geojson`, function(err, wardmapfile) {
        d3.json(`/resources/geojson/${ward}_boundary.geojson`, function(err, wardlayerfile) {
          // pudoMap[ward] = pudomapfile;
          geoMap[ward] = wardmapfile;
          wardLayer[ward] = wardlayerfile;
          cb();
        })
      })
    })
  } else {
    cb();
  }
};

function updateTitles() {
  fractionTableTitle = `${settingsFractionLine.tableTitle}, ${i18next.t(ward, {ns: "wards"})}`;
  d3.select(".fractionline").select("summary").text(fractionTableTitle);
  d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);
}
function updateTableCaption() {
  d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);
}
// -----------------------------------------------------------------------------
function uiHandler(event) {
  if (event.target.id === "pudo-menu") {
    whichPUDO = event.target.value; // pudos initially
    const clearPrevWard = false;
    showFractionLine();
    updateMapbox(clearPrevWard);
    // if (!d3.select("#pudoCOTmap").classed("moveable")) holdHoverLine(saveHoverPos);
    if (!d3.select(".mapboxgl-canvas-container").classed("moveable")) {
      holdHoverLine(saveHoverPos);
    }

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
      else holdHoverLine(settingsFractionLine.initHoverLineArray);

    });

    // Change mapbox centre
    map.flyTo({
      center: pudoMapSettings[`${ward}Focus`]
    })
  }
  // Table menu for trip fraction lineChart table
  else if (event.target.id === "fraction-menu") {
    day = event.target.value;
    updateTableCaption();
    lineTable(fractionLineChart, settingsFractionLine, thisPTC, day);

    // Hide table until action button is clicked
    d3.select(".fractionline .chart-data-table")
      .select("table")
      .style("display", "none");
  }
}

// -----------------------------------------------------------------------------
$(document).ready(function(){



  // -----------------------------------------------------------------------------
  // Chart SVGs
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
    settingsFractionLine.alt = i18next.t("alt", {ns: "ward_towline"}),
    settingsFractionLine.y.label = i18next.t("y_label", {ns: "ward_towline"}),
    settingsFractionLine.x.label = i18next.t("x_label", {ns: "ward_towline"}),
    settingsFractionLine.tableTitle = i18next.t("tabletitle", {ns: "ward_towline"}),
    settingsFractionLine.menuLabel = i18next.t("menuLabel", {ns: "ward_towline"}),
    d3.queue()
      .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w1.json") // trip fraction for ward 1
      .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w1.json") // pudo map ward 1
      .defer(d3.json, "/resources/geojson/w1_agg_cutoff.geojson")
      .defer(d3.json, "/resources/geojson/w1_boundary.geojson")
      .await(function(error, ptcfractionfile, pudomapfile, mapboxfile, wardlayerfile) {
        // Load data files into objects
        ptcFraction[ward] = ptcfractionfile;
        pudoMap[ward] = pudomapfile;
        geoMap[ward] = mapboxfile;
        wardLayer[ward] = wardlayerfile;

        // initial titles
        fractionTableTitle = `${settingsFractionLine.tableTitle}, ${i18next.t(ward, {ns: "wards"})}`;

        // Display texts
        pageTexts();

        // Line Charts
        showFractionLine();
        d3.select(".fractionline").select("summary").text(fractionTableTitle);
        d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);

        // Show hoverLine and tooltip for ward 1, Mon, amPeak, Humber College
        showLineHover(settingsFractionLine.initHoverLineArray, settingsFractionLine.initToolTipText, settingsFractionLine.initToolTipPosn);

        initWardPUDOMap();

        storyTexts();

        initMapBox();
      });
  })
})

$(document).on("change", uiHandler);
