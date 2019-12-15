// -----------------------------------------------------------------------------
// Fig 4b - PUDO map by wards

pudoMapSettings = {
  enableControlBox: false,
  enableSearchBar: false,
  // zoom: 12,
  mapHeight: 480,
  // isVectorBasemap: true,
  enableFullscreen: false,
  zoomControl: false,
  maxZoom: 18,
  // mapHeight: 1200,
  mapType: "NationalGeographic",
  enableWardSelection: false,
  enableControlBox: true,
  controlBoxTitle: "Trip type",
  circleOptions: {
    enableClustering: true,
    fillOpacity: 0.5,
    radius: 20
  },
  initZoom: 16,
  defaultZoom: 12,
  wardLayerColour: "#000",
  circleStyle: {
    "pu": {
      fill: "#3BB3C3", stroke: "#000", text: "#000"
    },
    "do": {
      fill: "#660c2c", stroke: "#808080", text: "#fff"
    },
    "pudo": {
      fill: "#808080", stroke: "#747474", text: "#000"
    }
  },
  clusterStyle: {
    "pu": {
      fillMin: "#2b8cbe", fillMid: "#045a8d", fillMax: "#421b5f"
    },
    "do": {
      fillMin: "#f768a1", fillMid: "#c51b8a", fillMax: "#7a0177"
    },
    "pudo": {
      fillMin: "#969696", fillMid: "#636363", fillMax: "#252525"
    }
  },
  w1Centre: [43.727839, -79.601726],
  w1Focus: [-79.601726, 43.727839],
  w2Focus: [-79.548153, 43.661765],
  w3Focus: [-79.517973, 43.623204],
  w4Focus: [-79.459995, 43.654720],
  w10Focus: [-79.403219, 43.645168],
  w22Focus: [-79.304402, 43.795302]
};

// Possible mapTypes:
// Topographic, Streets, NationalGeographic, Oceans, Gray, DarkGray, Imagery, ImageryClarity, ShadedRelief


// stroke #747474 passes with pu outline
// fill #808080  passes with do fill
