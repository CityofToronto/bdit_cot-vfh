vktMapSett = {
  alt:"VKT map",
  margin: {
    top: 0,
    right: 40,
    bottom: 0,
    left: 60
  },
  aspectRatio: 16 / 9,
  rot: 16.7,
  width: 900,
  z: {
    getDataPoints: function(d) {
      return d.prop;
    },
    getId: function(d) {
      return `id${d.properties.area_s_cd}`;
    }
  },
  colour: {
    name: d3.interpolateYlOrRd,
    null:  "#837a7a"
  },
  legend: {
    maplegend: true,
    alt: "VKT map legend",
    title: "Percentage of Traffic (%)",
    cells: 9,
    trans: [530, 270],
    orient: "horizontal",
    labelAlign: "middle"
  },
  datatable: true,
  attachedToSvg: true,
  cutoff: 10,
  summaryId: "vkt-dt-tbl",
  tableTitle: i18next.t("tabletitle", {ns: "vkt_map"}),
  _selfFormatter: i18n.getNumberFormatter(1),
  formatNum: function(...args) {
    return this._selfFormatter.format(args);
  },
  x: {
    label: i18next.t("x_label", {ns: "vkt_map"}), // "Neighbourhood"
  },
  y: {
    label: i18next.t("y_label", {ns: "vkt_map"}), // "Percentage of Traffic (%)"
  },
  pair: {
    getValues: function(d) { // used for data table ONLY
      // d = { area_s_cd: 77, prop: 7.88722624681311 }
      let n = Object.values(d)[0];
      let val = d3.format("(.1f")(Object.values(d)[1]);
      return [i18next.t(n, {ns: "nhoods"}), val];
    }
  }
}

// -----------------------------------------------------------------------------
pudoMapSett = {
  initZoom: 12,
  ward: {
    paint:{
      "line-color": "#175689",
      "line-width": 2
    }
  },
  nn: {
    paint:{
      "line-color": "#175689",
      "line-width": 1,
      "line-dasharray": [2, 2]
    }
  },
  nnLayerColour: "#8d8d8d",
  pudoRanges: {
    puMin: {colour: "#b2abd2", range: 0.45},
    puMid: {colour: "#f7f7f7", range: 0.55},
    puMax: {colour: "#fdb863"}
  },
  circleStyle: {
    "stroke": "#000",
    "pu": {fill: "#e66101", text: "#000", count: "{pcounts}"},
    "do": {fill: "#5e3c99", text: "#fff", count: "{dcounts}"},
    "pudo": { text: "#000",
      count: ["number-format",["+", ["get", "pcounts"], ["get", "dcounts"]], {}]
    }
  },
  clusterStyle: {
    "pu": {cluster: ["+", ["get", "pcounts"]]},
    "do": {cluster: ["+", ["get", "dcounts"]]}
  },
  hbFocus: {
    "xy": [-79.605800, 43.728970],
    "zoom": 15
  },
  w1Focus:  {
    "xy": [-79.575107, 43.728635],
    "zoom": 12
  },
  w10Focus: {
    "xy": [-79.403219, 43.64072],
    "zoom": 13
  },
  attachedToSvg: false,
  summaryId: "pudomap-chrt-dt-tbl",
  labelFor:"day",
  submenuLabel: "mapsubmenu-label",
  labelFor: "this-map",
  menuLabel: i18next.t("menuDayLabel", {ns: "pudoMap"}),
  menuId: "day-submenu",
  actionId: "pudo-action",
  menuData: [{val:"mon", text: "Monday"}, {val:"tues", text: "Tuesday"},
            {val:"wed", text: "Wednesday"}, {val:"thurs", text: "Thursday"},
            {val:"fri", text: "Friday"}, {val:"sat", text: "Saturday"},
            {val:"sun", text: "Sunday"}],
  x: {
    label: i18next.t("x_label", {ns: "pudoMap"}), // "Time of day"
  },
  y: {
    label: i18next.t("x_label", {ns: "pudoMap"}), // "Time of day"
  },
  tableTitle: i18next.t("tabletitle", {ns: "pudoMap"})
};
