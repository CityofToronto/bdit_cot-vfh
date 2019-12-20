mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-74.0059, 40.7128],
  zoom: 11
});

map.on('load', function() {

  var filterHour = ['==', ['number',['get', 'Hour']], 12];
  var filterDay = ['!=', ['string',['get', 'Day']], 'placeholder'];

  map.addLayer({
    id: 'collisions',
    type: 'circle',
    source: {
      type: 'geojson',
      data: './collisions1601.geojson' // replace this with the url of your own geojson
    },
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['number', ['get', 'Casualty']],
        0, 4,
        5, 24
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['number', ['get', 'Casualty']],
        0, '#2DC4B2',
        1, '#3BB3C3',
        2, '#669EC4',
        3, '#8B88B6',
        4, '#A2719B',
        5, '#AA5E79'
      ],
      'circle-opacity': 0.8
    },
    'filter': ['all', filterHour, filterDay]
  });

  // update hour filter when the slider is dragged
  document.getElementById('slider').addEventListener('input', function(e) {
    var hour = parseInt(e.target.value);
    // update the map
    filterHour = ['==', ['number', ['get', 'Hour']], hour];
    map.setFilter('collisions', ['all', filterHour, filterDay]);

    // converting 0-23 hour to AMPM format
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var hour12 = hour % 12 ? hour % 12 : 12;

    // update text in the UI
    document.getElementById('active-hour').innerText = hour12 + ampm;
  });

  document.getElementById('filters').addEventListener('change', function(e) {
    var day = e.target.value;
    // update the map filter
    if (day === 'all') {
      filterDay = ['!=', ['string', ['get','Day']], 'placeholder'];
    } else if (day === 'weekday') {
      filterDay = ['match', ['get', 'Day'], ['Sat', 'Sun'], false, true];
    } else if (day === 'weekend') {
      filterDay = ['match', ['get', 'Day'], ['Sat', 'Sun'], true, false];
    } else {
      console.log('error');
    };
    map.setFilter('collisions', ['all', filterHour, filterDay]);
  });

});
