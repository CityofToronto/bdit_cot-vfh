// -----------------------------------------------------------------------------
// Fig 4b - PUDO map by wards
pudoMapSettings = {
  // mapHeight: 1200,
  mapType: 'Gray',
  markerList: [[43.66, -79.373903], [43.706773, -79.398429]],
  circleOptions: {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 500
  },
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
  }
};
