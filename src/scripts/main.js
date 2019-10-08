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
  // Initial page load
  i18n.load(["i18n"], () => {
    // settingsScatter.x.label = i18next.t("x_label", {ns: "scatter"})
    d3.queue()
        .defer(d3.json, "data/fig1_dailytrips_city.json") // ptcfile
        .await(function(error, fig1_file) {
    
        });
  });
}); // function()
