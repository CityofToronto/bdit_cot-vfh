// -----------------------------------------------------------------------------
pudoMapSett = {
  initZoom: 12,
  wardLayerColour: "#175689",
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
