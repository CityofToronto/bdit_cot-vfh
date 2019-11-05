// -----------------------------------------------------------------------------
// Fig 1 - Trips/day lineChart
settingsTPDline = {
  alt: i18next.t("alt", {ns: "line"}),
  margin: {
    top: 20,
    right: 10,
    bottom: 80,
    left: 125
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
          return {
            year: root.keys.values[index],
            value: value
          };
        })
      };
    });
  },
  x: {
    label: i18next.t("x_label", {ns: "line"}),
    getValue: function(d) {
      return new Date(d.year + "-01");
    },
    getText: function(d) {
      return d.year;
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
    translateXY: [-60, 95],
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
settingsFractionLine = {
  alt: i18next.t("alt", {ns: "towline"}),
  margin: {
    top: 0,
    right: 55,
    bottom: 55,
    left: 100
  },
  aspectRatio: 16 / 8,
  filterData: function(d) {
    const keys = this.z.getKeys(d);
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
    label: i18next.t("tod", {ns: "ward_towline"}),
    type: "linear",
    getValue: function(d) {
      return d.tod;
    },
    getText: function(d) { // used for data table only
      // Object { tod: 167, value: 0.46428669 }
      let dow;
      if (d.tod < 24) dow = "Monday"
      else if (d.tod < 48) dow = "Tuesday"
      else if (d.tod < 72) dow = "Wednesday"
      else if (d.tod < 96) dow = "Thursday"
      else if (d.tod < 120) dow = "Friday"
      else if (d.tod < 144) dow = "Saturday"
      else dow = "Sunday"
      return `${dow} ${d.tod % 24}h00`;
    },
    // ticks: 28,
    getTickText: function(val) {
      const modVal = val % 24;
      return modVal;
    },
    translateXY: [-380, 45]
  },

  y: {
    label: i18next.t("y_label", {ns: "ward_towline"}),
    getValue: function(d) {
      return d.value;
    },
    getText: function(d) {
      return Math.round(d.value);
    },
    translateXY: [-75, 280],
    ticks: 2
  },

  z: {
    label: i18next.t("z_label", {ns: "towline"}),
    getId: function(d) {
      // { id: "fraction", xtickIdx: (28) [0, 6, 12, …, 162],
      //   values: (168) [{ tod: 0, value: 0.28592435 }, …, { tod: 99, value: 0.10722163 }]
      // }
      return d.id;
    },
    getKeys: function(d) {
      // {"fraction": [0.28592435, 0.23656836, 0.17870272, …],
      // "keys":  { name: "tod", values: (168) [0, 1, …, 167] }
      // }
      const keys = Object.keys(d); // [ "fraction" ]
      keys.splice(keys.indexOf("keys"), 1); // [ "fraction" ]
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
  levels: ["wkdayAMpeak", "frisatNightI"], // for map colour bar rects
  width: 900,
  datatable: true,
  tableTitle: i18next.t("tabletitle", {ns: "ward_towline"})
};
// extend with default settings that were in original line.js
settingsFractionLine.x = $.extend({
  getDomain: function(flatData) {
    return d3.extent(flatData, this.x.getValue.bind(this));
  },
  getRange: function() {
    return [0, this.innerWidth];
  }
}, settingsFractionLine.x || {});
settingsFractionLine.y = $.extend({
  getDomain: function(flatData) {
    var min = d3.min(flatData, this.y.getValue.bind(this));
    return [
      min > 0 ? 0 : min,
      d3.max(flatData, this.y.getValue.bind(this))
    ];
  }
}, settingsFractionLine.y || {});
