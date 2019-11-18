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
  let container = $('#bdit_cot-vfh_container');
});

// -----------------------------------------------------------------------------
// CUSTOM CODE
// import settingsFractionLine from "./settings_fractionLine.js";

// data objects
const ptcFraction = {}; // PTC Trip Fraction by ward
const pudoMap = {}; // PUDO map by ward

// data selectors
let ward = "w1";
let day = "mon"; // Ward trip fraction table menu selector
let pudoDay = "week"; // Ward PUDO for whole week
let pudoTOD = "all"; // Ward PUDO for all times of day

// Chart names
let fractionLineChart;
let fractionTableTitle;
let wardpudoMap;

// Tooltip div names
let divHoverLine;

// -----------------------------------------------------------------------------
// Page texts
function pageTexts() {
  // Intro texts
  d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
  d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));

  // Ward patterns
  d3.select("#section4").html(i18next.t("section4", {ns: "indexhtml"}));
  d3.select("#section4-text1").html(i18next.t("section4-text1", {ns: "indexhtml"}));
  // ** ward dropdown menu
  d3.select("#ward-menu").node()[0].text = i18next.t("w1", {ns: "wards"});
  d3.select("#ward-menu").node()[1].text = i18next.t("w22", {ns: "wards"});
}

function showFractionLine() {
  const fractionLine = lineChart(fractionLineChart, settingsFractionLine, ptcFraction[ward]);


  // axes labels
  rotateLabels("fractionline", settingsFractionLine);
  // axis annotations
  d3.select("#fractionhr")
      .text(i18next.t("hr", {ns: "towline"}));

  // hover line
  fractionLineChart.id = "fractionline"; // used in createOverlay to identify the svg
  createOverlay(fractionLine, ptcFraction[ward], (d) => { // onMouseOverCb
    // Allow moveable hoverLine only if not frozen by mouse click
    if (d3.select("#pudoCOTmap").classed("moveable")) {
      d3.select(".leaflet-popup").remove(); // remove any open map marker popups
      hoverlineTip(settingsFractionLine, divHoverLine, d);
      // Call corresponding PUDO map
      pudoDay = d.ward[2][0];
      pudoTOD = d.ward[2][1];
      if (pudoTOD) updateWardPUDOMap();
    }
  }, () => { // onMouseOutCb; hide tooltip on exit only if hoverLine not frozen
    if (d3.select("#pudoCOTmap").classed("moveable")) {
      divHoverLine.style("opacity", 0);
    }
  }, () => { // onMouseClickCb; toggle between moveable and frozen
    const mapState = d3.select("#pudoCOTmap")
    mapState.classed("moveable", !mapState.classed("moveable"));
  });

  // Data table for trip fraction
  const fractionLineTable = lineTable(fractionLineChart, settingsFractionLine, ptcFraction[ward], day);
}
// Fig 4b - PUDO map
function initWardPUDOMap() {
  pudoMapSettings = $.extend({
    markerList:  pudoMap[ward].latlon[pudoDay][pudoTOD],
    mapCenter: pudoMap[ward].latlon.mapCentre
  }, pudoMapSettings || {});

  wardpudoMap = new cot_map("pudoCOTmap", pudoMapSettings);
  d3.select("#pudoCOTmap")
    .attr("aria-label", i18next.t("alt", {ns: "pudoMap"}))
    .classed("moveable", true);

  // console.log("empty? ", d3.select("#pudoCOTmap").empty() )
  if (d3.select("#pudoCOTmap").select(".leaflet-pane").empty()) wardpudoMap.render();
  wardpudoMap.addCircle();

}
function updateWardPUDOMap() {
  pudoMapSettings.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD];
  pudoMapSettings.clearCirle = false;
  wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD];
  wardpudoMap.options.circleOptions.color = pudoMap[ward].latlon[pudoDay].color;
  wardpudoMap.options.circleOptions.fillColor = pudoMap[ward].latlon[pudoDay].fillColor;

  wardpudoMap.rmCircle();
  wardpudoMap.addCircle();
}
function changeWardPUDOMap() {
  // reset
  pudoDay = "week";
  pudoTOD = "all";
  const mapState = d3.select("#pudoCOTmap")
  mapState.classed("moveable", true);
  divHoverLine.style("opacity", 0);

  wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD];
  wardpudoMap.options.focus = pudoMap[ward].latlon.mapCentre;
  wardpudoMap.options.circleOptions.color = pudoMap[ward].latlon[pudoDay].color;
  wardpudoMap.options.circleOptions.fillColor = pudoMap[ward].latlon[pudoDay].fillColor;

  wardpudoMap.rmCircle();
  wardpudoMap.addCircle();
}


// -----------------------------------------------------------------------------
const loadData = function(cb) {
  if (!ptcFraction[ward]) {
    d3.json(`/resources/data/fig4a_dummy_tripfraction_${ward}.json`, function(err, todfile) {
      ptcFraction[ward] = todfile;
      d3.json(`/resources/data/fig4b_dummy_pudoMap_${ward}.json`, function(err, pudomapfile) {
        pudoMap[ward] = pudomapfile;
        cb();
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

  if (event.target.id === "ward-menu") {
    ward = event.target.value; // w22
    updateTitles();
    loadData(() => {
      showFractionLine();
      changeWardPUDOMap();
    });
  }
  // Menu for trip fraction lineChart table
  else if (event.target.id === "fraction-menu") {
    day = event.target.value;
    updateTableCaption();
    lineTable(fractionLineChart, settingsFractionLine, ptcFraction[ward], day);
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
    d3.queue()
      .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w1.json") // trip fraction for ward 1
      // .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w1.json") // pudo map ward 1
      .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w1.json") // pudo map ward 1
      .await(function(error, ptcfractionfile, pudomapfile) {
        // Load data files into objects
        ptcFraction[ward] = ptcfractionfile;
        pudoMap[ward] = pudomapfile;

        // initial titles
        fractionTableTitle = `${settingsFractionLine.tableTitle}, ${i18next.t(ward, {ns: "wards"})}`;

        // Display texts
        pageTexts();

        // Line Charts
        showFractionLine();
        d3.select(".fractionline").select("summary").text(fractionTableTitle);
        d3.select(".fractionline").select("caption").text(`${fractionTableTitle}, ${i18next.t(day, {ns: "days"})}`);
        initWardPUDOMap();
      });
  })
})

$(document).on("change", uiHandler);
