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
    },
    getKeys: function(d) {
      const keys = Object.keys(d[0]); // ["area_s_cd", "prop"]
      return [i18next.t(keys[0], {ns: "vkt_map"}), i18next.t(keys[1], {ns: "vkt_map"})];
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
    puQ1: {colour: "#a1d76a", range: 0.20},
    puQ2: {colour: "#e6f5d0", range: 0.40},
    puQ3: {colour: "#d8b365", range: 0.60},
    puQ4: {colour: "#fde0ef", range: 0.80},
    puQ5: {colour: "#e9a3c9"}
  },
  circleStyle: {
    "stroke": "#000", "labelMin": 260, offset: [0, 1.3],
    "pu": {fill: "#8c510a", stroke:"#fff", text: "#000", count: "{pcounts}",
      radius: "pcounts"},
    "do": {fill: "#01665e", stroke:"#fff", text: "#000", count: "{dcounts}",
      radius: "dcounts"},
    "pudo": { text: "#000",
      count: ["number-format",["+", ["get", "pcounts"], ["get", "dcounts"]], {}],
      stroke: "#fff"
    }
  },
  // circleScale: {
  //   z1: {"zoom": 13, "scale": 2.1},
  //   z2: {"zoom": 14, "scale": 1.9},
  //   z3: {"zoom": 15, "scale": 1.8}
  // },
  circleScale: {
    z1: {"zoom": 13, "scale": 1},
    z2: {"zoom": 14, "scale": 1},
    z3: {"zoom": 15, "scale": 1}
  },
  clusterStyle: {
    "pu": {cluster: ["+", ["get", "pcounts"]]},
    "do": {cluster: ["+", ["get", "dcounts"]]}
  },
  humberCircle: {
    "stroke": "red"
  },
  legendMenu: {
    "pu": [
        {id: 1, text: "Pick-ups only", span:"legend-pu"}
      ],
    "do": [
        {id: 7, text: "Drop-offs only", span:"legend-do"}
      ],
    "pudo": [
        {id: 1, text: "Pick-ups only", span:"legend-pu"},
        {id: 2, text: "Pick-ups &ge; 80%", span:"legend-puQ5"},
        {id: 3, text: "Pick-ups &ge; 60%", span:"legend-puQ4"},
        {id: 4, text: "Pick-ups &ge; 40%", span:"legend-puQ3"},
        {id: 5, text: "Pick-ups &ge; 20%", span:"legend-puQ2"},
        {id: 6, text: "Pick-ups &lt; 20%", span:"legend-puQ1"},
        {id: 7, text: "Drop-offs only", span:"legend-do"}
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
  z: {
     getKeys: function(d) {
      // ["nn", "pcounts", "dcounts"] OR
      // ["nn", "pcounts"] OR
      // ["nn", "dcounts"]
      const keys = Object.keys(d[0]);
      let keyArr = [];
      for (let idx = 0; idx < keys.length; idx++) {
        keyArr.push(i18next.t(keys[idx], {ns: "pudoMap"}));
      }
      return keyArr;
    }
  },
  getTableData: function(obj) {
    let countData = obj["pudo"].features;
    let arrKey;
    let sortBy;

    if (whichPUDO === "pudo") {
      countData = countData.concat(obj["pu"].features)
                           .concat(obj["do"].features);
      sortBy = "tot";
    } else {
      countData = countData.concat(obj[whichPUDO].features);
      arrKey = whichPUDO === "pu" ? "pcounts" : "dcounts";
      sortBy = arrKey;
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
        "dcounts": dct[thisnn],
        "tot": pct[thisnn] + dct[thisnn],
        "pfraction": d3.format("(.0f")(
          pct[thisnn] / (pct[thisnn] + dct[thisnn]) * 100
        )
      };
    });

    // Reshape into array of objects [{ nn: 77, pcounts: 100, dcounts: 555 },...,{}]
    Object.keys(thisGroup).forEach((element) => {
      let row = {};
      let thisLevel;
      row["nn"] = element;
      if (whichPUDO === "pudo") {
        if (thisGroup[element]["pfraction"] === 100) thisLevel = "Pick-ups only";
        else if (thisGroup[element]["pfraction"] === 0) thisLevel = "Drop-offs only";
        else if (thisGroup[element]["pfraction"] > 55) thisLevel = "Pick-ups > 55%";
        else if (thisGroup[element]["pfraction"] < 45) thisLevel = "Pick-ups < 45%";
        else thisLevel = "Pick-ups 45–55%";
        row["tot"] = thisGroup[element]["tot"];
        row["pcounts"] = thisGroup[element]["pcounts"];
        row["dcounts"] = thisGroup[element]["dcounts"];
        row["pfraction"] = thisLevel;
      } else row[arrKey] = thisGroup[element][arrKey];
      returnGroup.push(row)
    });
    return returnGroup.sort(function(a, b) {return b[sortBy]-a[sortBy];});
  },
  pair: {
    getValues: function(d) { // used for data table ONLY
      // data = [{ nn: "nn4", pcounts: 312, dcounts: 186 }, ...,
      //      { nn: "nn1", pcounts: 0, dcounts: 80 }]
      // OR
      // [{ nn: "nn1", pcounts: 400 }, ...]
      // OR
      // [{ nn: "nn1", dcounts: 66 }, ...]
      const vals = Object.values(d);
      let valArr = [];
      valArr[0] = i18next.t(parseInt(vals[0].split("nn")[1]), {ns: "nhoods"});
      for (let idx = 1; idx < vals.length; idx++) {
        let formatVal = (typeof vals[idx] === "string") ? vals[idx] :
          d3.format("(,")(vals[idx]);
        valArr.push(formatVal);
      }
      return valArr;
    }
  }
};
