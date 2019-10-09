export default {
  alt: i18next.t("alt", {ns: "line"}),
  margin: {
    top: 20,
    right: 10,
    bottom: 80,
    left: 125
  },
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
    translateXY: [-380, 65]
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
    ticks: 5
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
