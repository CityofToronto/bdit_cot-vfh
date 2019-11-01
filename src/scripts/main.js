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
const ptcFraction = {}; //PTC Trip Fraction by ward
const pudoMap = {}; //PUDO map by ward

// data selectors
const tpd = "tpd"; // trips per day
const tpdAM = "tpdAM"; // trips per day AM
const tow = "tow"; // time of week
const ward = 1;

$(document).ready(function(){
  console.log("doc ready")
  // -----------------------------------------------------------------------------
  // Initial page load
  i18n.load(["/resources/i18n"], () => {
    settingsFractionLine.y.label = i18next.t("y_label", {ns: "ward_towline"}),
    d3.queue()
      .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w22.json") // trip fraction for ward 22
      .await(function(error,ptcfractionfile) {
        // Load data files into objects
        ptcFraction[ward] = ptcfractionfile;
        console.log(ptcFraction)
      });
  })
})
