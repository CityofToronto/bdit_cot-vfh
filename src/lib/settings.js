// -----------------------------------------------------------------------------
// Fig 1 - Avg daily trips lineChart
settTpdLine = {
  alt: i18next.t("alt", {ns: "line"}),
  margin: {
    top: 20,
    right: 10,
    bottom: 80,
    left: 10
  },
  aspectRatio: 12 / 9,
  datatable: false,
  filterData: function(d) {
    // [
    //   {
    //      id: "city",
    //      values: (31) [
    //        { year: "2016-09", value: 62242 },
    //        ...,
    //        { year: "2019-03", value: 175803 }
    //      ]
    //   }
    // ]
    const root = d.tpd;
    const keys = this.z.getKeys(root);
    return keys.map(function(key) {
      return {
        id: key,
        values: root[key].map(function(value, index) {
          return {
            date: root.keys.values[index],
            value: value
          };
        })
      };
    });
  },
  x: {
    label: i18next.t("x_label", {ns: "line"}),
    getValue: function(d) {
      return new Date(d.date + "-01");
    },
    getText: function(d) {
      return d.date;
    },
    ticks: 6,
    translateXY: [-380, 65],
    // from extend
    getDomain: function(flatData) {
      return d3.extent(flatData, this.x.getValue.bind(this));
    },
    getRange: function() {
      return [0, this.innerWidth];
    }
  },
  y: {
    label: i18next.t("y_label", {ns: "line"}),
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return Math.round(d.value);
    },
    translateXY: [-95, 250],
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
    getClass: function(...args) {
      return this.z.getId.apply(this, args);
    },
    getDataPoints: function(d) {
      return d.values;
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "districts"});
    }
  },
  width: 900
};

// -----------------------------------------------------------------------------
// Fig 2 - Trips/hour over Time Of Week lineChart
settingsTOWline = {
  alt: i18next.t("alt", {ns: "towline"}),
  margin: {
    top: 5,
    right: 30,
    bottom: 20,
    left: 125
  },
  aspectRatio: 16 / 3,
  datatable: false,
  filterData: function(d) {
    const root = d.tow;
    const keys = this.z.getKeys(root);
    const skip = 6; // number of hours to skip in 24h; for x-axis ticks
    let xtickIdx = root.keys.values.map((q) => {
      if (q * skip <= 162) return q * skip;
    });
    xtickIdx = xtickIdx.filter((q)=> {
      return q != undefined;
    });
    return keys.map(function(key) {
      return {
        id: key,
        xtickIdx: xtickIdx,
        values: root[key].map(function(value, index) {
          return {
            year: root.keys.values[index],
            value: value
          };
        })
      };
    });
  },
  x: {
    // label: i18next.t("x_label", {ns: "towline"}),
    type: "linear",
    getValue: function(d) {
      // return new Date(d.year + "-01");
      return d.year;
    },
    getText: function(d) {
      return d.year;
    },
    // ticks: 28,
    getTickText: function(val) {
      const modVal = val % 24;
      return modVal;
    },
    translateXY: [-380, 45],
    // from extend
    getDomain: function(flatData) {
      return d3.extent(flatData, this.x.getValue.bind(this));
    },
    getRange: function() {
      return [0, this.innerWidth];
    }
  },

  y: {
    label: i18next.t("y_label", {ns: "towline"}),
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return Math.round(d.value);
    },
    translateXY: [-72, 95],
    ticks: 2,
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
    label: i18next.t("z_label", {ns: "towline"}),
    getId: function(d) {
      return d.id;
    },
    getKeys: function(d) {
      const keys = Object.keys(d);
      keys.splice(keys.indexOf("keys"), 1);
      return keys;
    },
    getxtickIdx: function(filteredData) {
      return filteredData.map((d) => {
        return d.xtickIdx;
      })[0];
    },
    getClass: function(...args) {
      return this.z.getId.apply(this, args);
    },
    getDataPoints: function(d) {
      return d.values;
    },
    getText: function(d) {
      return i18next.t(d.id, {ns: "towline"});
    }
  },
  width: 900
};
// -----------------------------------------------------------------------------
// Fig 4a - Trips fraction over Time Of Week lineChart
settPudoLine = {
  alt: i18next.t("alt", {ns: "towline"}),
  margin: {
    top: 85,
    right: 55,
    bottom: 73,
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
      if (d < 24) dow = "Monday"
      else if (d < 48) dow = "Tuesday"
      else if (d < 72) dow = "Wednesday"
      else if (d < 96) dow = "Thursday"
      else if (d < 120) dow = "Friday"
      else if (d < 144) dow = "Saturday"
      else dow = "Sunday"
      return `${dow} ${d % 24}:00`;
    },
    getSubText: function(data, day) { // used for data table ONLY
      // d is a number from 0 to 167
      var flatout = [];

      data.map(function(d, i) { // array of length 168
        if (day == "mon") {
          if (d.tod < 24) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        } else if (day == "tues") {
          if (d.tod > 23 & d.tod < 48) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        } else if (day == "wed") {
          if (d.tod > 47 & d.tod < 72) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        } else if (day == "thurs") {
          if (d.tod > 71 & d.tod < 96) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        } else if (day == "fri") {
          if (d.tod > 95 & d.tod < 120) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        } else if (day == "sat") {
          if (d.tod > 119 & d.tod < 144) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        } else if (day == "sun") {
          if (d.tod > 143) {
            flatout.push([`${d.tod % 24}:00`, d.value]);
          }
        }
      })
      return flatout;
    },
    // ticks: 28,
    getTickText: function(val) {
      const modVal = val % 24;
      return modVal;
    },
    translateXY: [-380, 45]
  },

  y: {
    label: i18next.t("y_label", {ns: "ward_towline"}), // "Trip fraction (%)"
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return Math.round(d.value);
    },
    translateXY: [-72, 260],
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
    getClass: function(...args) {
      return this.z.getId.apply(this, args);
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
  menuId: "fraction-submenu",
  actionId: "fraction-action",
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
