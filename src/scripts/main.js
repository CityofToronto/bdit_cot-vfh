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

    app.setBreadcrumb([
      {"name": "bdit_cot-vfh", "link": "#"}
    ]).render();
  }
  let container = $('#bdit_cot-vfh_container');
});


// -----------------------------------------------------------------------------
// settings
// let settingsTPDline;

// data objects
const ptcData = {};
const ptcMap = {}; //PUDO map by ward
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

// -----------------------------------------------------------------------------
// Charts




// -----------------------------------------------------------------------------
// Initial page load
// i18n.load(["/resources/i18n"], () => {
//   settingsTPDline.x.label = i18next.t("x_label", {ns: "line"}),
//   settingsTPDline.y.label = i18next.t("y_label", {ns: "line"}),
//   settingsTOWline.y.label = i18next.t("y_label", {ns: "towline"}),
//   settingsFractionLine.y.label = i18next.t("y_label", {ns: "ward_towline"}),
//   d3.queue()
//       .defer(d3.json, "/resources/data/fig1_dailytrips_city.json") // trips per day
//       .defer(d3.json, "/resources/data/fig2_dummy_ptc_AM_downtown.json") // time of day ts
//       .defer(d3.json, "/resources/data/fig3_tow_profile_city.json") // time of week ts
//       .defer(d3.json, "/resources/data/fig4a_dummy_tripfraction_w22.json") // wardtowfile
//       .defer(d3.json, "/resources/data/fig4b_ptc_map_w1.json") // ptc choropleth for ward 1
//       .defer(d3.json, "/resources/data/fig4b_dummy_pudoMap_w22.json") // pudo map ward 22
//       .await(function(error, tpdfile, tpdAMfile, towfile, ptcfractionfile ,ptcmapfile, pudomapfile) {
 
//         console.log("&&&&&& ptcfractionfile: ", ptcfractionfile)


//       });
// })

$(document).ready(function(){
  console.log("------------------------------------------------------")
  console.log("container h before ready: ", $("#cotmap").height())
  console.log("READY")
  console.log("container h after ready: ", $("#cotmap").height())
})
