// -----------------------------------------------------------------------------
globalFns = {
  getLims: function(...args) {
    var thisDay = args[0];

   var lims = [];
    if (thisDay === "mon") lims = [0, 24];
    else if (thisDay === "tues") lims = [24, 48];
    else if (thisDay === "wed") lims = [48, 72];
    else if (thisDay === "thurs") lims = [72, 96];
    else if (thisDay === "fri") lims = [96, 120];
    else if (thisDay === "sat") lims = [120, 144];
    else lims = [144, 168];
    return lims;
  }
};

// Fig 1 - Avg daily trips lineChart
settTpdLine = {
  alt: i18next.t("alt", {ns: "line"}),
  margin: {
    top: 30,
    right: 178,
    bottom: 80,
    left: 178
  },
  aspectRatio: 16 / 9,
  datatable: false,
  filterData: function(d) {
    const root = d.tpd;
    const keys = this.z.getKeys(root);
    return keys.map(function(key) {
      return {
        id: key,
        values: root[key].map(function(value, index) {
          if (value) {
            return {
              date: root.keys.values[index],
              value: value
            };
          }
        })
      };
    });
  },
  tableData: function(data) {
    const arr = [].concat.apply([], data.map(function(d) {
      return d.values;
    }));
    console.log("tableData return: ", arr)
    return arr;
  },
  x: {
    label: i18next.t("x_label", {ns: "tpd"}), // "Month",
    getValue: function(d) {
      if (d) return new Date(d.date + "-01");
    },
    getText: function(d) {
      if (d) return d.date;
    },
    ticks: 6,
    translateXY: [0, 40],
    // from extend
    getDomain: function(flatData) {
      return d3.extent(flatData, this.x.getValue.bind(this));
    },
    getRange: function() {
      return [0, this.innerWidth];
    },
    getTickText: function(val) {
      const yr = new Intl.DateTimeFormat('en', { year: '2-digit' }).format(val);
      const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(val);
      return `${mo}-${yr}`;
    }
  },
  y: {
    label: i18next.t("y_label", {ns: "tpd"}), // "Average trips/day"
    getValue: function(d) {
      if (d) return d.value;
    },
    getText: function(d) {
      return d3.format("(,.0f")(d.value);
    },
    translateXY: [-65, 248],
    ticks: 5,
    // from extend
    getDomain: function(flatData) {
      var min = d3.min(flatData, this.y.getValue.bind(this));
      return [
        min > 0 ? 0 : min,
        d3.max(flatData, this.y.getValue.bind(this))
      ];
    }
  },
  z: {
    label: i18next.t("z_label", {ns: "line"}),
    getId: function(d) {
      return d.id;
    },
    getKeys: function(d) {
      const keys = Object.keys(d);
      keys.splice(keys.indexOf("keys"), 1);
      return keys;
    },
    getTableKeys: function(d) {
      const th = Object.keys(d[0].values[0]);
      return [i18next.t(th[0], {ns: "tpd"}), i18next.t(th[1], {ns: "tpd"})];
    },
    getLegendKeys: function(d) {
      const keys = Object.keys(d.tpd).splice(1);
      return [i18next.t(keys[0], {ns: "tpd"}), i18next.t(keys[1], {ns: "tpd"})];
    },
    getClass: function(...args) {
      return this.z.getId.apply(this, args);
    },
    getDataPoints: function(d) {
      return d.values;
    },
    getNotNullDataPoints: function(d) { // for overlay
      return d.values.filter((x) => {
        if (x) return x;
      });
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "districts"});
    },
    getPair: function(data) {
      const arr = [].concat.apply([], data.map(function(d) {
        return d.values;
      }));

      let flatout = [];
      const studyDate =  new Date("2019", "02"); // Jan is 0      
      arr.map(function(d) {
        if (d) {
          let th = (new Date(Object.values(d)[0]) > studyDate) ?
            `${Object.values(d)[0]} (post-study period)` : Object.values(d)[0];
          let td = d3.format("(,")(Object.values(d)[1]);
          flatout.push([th, td]);
        }
      })
      return flatout;
    }
  },
  showLabels: false,
  width: 850,
  tooltip: {
    pageX: 400,
    pageY: 450,
    units: "trips/day",
    width: 135,
    height: 30,
    shiftX: 12,
    shiftY: 35,
    textdy: 5
  },
  legend: {
    x: [530, 568],
    y: 350,
    dy: 20,
    textdelta: [10, 3]
  },
  datatable: true,
  summaryId: "tpd-dt-tbl",
  attachedToSvg: true,
  pair: {
    getValues: function(d) { // used for data table ONLY
      // d = { date: "2016-09", value: 62242 }
      const studyDate =  new Date("2019", "02"); // Jan is 0
      let th = (new Date(Object.values(d)[0]) > studyDate) ?
        `${Object.values(d)[0]} (post-study period)` : Object.values(d)[0];
      let td = d3.format("(,")(Object.values(d)[1]);
      return [th, td];
    }
  }
};

// -----------------------------------------------------------------------------
// Fig 4 - Trip counts city time-of-day lineChart
settCityTodLine = {
  alt: i18next.t("alt", {ns: "towline"}),
  margin: {
    top: 60,
    right: 185,
    bottom: 73,
    left: 120
  },
  aspectRatio: 16 / 6,
  _selfFormatter: i18n.getNumberFormatter(0),
  formatNum: function(...args) {
    return this._selfFormatter.format(args);
  },
  filterData: function(d) {
    const keys = this.z.getId(d); // this.z.getKeys(d);
    const skip = 6; // number of hours to skip in 24h; for x-axis ticks
    let xtickIdx = d.keys.values.map((q) => {
      if (q * skip <= 162) return q * skip;
    });
    xtickIdx = xtickIdx.filter((q)=> {
      return q != undefined;
    });
    return keys.map(function(key) {
      return {
        id: key,
        xtickIdx: xtickIdx,
        values: d[key].map(function(value, index) {
          return {
            tod: d.keys.values[index],
            value: value
          };
        })
      };
    });
  },
  tickSize: 4,
  x: {
    label: i18next.t("x_label", {ns: "ward_towline"}), // "Time of day"
    type: "linear",
    getValue: function(d) {
      return d.tod;
    },
    getText: function(d) { // used for data table ONLY
      let dow;
      let hr = (d.tod % 24) < 10 ? `0${d.tod % 24}` : `${d.tod % 24}`;
      if (d.tod < 24) dow = "Monday"
      else if (d.tod < 48) dow = "Tuesday"
      else if (d.tod < 72) dow = "Wednesday"
      else if (d.tod < 96) dow = "Thursday"
      else if (d.tod < 120) dow = "Friday"
      else if (d.tod < 144) dow = "Saturday"
      else dow = "Sunday"
      return `${dow} ${hr}:00`;
    },
    // ticks: 28,
    getTickText: function(val) {
      const modVal = val % 24;
      return modVal;
    },
    translateXY: [0, 0],
    chartlabel: 27
  },
  y: {
    label: i18next.t("y_label", {ns: "city_tod"}),
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return d3.format("(,.0f")(d.value);
    },
    translateXY: [-50, 111],
    ticks: 4
  },
  z: {
    label: i18next.t("z_label", {ns: "city_tod"}),
    getId: function(d) {
      // { id: "fraction", xtickIdx: (28) [0, 6, 12, …, 162],
      //   values: (168) [{ tod: 0, value: 0.28592435 }, …, { tod: 99, value: 0.10722163 }]
      // }
      const keys = Object.keys(d);
      keys.splice(keys.indexOf("keys"), 1);
      return keys;
    },
    getKeys: function(d) {
      // {"keys": { {"name": "tod", "values": [0,1,2,...,167]}},
      // "count": []}
      // }
      const col1 = d.keys.name; // "tod"
      const col2 = Object.keys(d)[1]; // "count"
      return [i18next.t(col1, {ns: "ward_towline"}),
              i18next.t(col2, {ns: "city_tod"})];
    },
    getxtickIdx: function(filteredData) {
      return filteredData.map((d) => {
        return d.xtickIdx;
      })[0];
    },
    getDataPoints: function(d) {
      return d.values;
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "towline"});
    },
    getPair: function(o) {
      var flatData = [].concat.apply(
      [], o.map(function(d) {
        return d.values;
      }));

      var pairs = [];
      flatData.filter(function(d) {
        if (d.tod >= selCityLims[0] && d.tod < selCityLims[1]) {
          var col1 = (d.tod % 24) < 10 ? `0${d.tod % 24}:00` : `${d.tod % 24}:00`;
          pairs.push([col1, d3.format("(,.0f")(d.value)]);
        }
      });
      return pairs;
    }
  },
  extraXlabelX: {"Mon": 39, "Tues": 97, "Wed": 154, "Thurs": 214, "Fri": 262, "Sat": 321, "Sun": 379},
  extraXlabelY: 40,
  initHoverLine: {
    coords: [35.73652694610779, 35.73652694610779, -20, 292],
    indices: [7, 7] // hr, index
  },
  tipTextCoords: [30, -50],
  initTipPosn: [180, 0],
  width: 700,
  tooltip: {
    r: 4,
    pageX: 400,
    pageY: 450,
    units: "trips/hour",
    width: 110,
    height: 25,
    shiftX: 12,
    shiftY: -60,
    textdy: 5
  },
  datatable: true,
  attachedToSvg: true,
  summaryId: "chrt-dt-tbl-citytod",
  labelFor:"day-city",
  menuLabel: i18next.t("menuLabel", {ns: "ward_towline"}),
  menuId: "submenu-citytod",
  actionId: "action-citytod",
  closeId: "close-citytod",
  menuData: [{val:"mon", text: "Monday"}, {val:"tues", text: "Tuesday"},
            {val:"wed", text: "Wednesday"}, {val:"thurs", text: "Thursday"},
            {val:"fri", text: "Friday"}, {val:"sat", text: "Saturday"},
            {val:"sun", text: "Sunday"}]
};
// extend with default settings that were in original line.js
settCityTodLine.x = $.extend({
  getDomain: function(flatData) {
    return d3.extent(flatData, this.x.getValue.bind(this));
  },
  getRange: function() {
    return [0, this.innerWidth];
  }
}, settCityTodLine.x || {});
settCityTodLine.y = $.extend({
  getDomain: function(flatData) {
    var min = d3.min(flatData, this.y.getValue.bind(this));
    return [
      min > 0 ? 0 : min,
      d3.max(flatData, this.y.getValue.bind(this))
    ];
  }
}, settCityTodLine.y || {});


// -----------------------------------------------------------------------------
// Fig 5a - Trips counts over Time Of Week lineChart
settPudoLine = {
  alt: i18next.t("alt", {ns: "towline"}),
  margin: {
    top: 85,
    right: 55,
    bottom: 120,
    left: 100
  },
  aspectRatio: 16 / 8,
  _selfFormatter: i18n.getNumberFormatter(0),
  formatNum: function(...args) {
    return this._selfFormatter.format(args);
  },
  filterData: function(d) {
    const keys = this.z.getId(d); // this.z.getKeys(d);
    const skip = 6; // number of hours to skip in 24h; for x-axis ticks
    let xtickIdx = d.keys.values.map((q) => {
      if (q * skip <= 162) return q * skip;
    });
    xtickIdx = xtickIdx.filter((q)=> {
      return q != undefined;
    });
    return keys.map(function(key) {
      return {
        id: key,
        xtickIdx: xtickIdx,
        values: d[key].map(function(value, index) {
          return {
            tod: d.keys.values[index],
            value: value
          };
        })
      };
    });
  },
  x: {
    label: i18next.t("x_label", {ns: "ward_towline"}), // "Time of day"
    type: "linear",
    getValue: function(d) {
      return d.tod;
    },
    getText: function(d) { // used for data table ONLY
      // d is a number from 0 to 167
      let dow;
      let hr = (d % 24) < 10 ? `0${d % 24}` : `${d % 24}`;
      if (d < 24) dow = "Monday"
      else if (d < 48) dow = "Tuesday"
      else if (d < 72) dow = "Wednesday"
      else if (d < 96) dow = "Thursday"
      else if (d < 120) dow = "Friday"
      else if (d < 144) dow = "Saturday"
      else dow = "Sunday"
      return `${dow} ${hr}:00`;
    },    
    // ticks: 28,
    getTickText: function(val) {
      const modVal = val % 24;
      return modVal;
    },
    translateXY: [0, 0],
    chartlabel: 48
  },

  y: {
    label: i18next.t("y_label", {ns: "ward_towline"}), // "Trip fraction (%)"
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return Math.round(d.value);
    },
    translateXY: [-70, 220],
    ticks: 4
  },

  z: {
    label: i18next.t("z_label", {ns: "towline"}),
    getId: function(d) {
      // { id: "fraction", xtickIdx: (28) [0, 6, 12, …, 162],
      //   values: (168) [{ tod: 0, value: 0.28592435 }, …, { tod: 99, value: 0.10722163 }]
      // }
      const keys = Object.keys(d); // [ "fraction" ]
      keys.splice(keys.indexOf("keys"), 1); // [ "fraction" ]
      return keys;
    },
    getKeys: function(d) {
      // {"fraction": [0.28592435, 0.23656836, 0.17870272, …],
      // "keys":  { name: "tod", values: (168) [0, 1, …, 167] }
      // }
      const col1 = d.keys.name;
      const col2 = `${i18next.t(whichPUDO, {ns: "pudo"})}`; // Object.keys(d)[1];
      return [i18next.t(col1, {ns: "ward_towline"}), i18next.t(col2, {ns: "ward_towline"})];
    },
    getxtickIdx: function(filteredData) {
      return filteredData.map((d) => {
        return d.xtickIdx;
      })[0];
    },
    getDataPoints: function(d) {
      return d.values;
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "towline"});
    },
    reduceData: function(o) {
      if (Object.keys(o).length > 2) {
        let thisKey;
        thisPTC = Object.keys(o).reduce((object, key) => {
          if (key === "keys" || key === whichPUDO) {
            thisKey = key === "keys" ? key : "fraction";
            object[thisKey] = o[key]
          }
          return object
        }, {});
        return thisPTC;
      } else return o;
    },
    getPair: function(o) {
      var flatData = [].concat.apply(
      [], o.map(function(d) {
        return d.values;
      }));

      var pairs = [];
      flatData.filter(function(d) {
        if (d.tod >= selPudoLims[0] && d.tod < selPudoLims[1]) {
          var col1 = (d.tod % 24) < 10 ? `0${d.tod % 24}:00` : `${d.tod % 24}:00`;
          pairs.push([col1, d3.format("(,.0f")(d.value)]);
        }
      });
      return pairs;     
    }
  },
  extraXlabelX: {"Mon": 75, "Tues": 180, "Wed": 288, "Thurs": 400, "Fri": 492, "Sat": 602, "Sun": 711},
  extraXlabelY:72,
  initHoverLine: {
    coords: [35.73652694610779, 35.73652694610779, -20, 292],
    indices: [7, 7] // hr, index
  },
  tipTextCoords: [30, -50],
  initTipPosn: [180, 0],
  width: 900,
  datatable: true,
  attachedToSvg: true,
  summaryId: "chrt-dt-tbl",
  labelFor:"day",
  menuLabel: i18next.t("menuLabel", {ns: "ward_towline"}),
  menuId: "submenu-fraction",
  actionId: "action-fraction",
  closeId: "close-fraction",
  menuData: [{val:"mon", text: "Monday"}, {val:"tues", text: "Tuesday"},
            {val:"wed", text: "Wednesday"}, {val:"thurs", text: "Thursday"},
            {val:"fri", text: "Friday"}, {val:"sat", text: "Saturday"},
            {val:"sun", text: "Sunday"}]
};
// extend with default settings that were in original line.js
settPudoLine.x = $.extend({
  getDomain: function(flatData) {
    return d3.extent(flatData, this.x.getValue.bind(this));
  },
  getRange: function() {
    return [0, this.innerWidth];
  }
}, settPudoLine.x || {});
settPudoLine.y = $.extend({
  getDomain: function(flatData) {
    var min = d3.min(flatData, this.y.getValue.bind(this));
    return [
      min > 0 ? 0 : min,
      d3.max(flatData, this.y.getValue.bind(this))
    ];
  }
}, settPudoLine.y || {});
