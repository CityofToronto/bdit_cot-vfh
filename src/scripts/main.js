// import settingsTPDline from "./settings_tpdLineChart.js";
// import settingsTOWline from "./settings_towLineChart.js";

// const settingsTPDline = {};
// The main javascript file for bdit_cot-vfh.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

$(function () {
  if (window['cot_app']) { //the code in this 'if' block should be deleted for embedded apps
    const app = new cot_app("bdit_cot-vfh",{
      hasContentTop: false,
      hasContentBottom: false,
      hasContentRight: false,
      hasContentLeft: false,
      searchcontext: 'INTRA'
    });

    app.setBreadcrumb([
      {"name": "bdit_cot-vfh", "link": "#"}
    ]).render();
  }
  let container = $('#bdit_cot-vfh_container');


  // -----------------------------------------------------------------------------
  // data objects
  const ptcData = {};

  // data selectors
  const tpd = "tpd"; // trips per day
  const tpdAM = "tpdAM"; // trips per day AM
  const tow = "tow"; // time of week

  // -----------------------------------------------------------------------------
  function pageTexts() {
    // Intro texts
    d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
    d3.select("#subtitle1").text(i18next.t("subtitle1", {ns: "indexhtml"}));
    d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));
    d3.select("#DVpara").html(i18next.t("DVpara", {ns: "indexhtml"}));
    d3.select("#reportButton").html(i18next.t("fullreport", {ns: "indexhtml"}));
    d3.select("#appendixA").html(i18next.t("appendixA", {ns: "indexhtml"}));
    d3.select("#appendixB").html(i18next.t("appendixB", {ns: "indexhtml"}));

    // Intro to Data Exploration
    d3.select("#subtitle2").text(i18next.t("subtitle2", {ns: "indexhtml"}));
    d3.select("#Q1").html(i18next.t("Q1", {ns: "indexhtml"}));
    d3.select("#Q2").html(i18next.t("Q2", {ns: "indexhtml"}));
    d3.select("#Q3").html(i18next.t("Q3", {ns: "indexhtml"}));

    // Fig 1 PTC Growth
    d3.select(".section-growth").select("#section0").text(i18next.t("section0", {ns: "indexhtml"}));
    d3.select(".section-growth").select("#section0-text1").html(i18next.t("section0-text1", {ns: "indexhtml"}));
    d3.select("#growthtsTitle").html(i18next.t("growthtsTitle", {ns: "indexhtml"}));

    // Fig 3 Time of Week
    d3.select(".section-tow").select("#section3").html(i18next.t("section3", {ns: "indexhtml"}));
    d3.select(".section-tow").select("#section3-text1").html(i18next.t("section3-text1", {ns: "indexhtml"}));
    d3.select(".dow-label#mon").html(i18next.t("mon", {ns: "dow-abbr"}));
    d3.select(".dow-label#tues").html(i18next.t("tues", {ns: "dow-abbr"}));
    d3.select(".dow-label#wed").html(i18next.t("wed", {ns: "dow-abbr"}));
    d3.select(".dow-label#thurs").html(i18next.t("thurs", {ns: "dow-abbr"}));
    d3.select(".dow-label#fri").html(i18next.t("fri", {ns: "dow-abbr"}));
    d3.select(".dow-label#sat").html(i18next.t("sat", {ns: "dow-abbr"}));
    d3.select(".dow-label#sun").html(i18next.t("sun", {ns: "dow-abbr"}));
  }

  // -----------------------------------------------------------------------------
  // Chart SVGs
  // Fig 1 - Trips Per Day line chart
  const tpdChart = d3.select(".tpd-line.data")
      .append("svg")
      .attr("id", "tpdLine");

  // Fig 3 - TOW line chart
  const towChart = d3.select(".tow.data")
      .append("svg")
      .attr("id", "towLine");

  // -----------------------------------------------------------------------------
  // Chart functions
  // Fig 1 - Trips Per Day line chart
  function showtpdLine() {
    lineChart(tpdChart, settingsTPDline, ptcData[tpd]);
    rotateLabels("tpdLine", settingsTPDline);
  }
  // Fig 3 - Time of Week line chart
  function showtowLine() {
    lineChart(towChart, settingsTOWline, ptcData[tow]);
    rotateLabels("towLine", settingsTOWline);
    // axis annotations
    d3.select("#hr")
        .text(i18next.t("hr", {ns: "towline"}));
  }

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
  // Initial page load
  i18n.load(["/webapps/bdit_cot-vfh/i18n"], () => {
    // settingsTPDline.y.label = i18next.t("y_label", {ns: "line"}),
    // settingsTPDline.x.label = i18next.t("x_label", {ns: "line"}),
    // settingsTOWline.x.label = i18next.t("x_label", {ns: "towline"}),
    // settingsTOWline.y.label = i18next.t("y_label", {ns: "towline"})
    d3.queue()
        .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig1_dailytrips_city.json") // trips per day
        .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig2_dummy_ptc_AM_downtown.json") // time of day ts
        .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig3_tow_profile_city.json") // time of week ts
        .await(function(error, tpdfile, tpdAMfile, towfile) {
          console.log(tpdfile)
          ptcData[tpd] = tpdfile;
          // ptcData[tpdAM] = tpdAMfile;
          // ptcData[tow] = towfile;
          console.log(ptcData)

          pageTexts();
          // showtpdLine();
          // showtowLine();
        });
  });
}); // function()
