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
       "circle-blur": 0.5,
       "circle-stroke-color": sett.circleStyle[type].stroke,
       "circle-stroke-width": 0.5,
       // "circle-radius": [
       //   "sqrt", ["get", "sum"]
       // ]
       "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          // sett.circleScale.z1.zoom, ["/", ["sqrt", ["get", "sum"]], sett.circleScale.z1.scale],
          // sett.circleScale.z2.zoom, ["/", ["sqrt", ["get", "sum"]], sett.circleScale.z2.scale],
          // sett.circleScale.z3.zoom, ["/", ["sqrt", ["get", "sum"]], sett.circleScale.z3.scale]
          sett.circleScale.z1.zoom, ["/", ["sqrt", ["get", "sum"]], 0.75],
          sett.circleScale.z2.zoom, ["/", ["sqrt", ["get", "sum"]], 0.75],
          sett.circleScale.z3.zoom, ["/", ["sqrt", ["get", "sum"]], 0.75]
        ]
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
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-offset": ["case",
        ["<", ["get", "sum"], sett.circleStyle.labelMin], ["literal", sett.circleStyle.offset],
        ["literal", [0, 0]]
      ]
    },
    paint: {
       "text-color": ["case",
         ["<", ["get", "sum"], sett.circleStyle.labelMin], "#000",
         "#fff"
       ]
     }
  });

  // UNCLUSTERED LAYER
  map.addLayer({
      id: id,
      type: "circle",
      source: thisSource,
      filter: ["!=", "cluster", true],
      paint: {
        // "circle-radius": [
        //   "sqrt", ["get", sett.circleStyle[type].radius]
        // ],
        "circle-radius": [
           "interpolate", ["linear"], ["zoom"],
           sett.circleScale.z1.zoom, ["/", ["sqrt", ["get", sett.circleStyle[type].radius]], sett.circleScale.z1.scale],
           sett.circleScale.z2.zoom, ["/", ["sqrt", ["get", sett.circleStyle[type].radius]], sett.circleScale.z2.scale],
           sett.circleScale.z3.zoom, ["/", ["sqrt", ["get", sett.circleStyle[type].radius]], sett.circleScale.z3.scale]
         ],
        "circle-color": sett.circleStyle[type].fill,
        "circle-stroke-color": "#fff", // sett.circleStyle.stroke,
        "circle-stroke-width": 0.5,
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
      "text-size": 16,
      "text-allow-overlap": false,
      "text-offset": ["case",
        ["<", ["get", sett.circleStyle[type].radius], sett.circleStyle.labelMin], ["literal", sett.circleStyle.offset],
        ["literal", [0, 0]]
      ]
    },
    paint: {
      "text-color": ["case",
        ["<", ["get", sett.circleStyle[type].radius], sett.circleStyle.labelMin], "#000",
        "#fff"
      ]
     }
  });
}
// -------------------------------------------------------------------
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
       // https://docs.mapbox.com/mapbox-gl-js/example/cluster/
       // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
       // with three steps to implement three types of circles:
       //   * Blue, 20px circles when point count is less than 100
       //   * Yellow, 30px circles when point count is between 100 and 750
       //   * Pink, 40px circles when point count is greater than or equal to 750,
       "circle-color": [
         "step",
         ["/", ["get", "pcount"], ["get", "sum"]],
         sett.pudoRanges.puQ1.colour, sett.pudoRanges.puQ1.range,
         sett.pudoRanges.puQ2.colour, sett.pudoRanges.puQ2.range,
         sett.pudoRanges.puQ3.colour, sett.pudoRanges.puQ3.range,
         sett.pudoRanges.puQ4.colour, sett.pudoRanges.puQ4.range,
         sett.pudoRanges.puQ5.colour
       ],
       "circle-blur": 0.5,
       "circle-stroke-color": sett.circleStyle[type].stroke,
       "circle-stroke-width": 0.5,
       // "circle-stroke-opacity": 0.5,
       // "circle-radius": [
       //   "sqrt", ["get", "sum"]
       // ]
       // https://docs.mapbox.com/help/tutorials/mapbox-gl-js-expressions/
       // map.getZoom() to find out current zoom level
       "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          sett.circleScale.z1.zoom, ["/", ["sqrt", ["get", "sum"]], 0.75],
          sett.circleScale.z2.zoom, ["/", ["sqrt", ["get", "sum"]], 0.75],
          sett.circleScale.z3.zoom, ["/", ["sqrt", ["get", "sum"]], 0.75]
        ]
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
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-offset": ["case",
        ["<", ["get", "sum"], sett.circleStyle.labelMin], ["literal", sett.circleStyle.offset],
        ["literal", [0, 0]]
      ]
    },
    paint: {
      "text-color": "#000"
     }
  });

  // UNCLUSTERED LAYER
  map.addLayer({
      id: id,
      type: "circle",
      source: thisSource,
      filter: ["!=", "cluster", true],
      paint: {
        // "circle-radius": [
        //   "sqrt", ["+", ["get", "pcounts"], ["get", "dcounts"]]
        // ],
        "circle-radius": [
           "interpolate", ["linear"], ["zoom"],
           sett.circleScale.z1.zoom, ["/", ["sqrt", ["+", ["get", "pcounts"], ["get", "dcounts"]]], sett.circleScale.z1.scale],
           sett.circleScale.z2.zoom, ["/", ["sqrt", ["+", ["get", "pcounts"], ["get", "dcounts"]]], sett.circleScale.z2.scale],
           sett.circleScale.z3.zoom, ["/", ["sqrt", ["+", ["get", "pcounts"], ["get", "dcounts"]]], sett.circleScale.z3.scale]
         ],
        "circle-color": [
          "step", pFraction,
          sett.pudoRanges.puQ1.colour, sett.pudoRanges.puQ1.range,
          sett.pudoRanges.puQ2.colour, sett.pudoRanges.puQ2.range,
          sett.pudoRanges.puQ3.colour, sett.pudoRanges.puQ3.range,
          sett.pudoRanges.puQ4.colour, sett.pudoRanges.puQ4.range,
          sett.pudoRanges.puQ5.colour
        ],
        "circle-stroke-color": "#fff", // sett.circleStyle.stroke,
        "circle-stroke-width": 0.5,
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
      "text-size": 16,
      "text-allow-overlap": false,
      "text-offset": ["case",
        ["<", ["+", ["get", "pcounts"], ["get", "dcounts"]], sett.circleStyle.labelMin],
              ["literal", sett.circleStyle.offset], ["literal", [0, 0]]
      ]
    },
    paint: {
       "text-color": "#000"
     }
  });

  map.on("click", id, function(e) {
    const feature = e.features[0];
    const coordinates = e.features[0].geometry.coordinates.slice();
    const np = feature.properties.pcounts ? feature.properties.pcounts : "none";
    const nd = feature.properties.dcounts ? feature.properties.dcounts : "none";

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const makePopup = function() {
      let rtnPopup;
      if (whichPUDO === "pudo") {
        rtnPopup = `<div class="markerPopup"><dl><dt>Pick-ups:</dt><dd>${np}</dd>`
        rtnPopup = rtnPopup.concat(`<dt>Drop-offs:</dt><dd>${nd}</dd>`);
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

// Legend for PUDO map (dynamically updates with pudo-menu selection)
plotPudoLegend = function(data) {
  const dataLayer = d3.select("#pudomap-legend");

  let root = dataLayer
    .selectAll(".levels", function(d) {
      return d.id; // Binds data by id
    })
    .data(data);

  // Add div nodes
  const newGroup = root
    .enter()
    .append("div")
    .attr("class", "levels")
    .attr("id", function(d, i) {
      return `lev${i}`;
    });

  // Add span under each div node
  newGroup
    .append("span")
    .attr("class", function(d, i) {
      return d.span;
    });

  // Add text for each NEW div
  newGroup
      .append("text")
      .html(function(d) {
        return d.text;
      });

  // Update span class of EXISTING div
  root.select("span")
    .attr("class", function(d) {
      return d.span;
    });

  // Update text of EXISTING div
  root.select("text")
     .html(function(d) {
       return d.text;
     });

  root.exit().remove();
}
// -------------------------------------------------------------------
// STORY LAYER
function makeStoryLayer(storyId, src, type, whichStory) {
  const sett = pudoMapSett;
  const layerObj = map.getStyle().layers;

  // If layer exists, make visible, otherwise create it
  if (layerObj.find(({ id }) => id === storyId)) {
    map.setLayoutProperty(storyId, "visibility", "visible");
  } else {
    map.addLayer({
      id: storyId,
      type: "circle",
      source: src,
      filter: ["==", ["string", ["get", "story"]], whichStory],
      paint: {
        "circle-radius": 30,
        "circle-stroke-color": sett.humberCircle.stroke,
        "circle-stroke-width": 6,
        "circle-opacity": 0
      },
      layout: {
        "visibility": "visible"
      }
    });
  }
}
function hideStoryLayer(storyId) {
  const layerObj = map.getStyle().layers;
  if (layerObj.find(({ id }) => id === storyId)) {
    map.setLayoutProperty(storyId, "visibility", "none");
  }
}
