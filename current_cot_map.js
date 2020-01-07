"use strict";

var cot_map = function cot_map(container, o) {
  console.log("o: ", o)
  this.container = container;
  var controleBoxOptions;

  if (!!o.enableControlBox) {
    o.enableControlBox = $.extend({
      position: 'bottomright',
      width: 100
    }, o.enableControlBox || {});
  }

  if (!!o.enableFullscreen) {
    o.enableFullscreen = $.extend({
      options: {
        position: 'topleft',
        title: 'See the map in fullscreen',
        titleCancel: 'Exit fullscreen mode',
        content: '<span class="glyphicon glyphicon-fullscreen"></span>',
        forceSeparateButton: false,
        forcePseudoFullscreen: false,
        fullscreenElement: false
      },
      enterFullscreen: function enterFullscreen() {},
      exitFullscreen: function exitFullscreen() {}
    }, o.enableFullscreen || {});
  }

  if (!!o.enableSearchBar) {
    o.enableSearchBar = $.extend({
      position: 'topright',
      url: 'https://map.toronto.ca/cotgeocoder/rest/geocoder',
      width: 300,
      maxSuggest: 10
    }, o.enableSearchBar || {});
  }

  if (!!o.enableWardSelection) {
    o.enableWardSelection = $.extend({
      position: 'topright',
      width: 300,
      url: 'https://services3.arcgis.com/b9WvedVPoizGfvfD/arcgis/rest/services/COTGEO_CITY_WARD/FeatureServer/0',
      html: '<div class="wardsdiv"><label class="sr-only" for="wardSelect" id="wardselectTitle">Select a Ward</label><select class="form-control ward_number" id="wardSelect" disabled>  <option value="0">Select a Ward </option></select><button class="btn btn-default" type="button">  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>  <span class="sr-only">Reset the wards selection</span></button>  </div>',
      onWardSelect: function onWardSelect() {},
      onWardUnselect: function onWardUnselect() {},
      dropdownField: 'AREA_DESC',
      style: {
        color: 'rgba(23, 86, 137, 0.5)',
        fill: 'rgba(23, 86, 137, 0.5)',
        fillOpacity: 1,
        weight: 4
      }
    }, o.enableWardSelection || {});
  }

  this.options = $.extend({
    // mapCenter: [43.66, -79.373903],
    maxBounds: [[43.390, -80.290], [44, -78.600]],
    // zoom: 12, // read from input options o
    mapType: 'Topographic',
    mapHeight: 400,
    isVectorBasemap: false
  }, o || {});
  this.map = null;
  this.featureLayerList = {};
  this.markerList = {
    'defaultLayer': L.layerGroup()
  };
};

cot_map.prototype.render = function () {
  console.log("this.options: ", this.options)
  var that = this;
  var mapOptions = {
    zoom: this.options.zoom,
    center: this.options.mapCenter,
    mapTypeId: this.options.mapType,
    mapHeight: this.options.mapHeight,
    enableControlBox: this.options.enableControlBox,
    enableFullscreen: this.options.enableFullscreen,
    enableSearchBar: this.options.enableSearchBar,
    enableWardSelection: this.options.enableWardSelection,
    controlBoxTitle: this.controlBoxTitle
  };
  $('#' + this.container).css('height', this.options.mapHeight);
  this.map = L.map(this.container);

  if (this.options.isVectorBasemap) {
    L.esri.Vector.basemap(mapOptions.mapTypeId).addTo(this.map);
  } else {
    L.esri.basemapLayer(mapOptions.mapTypeId).addTo(this.map);
  }

  this.map.options.minZoom = 10;
  this.map.options.maxZoom = 18;
  this.map.setMaxBounds(this.options.maxBounds);
  this.map.setView(mapOptions.center, mapOptions.zoom); // disable/re-enable map dragging when hovering a control box

  var thisMap = this.map;
  var thisContainer = $('#' + this.container);
  thisContainer.delegate('.leaflet-control', 'mouseout', function () {
    thisMap.dragging.enable();
  }).delegate('.leaflet-control', 'mouseover', function () {
    thisMap.dragging.disable();
  }); // enable control box for featureLayers

  console.log("mapOptions: ", mapOptions)
  console.log("!!mapOptions: ", !!mapOptions.enableControlBox)
  if (!!mapOptions.enableControlBox) {
    var Legend = L.control({
      position: mapOptions.enableControlBox.position
    });

    Legend.onAdd = function (map) {
      var container = L.DomUtil.create('div', 'map-legend--fl', L.DomUtil.get('map'));
      container.style.width = mapOptions.enableControlBox.width + 'px';
      return container;
    };

    Legend.addTo(this.map);
    L.DomEvent.disableClickPropagation(Legend._container).disableScrollPropagation(Legend._container);
    featLay = this.featureLayerList;
    thisMap = this.map;
    $('.map-legend--fl')
      // .addClass('hidden')
      .addClass('visible-xs-*')
      .html('<div class="map-legend--fl__title">Control</div><div class="map-legend--fl__content hidden-xs" />')
      .delegate('.js-fl_control', 'change', function () {
        if ($(this).prop('checked') == false) {
          thisMap.removeLayer(featLay[$(this).attr('id')].fl);
        } else {
          thisMap.addLayer(featLay[$(this).attr('id')].fl);
        }
      }); // toggle between visible-xs-* and hidden-xs

    $('.map-legend--fl__title').on('click', function () {
      var mapLegLay = $('.map-legend--fl__content');

      if (mapLegLay.hasClass('hidden-xs')) {
        mapLegLay.removeClass('hidden-xs').addClass('visible-xs-*');
      } else {
        mapLegLay.removeClass('visible-xs-*').addClass('hidden-xs');
      }
    });
  }

  if (!!mapOptions.enableFullscreen) {
    var fullscreen = L.control.fullscreen(mapOptions.enableFullscreen.options).addTo(this.map);
    this.map.on('enterFullscreen', function () {
      mapOptions.enableFullscreen.enterFullscreen();
    });
    this.map.on('exitFullscreen', function () {
      mapOptions.enableFullscreen.exitFullscreen();
    });
  }

  if (!!mapOptions.enableSearchBar) {
    var searchAllAddress = function searchAllAddress(searchTerm) {
      var geocodingSearchURL = mapOptions.enableSearchBar.url + '/suggest';
      var addressResults = $.Deferred();
      var GEOCODING_OPTIONS = {
        f: 'json',
        addressOnly: 0,
        retRowLimit: mapOptions.enableSearchBar.maxSuggest,
        searchString: searchTerm
      };
      var geocoding = $.ajax({
        method: 'GET',
        url: geocodingSearchURL + '?' + $.param(GEOCODING_OPTIONS),
        type: 'GET',
        contentType: "application/json",
        dataType: "json"
      });
      geocoding.done(function (data) {
        addressResults.resolve(data.result.rows);
      }).fail(function () {
        addressResults.resolve([]);
      });
      return addressResults.promise();
    };

    var doSearch = function doSearch(autoSearch) {
      var SEARCH_MIN_CHARACTERS = 4;
      var searchTerm = $('#searchTerm').val().trim();

      if (searchTerm.length < SEARCH_MIN_CHARACTERS) {
        $('#resultsListbox').html('<li />');
        $('#resultsListbox li, .js-aria-live').html('Your search term must have at least ' + SEARCH_MIN_CHARACTERS + '  characters');

        if (!autoSearch) {
          showSearchResults();
        } else {
          $('#searchResults').addClass('hidden');
          $('#searchTermWrapper').attr('aria-expanded', false);
        }

        return false;
      } else {
        showSearchResults();
      }

      $.when(searchAllAddress(searchTerm)).done(function (data) {
        // console.log(data);
        totalResults = data.length;

        if (totalResults == 0) {
          $('#resultsListbox').html('<li />');
          $('#resultsListbox, .js-aria-live').html('No location found');
        } else {
          var searchResults = '';
          $.each(data, function (key, result) {
            searchResults += '<li class="searchResultsList" role="option" id="res' + result.KEYSTRING.replace(':', '-') + '">';
            searchResults += '<button type="button" tabindex="-1" class="js-getLocationAndDisplay resultbutton btn btn-link" data-keystring="' + result.KEYSTRING + '">' + result.ADDRESS.replace(new RegExp('(' + searchTerm + ')', 'i'), '<span class="hlgt">$1</span>') + '</button>';
            searchResults += '</li>';
          });
          $('#resultsListbox').html(searchResults);
          $('.js-aria-live').html('' + totalResults + ' Results are available for "' + searchTerm + '", use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.');
        }
      });
    }; // event handler


    // NOTE
    // AccessibilityAODA compliance : keyboard interaction
    var goToPrevious = function goToPrevious() {
      var selectedResult = $('.resultbutton').index($('.isActive'));
      selectedResult--;
      if (selectedResult < 0) selectedResult = totalResults - 1;
      $('.resultbutton').removeClass('isActive');
      var activeVal = $('.resultbutton').eq(selectedResult).text();
      var activeID = $('.searchResultsList').eq(selectedResult).attr('id');
      $('.resultbutton').eq(selectedResult).addClass('isActive');
      $('#searchTerm').val(activeVal).attr('aria-activedescendant', activeID);
    };

    var goToNext = function goToNext() {
      // down and right for NEXT
      var selectedResult = $('.resultbutton').index($('.isActive'));
      selectedResult++;

      if (selectedResult <= 0 || selectedResult >= totalResults) {
        selectedResult = 0;
      }

      var activeVal = $('.resultbutton').eq(selectedResult).text();
      var activeID = $('.searchResultsList').eq(selectedResult).attr('id');
      $('.resultbutton').removeClass('isActive');
      $('.resultbutton').eq(selectedResult).addClass('isActive');
      $('#searchTerm').val(activeVal).attr('aria-activedescendant', activeID);
    };

    var hideSearchResults = function hideSearchResults() {
      if (!keepFocus) {
        $('#searchResults').addClass('hidden');
        $('#searchTermWrapper').attr('aria-expanded', false);
      }
    };

    var showSearchResults = function showSearchResults() {
      keepFocus = true;
      $('#searchResults').removeClass('hidden');
      $('#searchTermWrapper').attr('aria-expanded', true);
    };

    thisContainer.delegate('.js-getLocationAndDisplay', 'click', function (e) {
      var thisBtn = $(this);
      var keystring = thisBtn.data('keystring');
      var getLatLngByKeystringURL = mapOptions.enableSearchBar.url + '/findAddressCandidates';
      var getLatLngByKeystringOptions = {
        f: 'json',
        keyString: keystring,
        retRowLimit: 10
      };
      var getLatLngByKeystring = $.ajax({
        url: getLatLngByKeystringURL + '?' + $.param(getLatLngByKeystringOptions),
        type: 'GET',
        contentType: "application/json",
        dataType: "json"
      });
      getLatLngByKeystring.done(function (data) {
        if (data.result.rows.length == 1) {
          thisMap.setView([data.result.rows[0].LATITUDE, data.result.rows[0].LONGITUDE], 16);
          var popup = L.popup().setLatLng([data.result.rows[0].LATITUDE, data.result.rows[0].LONGITUDE]).setContent(data.result.rows[0].KEY_DESC).openOn(thisMap);
          $('#searchTerm').val(data.result.rows[0].KEY_DESC);
          $('#searchResults').addClass('hidden');
          $('#searchTermWrapper').attr('aria-expanded', false);
          $('.leaflet-popup-close-button').focus();
          $('.searchMobileOpen').removeClass('searchMobileOpen').removeClass('legendOpen');
        }
      });
      return false;
    }); // add search bar

    var SearchBar = L.control({
      position: mapOptions.enableSearchBar.position
    });

    SearchBar.onAdd = function (map) {
      var container = L.DomUtil.create('div', 'map-legend--searchBar searchBar', L.DomUtil.get('map'));
      container.style.width = mapOptions.enableSearchBar.width + 'px';
      return container;
    };

    SearchBar.addTo(this.map);
    L.DomEvent.disableClickPropagation(SearchBar._container).disableScrollPropagation(SearchBar._container);
    var totalResults = 0;
    var searchbar = '';
    searchbar += '<div role="search" id="' + this.container + '_search" aria-label="Address Search">';
    searchbar += '<div class="input-group input-group-md">';
    searchbar += '<label class="sr-only" id="searchMapTitle" for="searchTerm">Search for an address or an Intersection</label><div aria-owns="resultsListbox" role="combobox" aria-haspopup="listbox" aria-expanded="false" id="searchTermWrapper"><input type="text" name="searchTerm" id="searchTerm" placeholder="search address/intersection" class="form-control" spellcheck="false" autocomplete="off" aria-controls="resultsListbox" aria-autocomplete="list"></div>';
    searchbar += '<div class="input-group-btn">';
    searchbar += '<button type="button" class="btn btn-primary" id="searchButton"><span class="glyphicon glyphicon-search" aria-hidden="true"></span><span class="label-icon sr-only">Find Location</span></button>';
    searchbar += '</div>';
    searchbar += '</div>';
    searchbar += '</div>';
    searchbar += '<div id="searchResults" class="searchResults hidden"><h5 id="searchResultsTitle">Address Search Results</h5><ul aria-labelledby="searchResultsTitle"  role="listbox" id="resultsListbox"></ul></div>';
    $('.map-legend--searchBar').html(searchbar);
    $('#' + this.container + '_search').on('keydown', function (e) {
      // on enter
      if (e.keyCode == 13) {
        e.preventDefault();
        doSearch();
        return false;
      }
    }).find("#searchButton").on('click', doSearch);
    var timer = null;
    $('#' + this.container + '_search').delegate('.resultbutton', 'mousemove', function () {
      $('.resultbutton').removeClass('isActive');
    });
    $('#searchTerm').on('keydown', function (e) {
      switch (e.keyCode) {
        // ban characters like backslash
        case 220:
          e.preventDefault();
          break;
        // left and right

        case 37:
        case 39:
          // let user use left and right
          //e.preventDefault();
          break;
        //up

        case 38:
          if ($('.searchResults.hidden').length == 0) {
            goToPrevious();
          }

          e.preventDefault();
          break;
        // tab

        case 9:
          // keepFocus=false;
          // hideSearchResults();
          // if($('.searchResults.hidden').length==0){
          //   goToNext();
          //   showSearchResults();
          //   e.preventDefault();
          // }
          // $('#searchTerm').attr('aria-activedescendant',"")
          break;
        //escape

        case 27:
          keepFocus = false;
          hideSearchResults();
          $('#searchTerm').val('').attr('aria-activedescendant', "");
          e.preventDefault();
          break;
        //down

        case 40:
          if ($('.searchResults.hidden').length == 0) {
            goToNext();
          }

          e.preventDefault();
          break;
        //enter

        case 13:
          if ($('.searchResults.hidden').length == 0) {
            $('.resultbutton.isActive').trigger('click');
            $('#searchTerm').attr('aria-activedescendant', "");
          } else {
            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
              doSearch();
            }, 500);
          }

          e.preventDefault();
          break; // backspace

          window.clearTimeout(timer);
          timer = window.setTimeout(function () {
            doSearch(true);
          }, 500);
          break;

        case 8:
        default:
          window.clearTimeout(timer);
          timer = window.setTimeout(function () {
            doSearch(true);
          }, 500);
          break;
      }
    }).on('blur', function () {
      window.clearTimeout(timer);
      keepFocus = false;
      window.setTimeout(function () {
        hideSearchResults();
        $('#searchTerm').val('').attr('aria-activedescendant', "");
      }, 200);
    }).on('focus', function () {
      doSearch(true);
    });
    $('.searchResults').on('focus', function () {
      showSearchResults();
    }).on('blur', function () {
      window.clearTimeout(timer);
      keepFocus = false;
      window.setTimeout(hideSearchResults, 200);
    });
    $('#searchButton').on('keydown', function (e) {
      switch (e.keyCode) {
        // tab
        case 9:
          if ($('.searchResults.hidden').length == 0 || e.shiftKey) {
            e.preventDefault();
            $('#searchTerm').focus();
          }

          break;
        //enter or space

        case 13:
        case 32:
          $('#searchTerm').focus();
          break;
        //escape

        case 27:
          keepFocus = false;
          hideSearchResults();
          e.preventDefault();
          break;

        default:
          e.preventDefault();
          break;
      }
    }).on('click', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        doSearch();
      }, 500);
    });
  }

  if (!!mapOptions.enableWardSelection) {
    var allWards = {}; // add control bar

    var WardsBar = L.control({
      position: mapOptions.enableWardSelection.position
    });

    WardsBar.onAdd = function (map) {
      var container = L.DomUtil.create('div', 'map-legend--wardsBar wardsBar', L.DomUtil.get('map'));
      container.style.width = mapOptions.enableWardSelection.width + 'px';
      container.innerHTML = mapOptions.enableWardSelection.html;
      return container;
    };

    WardsBar.addTo(thisMap);
    L.DomEvent.disableClickPropagation(WardsBar._container).disableScrollPropagation(WardsBar._container);
    thisMap.createPane('allWards'); // wards select event handler

    $('.wardsdiv').delegate('.ward_number', 'change', function () {
      var selectedArea = $(this).val(); // remove all wards from the map

      for (var fl in allWards) {
        allWards[fl].fl.removeFrom(thisMap);
      } // add ward to the map


      if (selectedArea != 0) {
        $('.wardsdiv').addClass('resetOn');
        var wardBounds = allWards[selectedArea].fl.getBounds();
        thisMap.flyToBounds(wardBounds);
        allWards[selectedArea].fl.addTo(thisMap); // Make sure the callback is a function

        if (typeof mapOptions.enableWardSelection.onWardSelect === "function") {
          mapOptions.enableWardSelection.onWardSelect(allWards[selectedArea] || false);
        }
      } else {
        //    thisMap.flyTo(mapOptions.center, mapOptions.zoom)
        $('.wardsdiv').removeClass('resetOn');

        if (typeof mapOptions.enableWardSelection.onWardUnselect === "function") {
          mapOptions.enableWardSelection.onWardUnselect();
        }
      }
    }).delegate('button', 'click', function () {
      $('.ward_number').val(0).trigger('change');
    }); // populate the dropdown

    L.esri.query({
      url: mapOptions.enableWardSelection.url
    }).where("1=1").run(function (error, wardsData) {
      for (var ward = 0; ward < wardsData.features.length; ward++) {
        allWards[wardsData.features[ward].id] = {
          properties: wardsData.features[ward].properties,
          fl: L.geoJSON(wardsData.features[ward], mapOptions.enableWardSelection.style)
        };
      }

      if ($('.ward_number option').length == 1) {
        // sort allWards
        var order = Object.keys(allWards).sort(function (a, b) {
          return allWards[a].properties.AREA_SHORT_CODE - allWards[b].properties.AREA_SHORT_CODE;
        });

        for (var i = 0; i < order.length; i++) {
          $('.ward_number').append('<option value="' + order[i] + '" data-area="' + allWards[order[i]].properties.AREA_SHORT_CODE + '">' + allWards[order[i]].properties[mapOptions.enableWardSelection.dropdownField || AREA_DESC] + '</option>');
        }

        $('.wardsdiv select').prop('disabled', false);
      }
    });
  }
};

cot_map.prototype.addMarker = function (o) {
  o = $.extend({
    addToLayer: 'defaultLayer',
    title: 'Please give that Marker a name',
    description: 'Please give that marker a popup description'
  }, o || {});

  if (!o.LatLng) {
    console.log('Your marker needs LatLng parameter!');
    return false;
  }

  var markerIcon = L.icon({
    iconUrl: L.Icon.Default.prototype._detectIconPath() + L.Icon.Default.prototype.options.iconUrl,
    iconAnchor: [12, 0]
  });

  if (!this.markerList.hasOwnProperty(o.addToLayer)) {
    this.markerList[o.addToLayer] = !!o.enableClustering ? L.markerClusterGroup() : L.layerGroup();
  }

  var markerOptions = {
    LatLng: o.LatLng,
    options: {
      draggable: false,
      title: o.title,
      alt: o.title,
      icon: markerIcon
    }
  };
  L.marker(markerOptions.LatLng, markerOptions.options).bindPopup('<h3>' + o.title + '</h3><div>' + o.description + '</div>').addTo(this.markerList[o.addToLayer]);
  this.map.addLayer(this.markerList[o.addToLayer]);
};

cot_map.prototype.addCircle = function (o) {
  o = $.extend({
    addToLayer: 'defaultLayer',
    title: 'Please give that Marker a name',
    description: 'Please give that marker a popup description'
  }, this.options.circleOptions || {});

  var markerIcon = L.icon({
    iconUrl: L.Icon.Default.prototype._detectIconPath() + L.Icon.Default.prototype.options.iconUrl,
    iconAnchor: [12, 0]
  });

  // if (this.options.focus) this.map.setView(this.options.focus, this.options.zoom);

  // Enable clustering. NB: markerList here is NOT an array of coords but an obj
  // { defaultLayer: {…} }
  this.markerList[o.addToLayer] = !!o.enableClustering ? L.markerClusterGroup() : L.layerGroup();

  var currentList = this.options.markerList;
  for (var jdx = 0; jdx < currentList.length; jdx++) {
     L.circle(currentList[jdx]).setStyle({className: this.options.markerClass})
      .bindPopup('<h3>' + o.title + '</h3><div>' + o.description + '</div>')
      .addTo(this.markerList[o.addToLayer]);
    this.map.addLayer(this.markerList[o.addToLayer]);
  }

};

cot_map.prototype.gotoFocus = function (o) {
  console.log(this.options.focus)
  console.log(this.options.zoom)
  this.map.setView(this.options.focus, this.options.zoom);
};

cot_map.prototype.rmCircle = function () {
  const obj = wardpudoMap.map._layers;
  var firstKey = Object.keys(obj)[0];

  // remove all elements in layers obj EXCEPT the first element (which is the map)
  Object.keys(obj).forEach(key => {
    if (key != firstKey && wardpudoMap.map._layers[key]) wardpudoMap.map._layers[key].remove();
  });
}


cot_map.prototype.addFeatureLayer = function (o) {
  o = $.extend({
    title: 'Give that layer a title!',
    enableClustering: true,
    addToControlBox: true,
    loadByDefault: true,
    template: ''
  }, o || {}); // check if minimum requirements are met

  if (!o.hasOwnProperty('id') || !o.hasOwnProperty('url')) {
    console.log('Please check your featureLayer options !');
    return false;
  } // add the featureLayer


  if (o.enableClustering) {
    this.featureLayerList[o.id] = {
      title: o.title,
      addToControlBox: o.addToControlBox,
      fl: L.esri.Cluster.featureLayer(o)
    };
  } else {
    this.featureLayerList[o.id] = {
      title: o.title,
      addToControlBox: o.addToControlBox,
      fl: L.esri.featureLayer(o)
    };
  }

  if (o.loadByDefault) {
    this.featureLayerList[o.id].fl.addTo(this.map);
  }

  if (o.template != '') {
    this.featureLayerList[o.id].fl.bindPopup(function (layer) {
      return L.Util.template(o.template, layer.feature.properties);
    });
  } //


  if (!!this.options.enableControlBox && !!o.addToControlBox) {
    $('.map-legend--fl__content').html('');
    $.each(this.featureLayerList, function (key, val) {
      if (!!val.addToControlBox) {
        $('.map-legend--fl__content').append('<label class="custom-checkbox" for="' + key + '"><input type="checkbox" class="js-fl_control" name="fl_control" id="' + key + '" checked><span></span> ' + val.title + '</label>');
      }
    });
    $('.map-legend--fl').removeClass('hidden');
  }
};

cot_map.prototype.addControl = function (o) {
  o = $.extend({
    position: 'topleft',
    className: false,
    content: '<h1>PLEASE ADD A CONTENT TO YOUR CONTROLBOX !</h1>',
    disablePropagation: true
  }, o || {});
  var that = this;
  var ctrl = L.control({
    position: o.position
  });

  ctrl.onAdd = function (map) {
    var div = L.DomUtil.create('div', o.className);
    div.innerHTML = o.content;
    return div;
  };

  ctrl.addTo(this.map);

  if (o.disablePropagation) {
    L.DomEvent.on(ctrl._container, 'dblclick mousewheel touchstart', function (ev) {
      L.DomEvent.stopPropagation(ev);
    });
  }
};