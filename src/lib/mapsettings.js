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
  topTen: function(d) {
    const n = 10; // Top-n list of VKT hotspots
    let sortByProp = d
        .sort((a, b) => (a.prop < b.prop) ? 1 : -1)
        .filter((p)=> {
          if (p.area_s_cd < 141) return p;
        })
        .slice(0, n);
    return sortByProp;
  },
  summaryId: "vkt-dt-tbl",
  tableTitle: i18next.t("tabletitle", {ns: "vkt_map"}),
  x: {
    label: i18next.t("x_label", {ns: "vkt_map"}) // "Neighbourhood"
  },
  y: {
    label: i18next.t("y_label", {ns: "vkt_map"}), // "Percentage of Traffic (%)"
  },
  z: {
    getDataPoints: function(d) {
      return d.prop;
    },
    getId: function(d) {
      return `id${d.properties.area_s_cd}`;
    }
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
  legendMenu: {
    "pu": [
        {id: 1, text: "Pick-ups only", span:"legend-pu"}
      ],
    "do": [
        {id: 5, text: "Drop-offs only", span:"legend-do"}
      ],
    "pudo": [
        {id: 1, text: "Pick-ups only", span:"legend-pu"},
        {id: 2, text: "Pick-ups > 55%", span:"legend-puMax"},
        {id: 3, text: "Pick-ups 45&ndash;55%", span:"legend-puMid"},
        {id: 4, text: "Pick-ups < 45%", span:"legend-puMin"},
        {id: 5, text: "Drop-offs only", span:"legend-do"}
      ]
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
  tableTitle: i18next.t("tabletitle", {ns: "pudoMap"}),
  getTableData: function(obj) {
    let countData = obj["pudo"].features;
    let arrKey;

    if (whichPUDO === "pudo") {
      countData = countData.concat(obj["pudo"].features)
                           .concat(obj["pu"].features)
                           .concat(obj["do"].features);
    } else {
      countData = countData.concat(obj["pudo"].features)
                           .concat(obj[whichPUDO].features);
      arrKey = whichPUDO === "pu" ? "pcounts" : "dcounts";
    }

    // Extract pcounts, dcounts and nn from countData object
    let returnGroup = [];
    let thisGroup = {};
    let pct = {};
    let dct = {};
    countData.map((d, i) => {
      let thisnn = d.properties.nn;
      let thisp = d.properties.pcounts ? d.properties.pcounts : 0;
      let thisd = d.properties.dcounts ? d.properties.dcounts : 0;
      pct[thisnn] = pct[thisnn] ? pct[thisnn] + thisp: thisp;
      dct[thisnn] = dct[thisnn] ? dct[thisnn] + thisd: thisd;
      thisGroup[`nn${thisnn}`] = {
        "pcounts": pct[thisnn],
        "dcounts": dct[thisnn]
      };
    });

    // Reshape into array of objects [{ nn: 77, pcounts: 100, dcounts: 555 },...,{}]
    Object.keys(thisGroup).forEach((element) => {
      let row = {};
      row["nn"] = element;
      if (whichPUDO === "pudo") {
        row["pcounts"] = thisGroup[element]["pcounts"];
        row["dcounts"] = thisGroup[element]["dcounts"];
      } else row[arrKey] = thisGroup[element][arrKey];
      returnGroup.push(row)
    });
    return returnGroup;
  }
};
