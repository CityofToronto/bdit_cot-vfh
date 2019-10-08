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
  function pageTexts() {
    d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
    d3.select("#subtitle1").text(i18next.t("subtitle1", {ns: "indexhtml"}));
    d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));
    d3.select("#DVpara").html(i18next.t("DVpara", {ns: "indexhtml"}));
    d3.select("#reportButton").html(i18next.t("fullreport", {ns: "indexhtml"}));
    d3.select("#appendixA").html(i18next.t("appendixA", {ns: "indexhtml"}));
    d3.select("#appendixB").html(i18next.t("appendixB", {ns: "indexhtml"}));

    d3.select("#subtitle2").text(i18next.t("subtitle2", {ns: "indexhtml"}));



    d3.select("#Q1").html(i18next.t("Q1", {ns: "indexhtml"}));
    d3.select("#Q2").html(i18next.t("Q2", {ns: "indexhtml"}));
    d3.select("#Q3").html(i18next.t("Q3", {ns: "indexhtml"}));
  }

  // -----------------------------------------------------------------------------
  // Initial page load
  i18n.load(["i18n"], () => {
    // settingsScatter.x.label = i18next.t("x_label", {ns: "scatter"})
    d3.queue()
        .defer(d3.json, "data/fig1_dailytrips_city.json") // ptcfile
        .await(function(error, fig1_file) {

          pageTexts();
    
        });
  });
}); // function()
