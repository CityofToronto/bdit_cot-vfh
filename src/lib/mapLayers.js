// -----------------------------------------------------------------------------
// Plot PUDO map for either PUs or DOs as selected in pudo-menu
function makeLayer(id, data, type) {
  const sett = pudoMapSett;
  const thisSource = `src-${id}`;

  // Add source only if it does not exist
  if (!map.getSource(thisSource)) {
    map.addSource(thisSource, {
      type: "geojson",
      data: data,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      clusterProperties: {
        sum: sett.clusterStyle[type].cluster
      }
    });
  }

  // CLUSTERED LAYER
   map.addLayer({
     id: `cl-${id}`,
     type: "circle",
     source: thisSource,
     filter: ["==", "cluster", true],
     paint: {
       "circle-color": sett.circleStyle[type].fill,
       "circle-radius": [
         "step",
         ["get", "point_count"],
         // 31, 50, // 31px, < threshold 50
         30, 100, // 50px, threshold 50 - 100
         40] // 60px, threshold >= 100
     }
   });
  // CLUSTERED LAYER LABEL
   map.addLayer({
    id: `cl-count-${id}`,
    type: "symbol",
    source: thisSource,
    filter: ["==", "cluster", true],
    layout: {
      "text-field": [
        "number-format",
          ["get", "sum"],
          { "min-fraction-digits": 0, "max-fraction-digits": 0 }
      ],
      "text-font": ["Open Sans Regular", "Arial Unicode MS Bold"],
      "text-size": 16,
      "text-allow-overlap": true,
      "text-ignore-placement": true
    },
    paint: {
       "text-color": sett.circleStyle[type].text
     }
  });

  // UNCLUSTERED LAYER
  map.addLayer({
      id: id,
      type: "circle",
      source: thisSource,
      filter: ["!=", "cluster", true],
      paint: {
        "circle-radius": 16,
        "circle-color": sett.circleStyle[type].fill,
        "circle-stroke-color": sett.circleStyle.stroke,
        "circle-stroke-width": 2,
        "circle-opacity": 1
      },
      layout: {
        "visibility": "visible"
      }
  });

  map.addLayer({
    "id": `${id}-label`,
    "type": "symbol",
    "source": thisSource,
    "layout": {
      "text-field": sett.circleStyle[type].count,
      "text-font": [
        "Open Sans Regular",
        "Arial Unicode MS Bold"
      ],
      "text-size": 16
      // "text-allow-overlap" : true
    },
    paint: {
       "text-color": sett.circleStyle[type].text
     }
  });
}
function makeStoryLayer(id, src, type, whichStory) {
  const sett = pudoMapSett;
  let pFraction = ["/", ["get", "pcounts"], ["+", ["get", "pcounts"], ["get", "dcounts"]]];

  map.addLayer({
      id: id,
      type: "circle",
      source: src,
      filter: ["==", ["string", ["get", "story"]], whichStory],
      paint: {
        "circle-radius": 16,
        "circle-color": [
          "step", pFraction,
          sett.pudoRanges.puMin.colour, sett.pudoRanges.puMin.range,
          sett.pudoRanges.puMid.colour, sett.pudoRanges.puMid.range,
          sett.pudoRanges.puMax.colour
        ],
        "circle-stroke-color": sett.circleStyle.stroke,
        "circle-stroke-width": 2,
        "circle-opacity": 1
      },
      layout: {
        "visibility": "visible"
      }
  });

  map.addLayer({
    "id": `${id}-label`,
    "type": "symbol",
    "source": src,
    "layout": {
      "text-field": sett.circleStyle[type].count,
      "text-font": [
        "Open Sans Regular",
        "Arial Unicode MS Bold"
      ],
      "text-size": 16
    },
    paint: {
       "text-color": sett.circleStyle[type].text
     }
  });
}
// PUDO layer only
// Plot PUDO map for pudo-pudo layer
function makePUDOLayer(id, data) {
  const type = "pudo";
  const sett = pudoMapSett;
  const thisSource = `src-${id}`;
  // ratio of pcounts to total counts for single circle markers
  var pFraction = ["/", ["get", "pcounts"], ["+", ["get", "pcounts"], ["get", "dcounts"]]];

  // Add source only if it does not exist
  if (!map.getSource(thisSource)) {
    map.addSource(thisSource, {
      type: "geojson",
      data: data,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      clusterProperties: {
        sum: ["+", ["+", ["get", "pcounts"], ["get", "dcounts"]]],
        pcount: ["+", ["get", "pcounts"]]
      }
    });
  }

  // CLUSTERED LAYER
   map.addLayer({
     id: `cl-${id}`,
     type: "circle",
     source: thisSource,
     filter: ["==", "cluster", true],
     paint: {
       // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
       // with three steps to implement three types of circles:
       //   * Blue, 20px circles when point count is less than 100
       //   * Yellow, 30px circles when point count is between 100 and 750
       //   * Pink, 40px circles when point count is greater than or equal to 750,
       "circle-color": [
         "step",
         ["/", ["get", "pcount"], ["get", "sum"]],
         sett.pudoRanges.puMin.colour, sett.pudoRanges.puMin.range,
         sett.pudoRanges.puMid.colour, sett.pudoRanges.puMid.range,
         sett.pudoRanges.puMax.colour
       ],
       "circle-stroke-color": sett.circleStyle.stroke,
       "circle-stroke-width": 1,
       "circle-radius": [
         "step",
         ["get", "point_count"],
         // 31, 50, // 31px, < threshold 50
         30, 100, // 50px, threshold 50 - 100
         40] // 60px, threshold >= 100
     }
   });
  // CLUSTERED LAYER LABEL
   map.addLayer({
    id: `cl-count-${id}`,
    type: "symbol",
    source: thisSource,
    filter: ["==", "cluster", true],
    layout: {
      // "text-field": "{point_count} ({sum})"
      // "text-field": ["to-string", ["get", "sum"]],
      "text-field": [
        "number-format",
          ["get", "sum"],
          { "min-fraction-digits": 0, "max-fraction-digits":0 }
      ],
      "text-font": ["Open Sans Regular", "Arial Unicode MS Bold"],
      "text-size": 16,
      "text-allow-overlap": true,
      "text-ignore-placement": true
    },
    paint: {
       "text-color": sett.circleStyle[type].text
     }
  });

  // UNCLUSTERED LAYER
  map.addLayer({
      id: id,
      type: "circle",
      source: thisSource,
      filter: ["!=", "cluster", true],
      paint: {
        "circle-radius": 16,
        "circle-color": [
          "step", pFraction,
          sett.pudoRanges.puMin.colour, sett.pudoRanges.puMin.range,
          sett.pudoRanges.puMid.colour, sett.pudoRanges.puMid.range,
          sett.pudoRanges.puMax.colour
        ],
        "circle-stroke-color": sett.circleStyle.stroke,
        "circle-stroke-width": 2,
        "circle-opacity": 1
      },
      layout: {
        "visibility": "visible"
      }
  });

  map.addLayer({
    "id": `${id}-label`,
    "type": "symbol",
    "source": thisSource,
    "layout": {
      "text-field": sett.circleStyle[type].count,
      "text-font": [
        "Open Sans Regular",
        "Arial Unicode MS Bold"
      ],
      "text-size": 16
      // "text-allow-overlap" : true
    },
    paint: {
       "text-color": sett.circleStyle[type].text
     }
  });

  map.on("click", id, function(e) {
    const feature = e.features[0];
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const makePopup = function() {
      let rtnPopup;
      if (whichPUDO === "pudo") {
        rtnPopup = `<div class="markerPopup"><dl><dt>Pick-ups:</dt><dd>${e.features[0].properties.pcounts}</dd>`
        rtnPopup = rtnPopup.concat(`<dt>Drop-offs:</dt><dd>${e.features[0].properties.dcounts}</dd>`);
        rtnPopup = rtnPopup.concat("</dl></div>");
      }
      return rtnPopup;
    };

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(makePopup())
        .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", id, function() {
      map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", id, function() {
      map.getCanvas().style.cursor = "";
  });
}

function showLayer(rootLayer, layerObj, thisPUDO) {
  // Outputs -pu or -do layer, never -pudo layer
  const root = geoMap[ward][pudoDay][pudoTOD];

  if (layerObj.find(({ id }) => id === `${rootLayer}-${thisPUDO}`)) {
    map.setLayoutProperty(`${rootLayer}-${thisPUDO}-label`, "visibility", "visible");
    map.setLayoutProperty(`${rootLayer}-${thisPUDO}`, "visibility", "visible");
    // cluster layers
    map.setLayoutProperty(`cl-${rootLayer}-${thisPUDO}`, "visibility", "visible");
    map.setLayoutProperty(`cl-count-${rootLayer}-${thisPUDO}`, "visibility", "visible");
  } else {
    if (root[thisPUDO]) makeLayer(`${rootLayer}-${thisPUDO}`, root[thisPUDO], thisPUDO);
  }
}

function showOverlapLayer(rootLayer, layerObj) {
  // Outputs ${whichPUDO}-pudo layer
  const sett = pudoMapSett;
  const root = geoMap[ward][pudoDay][pudoTOD];

  if (layerObj.find(({ id }) => id === `${rootLayer}-${whichPUDO}-pudo`)) {
    // make visible
    map.setLayoutProperty(`${rootLayer}-${whichPUDO}-pudo-label`, "visibility", "visible");
    map.setLayoutProperty(`${rootLayer}-${whichPUDO}-pudo`, "visibility", "visible");
    // cluster layers
    map.setLayoutProperty(`cl-${rootLayer}-${whichPUDO}-pudo`, "visibility", "visible");
    map.setLayoutProperty(`cl-count-${rootLayer}-${whichPUDO}-pudo`, "visibility", "visible");
  } else {
    if (root["pudo"]) {
      if (whichPUDO === "pudo") {
        makePUDOLayer(`${rootLayer}-${whichPUDO}-pudo`, root["pudo"]);
      } else {
        makeLayer(`${rootLayer}-${whichPUDO}-pudo`, root["pudo"], whichPUDO);
      }
    }
  }
}

// Hide map layers either for all previous wards or all previous selections
// of current ward
function hideLayers(layerObj, clearPrevWard) {
  layerObj.filter((d) => {
    // Hide -pu, -do, and -pudo layers
    if (d.id.indexOf("-pu") !== -1 || d.id.indexOf("-do") !== -1
                                   || d.id.indexOf("-pudo") !== -1) {
      if (clearPrevWard) { // Hide previous ward layers
        if (d.id.indexOf(`${ward}-`) === -1) {
          map.setLayoutProperty(d.id, "visibility", "none");
        }
        // neighbourhoods
        if (d.id.indexOf("nb") === -1) {
          map.setLayoutProperty(d.id, "visibility", "none");
        }
      } else { // Hide current ward's previous layers
        map.setLayoutProperty(d.id, "visibility", "none");
      }
    }
  });
}

// Plot ward layer
function makeWardLayer(id, geojson, whichBd) {
  map.addLayer({
    "id": id,
    "type": "line",
    "source": {
      "type": "geojson",
      "data": geojson
    },
    "layout": {},
    "paint": whichBd.paint
  });
}

// Hide ward boundary layers except for current ward
function showWardBoundary() {
  let layerExists = false;
  let layerObj = map.getStyle().layers; // obj containing all layers
  layerObj.filter((d) => {
    if (d.id.indexOf(`-layer`) !== -1 && d.id.indexOf(`${ward}-layer`) === -1) {
      map.setLayoutProperty(d.id, "visibility", "none");
    } else if (d.id === `${ward}-layer`) {
      map.setLayoutProperty(d.id, "visibility", "visible");
      layerExists = true;
    }
  });

  if (!layerExists) {
    makeWardLayer(`${ward}-layer`,  wardLayer[ward], pudoMapSett.ward);
    // Neighbourhood boundaries
    const n = Object.keys(nnLayer[ward]);
    for (let idx = 0; idx < n.length; idx++) {
      makeWardLayer(`${n[idx]}-layer`, nnLayer[ward][n[idx]], pudoMapSett.nn);
    }
  } else {
    // Neighbourhood boundaries
    const n = Object.keys(nnLayer[ward]);
    for (let idx = 0; idx < n.length; idx++) {
      map.setLayoutProperty(`${n[idx]}-layer`, "visibility", "visible");
    }
  }
  // clear
  layerExists = false;
}
