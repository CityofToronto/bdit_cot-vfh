// The main javascript file for bdit_cot-vfh.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

$(function () {
  if (window['CotApp']) { //the code in this 'if' block should be deleted for embedded apps
    const app = new CotApp("bdit_cot-vfh",{
      hasContentTop: false,
      hasContentBottom: false,
      hasContentRight: false,
      hasContentLeft: false,
      searchcontext: 'INTER'
    });

    // COMMENT OUT WHEN NOT ON CITY NETWORK
    // app.setBreadcrumb([
    //   {"name": "bdit_cot-vfh", "link": "#"}
    // ]).render();
  }
  let container = $('#bdit_cot-vfh_container');

});


// -----------------------------------------------------------------------------
// settings
// let settingsTPDline;

// data objects
const ptcFraction = {}; //PTC Trip Fraction by ward
const pudoMap = {}; //PUDO map by ward

// data selectors
const tpd = "tpd"; // trips per day
const tpdAM = "tpdAM"; // trips per day AM
const tow = "tow"; // time of week
const ward = 1;

// -----------------------------------------------------------------------------
// Chart SVGs

// Fig 4a - Trip Fraction line chart


// -----------------------------------------------------------------------------
// Tooltip divs


// -----------------------------------------------------------------------------
// Page texts
function pageTexts() {
  // Intro texts
  d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
  d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));
}

// -----------------------------------------------------------------------------
// Charts



$(document).ready(function(){
  // -----------------------------------------------------------------------------
  // Initial page load
  i18n.load(["/resources/i18n"], () => {
    d3.queue()
      .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig4a_dummy_tripfraction_w22.json") // trip fraction for ward 22
      .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig4b_dummy_pudoMap_w22.json") // pudo map ward 22
      .await(function(error,ptcfractionfile, pudomapfile) {
        // Load data files into objects
        ptcFraction[ward] = ptcfractionfile;
        pudoMap[ward] = pudomapfile;

        // Display texts
        pageTexts();
    });
  })
})
