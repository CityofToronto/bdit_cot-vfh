export default {
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
    translateXY: [-380, 45]
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
    ticks: 2
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
