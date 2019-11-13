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
  console.log("orig: ", ptcFraction[ward])
  const fractionLine = lineChart(fractionLineChart, settingsFractionLine, ptcFraction[ward]);
  // axes labels
  rotateLabels("fractionline", settingsFractionLine);
  // axis annotations
  d3.select("#fractionhr")
      .text(i18next.t("hr", {ns: "towline"}));

  // hover line
  fractionLineChart.id = "fractionline"; // used in createOverlay to identify the svg
  createOverlay(fractionLine, ptcFraction[ward], (d) => {
    hoverlineTip(settingsFractionLine, divHoverLine, d);
    const thisTOD = findTOD(d.ward);
    console.log("thisTOD: ", thisTOD)
    // Call corresponding PUDO map
    pudoDay = thisTOD[0];
    pudoTOD = thisTOD[1];
    updateWardPUDOMap();

  }, () => {
    divHoverLine.style("opacity", 0);
  });

  // Data table for trip fraction
  const fractionLineTable = lineTable(fractionLineChart, settingsFractionLine, ptcFraction[ward], day);
}
// Fig 4b - PUDO map
function initWardPUDOMap() {
  pudoMapSettings = $.extend({
    markerList:  pudoMap[ward].latlon[pudoDay][pudoTOD]
  }, pudoMapSettings || {});

  wardpudoMap = new cot_map("pudo_cotmap", pudoMapSettings);
  console.log("wardpudoMap: ", wardpudoMap )
  wardpudoMap.render();
  wardpudoMap.addCircle();
}
function updateWardPUDOMap() {
  pudoMapSettings.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD];
  console.log("new pudoMapSettings: ", pudoMapSettings)

  console.log("wardpudoMap before: ", wardpudoMap )
  wardpudoMap.options.markerList = pudoMap[ward].latlon[pudoDay][pudoTOD];
  wardpudoMap.options.circleOptions.color = pudoMap[ward].latlon[pudoDay].color;
  wardpudoMap.options.circleOptions.fillColor = pudoMap[ward].latlon[pudoDay].fillColor;
  console.log("wardpudoMap after: ", wardpudoMap )


  d3.select("#pudo_cotmap")
    .selectAll(".leaflet-interactive")
    .classed("pudomapMarkerOff", true);
  wardpudoMap.addCircle();
}


// -----------------------------------------------------------------------------
const loadData = function(cb) {
  if (!ptcFraction[ward]) {
    d3.json(`/resources/data/fig4a_dummy_tripfraction_${ward}.json`, function(err, todfile) {
      ptcFraction[ward] = todfile;
      cb();
    });
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
  console.log("uiHandler: ", event)
  console.log("event.target.id: ", event.target.id)
  console.log("uiHandler valu: ", event.target.value)

  if (event.target.id === "ward-menu") {
    ward = event.target.value; // w22
    updateTitles();
    loadData(() => {
      showFractionLine();
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
    settingsFractionLine.y.label = i18next.t("y_label", {ns: "ward_towline"}),
    settingsFractionLine.x.label = i18next.t("x_label", {ns: "ward_towline"}),
    settingsFractionLine.tableTitle = i18next.t("tabletitle", {ns: "ward_towline"}),
    d3.queue()
    .defer(d3.json, "/resources/data/fig4a_tripfraction.json") // trip fraction for city
      .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w1.json") // trip fraction for ward 1
      // .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w1.json") // pudo map ward 1
      .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w1_wip.json") // pudo map ward 1
      .await(function(error, ptcfractionfile, ptcfractionward, pudomapfile) {
        // Load data files into objects
        ptcFraction[ward] = getWard(ptcfractionfile);   // ptcfractionward;
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
