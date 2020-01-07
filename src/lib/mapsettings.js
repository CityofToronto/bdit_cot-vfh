// -----------------------------------------------------------------------------
pudoMapSettings = {
  initZoom: 12,
  humberZoom: 15,
  wardLayerColour: "#000",
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
  humberFocus: [-79.605800, 43.728970],
  w1Focus: [-79.607443, 43.728635],
  w2Focus: [-79.548153, 43.661765],
  w3Focus: [-79.517973, 43.623204],
  w4Focus: [-79.459995, 43.654720],
  w10Focus: [-79.403219, 43.645168],
  w22Focus: [-79.304402, 43.795302],
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
