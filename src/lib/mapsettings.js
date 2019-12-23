// -----------------------------------------------------------------------------
// Fig 4b - PUDO map by wards

pudoMapSettings = {
  initZoom: 15,
  wardLayerColour: "#000",
  circleStyle: {
    "pu": {
      fill: "#3BB3C3", stroke: "#000", text: "#000",
      count: "{pcounts}"
    },
    "do": {
      fill: "#660c2c", stroke: "#808080", text: "#fff",
      count: "{dcounts}"
    },
    "pudo": {
      fill: "#808080", stroke: "#747474", text: "#000",
      count: ["number-format",["+", ["get", "pcounts"], ["get", "dcounts"]], {}]
    }
  },
  clusterStyle: {
    "pu": {
      fillMin: "#3BB3C3", fillMid: "#3BB3C3", fillMax: "#3BB3C3",
      cluster: ["+", ["get", "pcounts"]]
    },
    "do": {
      fillMin: "#660c2c", fillMid: "#660c2c", fillMax: "#660c2c",
      cluster: ["+", ["get", "dcounts"]]
    },
    "pudo": {
      fillMin: "#808080", fillMid: "#808080", fillMax: "#808080",
      cluster: ["+", ["+", ["get", "pcounts"], ["get", "dcounts"]]]
    }
  },
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
  actionId: "mapday-action",
  x: {
    label: i18next.t("x_label", {ns: "pudoMap"}), // "Time of day"
  },
  y: {
    label: i18next.t("x_label", {ns: "pudoMap"}), // "Time of day"
  },
  tableTitle: i18next.t("tabletitle", {ns: "pudoMap"})
};

// Possible mapTypes:
// Topographic, Streets, NationalGeographic, Oceans, Gray, DarkGray, Imagery, ImageryClarity, ShadedRelief


// stroke #747474 passes with pu outline
// fill #808080  passes with do fill
