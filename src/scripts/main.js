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
const tpd = "tpd"; // trips per day
const tpdAM = "tpdAM"; // trips per day AM
const tow = "tow"; // time of week
const ward = 1;

// Chart names
let fractionLineChart;

// Tooltip div names
let divHoverLine;

// -----------------------------------------------------------------------------


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
  d3.select("#ward-menu").node()[0].text = i18next.t("w22", {ns: "wards"});
  d3.select("#ward-menu").node()[1].text = i18next.t("w1", {ns: "wards"});
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
  createOverlay(fractionLine, ptcFraction[ward], (d) => {
    hoverlineTip(settingsFractionLine, divHoverLine, d);
    const idx = d.ward[2];
    const hr = d.ward[0];
    const friNoon = 108;
    // if (hr >= 7 && hr <= 9) {
    //   if (idx < friNoon) {
    //     // weekday AM peak
    //   }
    // } else if (hr >= 19 && hr <= 23) {
    //   if (idx >= 115 & idx < 144) {
    //   }
    // } else {
    // }
  }, () => {
    divHoverLine.style("opacity", 0);
  });
}
// Fig 4b - PUDO map
function showWardPUDOMap() {
  console.log("pudoMap[ward]: ", pudoMap[ward].latlon)
  pudoMapSettings = $.extend({
    markerList:  pudoMap[ward].latlon
  }, pudoMapSettings || {});

  var wardpudoMap = new cot_map("cotmap", pudoMapSettings);
  console.log("wardpudoMap: ", wardpudoMap )
  wardpudoMap.render();
  wardpudoMap.addCircle();

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
    d3.queue()
      .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w22.json") // trip fraction for ward 22
      .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w22.json") // pudo map ward 22
      .await(function(error, ptcfractionfile, pudomapfile) {
        // Load data files into objects
        ptcFraction[ward] = ptcfractionfile;
        pudoMap[ward] = pudomapfile;

        // Display texts
        pageTexts();

        // Line Charts
        showFractionLine();
        showWardPUDOMap();
      });
  })
})
