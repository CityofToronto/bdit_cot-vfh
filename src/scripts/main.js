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
});
