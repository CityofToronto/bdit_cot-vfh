// -----------------------------------------------------------------------------
// settings
let settingsTPDline;

// data objects
const ptcData = {};

// data selectors
const tpd = "tpd"; // trips per day
const tpdAM = "tpdAM"; // trips per day AM
const tow = "tow"; // time of week

// -----------------------------------------------------------------------------
// Chart SVGs
// Fig 1 - Trips Per Day line chart
const tpdChart = d3.select(".tpd-line.data")
    .append("svg")
    .attr("id", "tpdLine");

// Fig 3 - TOW line chart
const towChart = d3.select(".tow.data")
    .append("svg")
    .attr("id", "towLine");

// -----------------------------------------------------------------------------
// COTUI classes
class ChartData{
  constructor({options:chartOptions,data:chartData}={}){

    const defaultOptions={}

    return{
      chartOptions:{
        srcTitle: 'Neighbourhood',
        srcKey: 'AREA_SHORT_CODE',
        srcLabel: 'AREA_NAME',
        type: 'choropleth'||'leaflet',
        color: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
        //color: '#FFF587',
        //breaks: 10,
        layer: 'City_Ward_2018',
        src: 'https://gis.toronto.ca/arcgis/rest/services/primary/cot_geospatial_mtm/MapServer/265'||'resources/cot_neighbourhoods.json',

        // tooltipTemplate:{
        //   title:'<p><strong>{{TITLE}}</strong></p>',
        //   body:'<p>{{VALUE}} in {{LABEL}}</p>'
        // },
        title: 'Incidents By Neighbourhood',

        fontSize: 18,
        legend:{
          display: false,
        },
        layout: {
          padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
          }
        },
        onClick(evt){
          console.log(evt)
         },
        //onHover(evt){  },
        onMouseOut(evt){ }
      },
      chartData:{
          srcKeys: ["117","042","034","076","002","104","047","087","134","074","121","100","030","083","116","046","130","103","064","084","128","020","072","127","122","060","007","137","052","039","082","112","018","080","045","023","031","051","037","022","133","068","075","120","123","049","013","092","033","044","010","101","016","118","063","003","055","004","125","131","014","071","062","090","119","138","005","059","111","041","032","011","113","025","065","140","057","139","085","070","040","043","136","001","035","098","021","124","006","026","053","109","095","079","008","048","009","115","110","054","086","058","078","096","126","015","093","089","114","019","132","029","012","105","017","135","073","097","094","056","027","038","099","088","107","067","108","050","077","024","036","066","102","069","028","129","106","061","091","081"],
          labels: ["L'Amoreaux","Banbury-Don Mills","Bathurst Manor","Bay Street Corridor","Mount Olive-Silverstone-Jamestown","Mount Pleasant West","Don Valley Village","High Park-Swansea","Highland Creek","North St.James Town","Oakridge","Yonge-Eglinton","Brookhaven-Amesbury","Dufferin Grove","Steeles","Pleasant View","Milliken","Lawrence Park South","Woodbine Corridor","Little Portugal","Agincourt South-Malvern West","Alderwood","Regent Park","Bendale","Birchcliffe-Cliffside","Woodbine-Lumsden","Willowrid              ge-Martingrove-Richview","Woburn","Bayview Village","Bedford Park-Nortown","Niagara","Beechborough-Greenbrook","New Toronto","Palmerston-Little Italy","Parkwoods-Donalda","Pelmo Park-Humberlea","Yorkdale-Glen Park","Willowdale East","Willowdale West","Humbermede","Centennial Scarborough","North Riverdale","Church-Yonge Corridor","Clairlea-Birchmount","Cliffcrest","Bayview Woods-Steeles","Etobicoke West Mall","Corso Italia-Davenport","Clanton Park","Flemingdon Park","Princess-Rosethorn","Forest Hill South","Stonegate-Queensway","Tam O'Shanter-Sullivan","The Beaches","Thistletown-Beaumond Heights","Thorncliffe Park","Rexdale-Kipling","Ionview","Rouge","Islington-City Centre West","Cabbagetown-South St.James Town","East End-Danforth",
          "Junction Area","Wexford/Maryvale","Eglinton East","Elms-Old Rexdale","Danforth East York","Rockcliffe-Smythe","Bridle Path-Sunnybrook-York Mills","Englemount-Lawrence","Eringate-Centennial-West Deane","Weston","Glenfield-Jane Heights","Greenwood-Coxwell","Guildwood","Broadview North","Scarborough Village","South Parkdale","South Riverdale","St.Andrew-Windfields","Victoria Village","West Hill","West Humber-Clairville","Westminster-Branson","Rosedale-Moore Park","Humber Summit","Kennedy Park","Kingsview Village-The Westway","Downsview-Roding-CFB","Henry Farm","Caledonia-Fairbank","Annex","University","Humber Heights-Westmount","Hillcrest Village","Edenbridge-Humber Valley","Mount Dennis","Keelesdale-Eglinton West","O'Connor-Parkview","Roncesvalles","Old East York","Kensington-Chinatown","Casa Loma","Dorset Park","Kingsway South","Dovercourt-Wallace Emerson-Junction","Runnymede-Bloor West Village","Lambton Baby Point","Long Branch","Malvern","Maple Leaf","Markland Wood","Lawrence Park North","Mimico","Morningside","Moss Park","Yonge-St.Clair","Wychwood","Leaside-Bennington","York University Heights","Lansing-Westgate","Mount Pleasant East","High Park North","Oakwood Village","Playter Estates-Danforth","Briar Hill-Belgravia","Newtonbrook East","Waterfront Communities-The Island","Black Creek","Newtonbrook West","Danforth","Forest Hill North","Blake-Jones","Rustic","Agincourt North","Humewood-Cedarvale","Taylor-Massey","Weston-Pellam Park","Trinity-Bellwoods"],
          datasets: [{
            label:'Average Outbreaks in 2019',
            data:[11.8,11.3,9.9,5.3,7.7,9.7,5.9,6.9,8.3,6.4,14.2,13.5,9.4,14.8,8.8,11.2,5.6,9.1,13.4,7.5,11.7,5.7,11.0,7.6,12.5,10.3,10.9,10.2,8.9,9.1,9.3,14.5,10.5,12.6,9.3,8.7,8.1,15.5,13.1,10.5,9.3,10.4,12.9,7.2,5.1,14.3,9.2,9.5,10.1,6.0,5.9,14.5,8.8,9.9,14.8,13.9,8.1,13.8,9.3,9.4,12.8,14.4,8.6,12.4,5.4,7.5,12.0,7.4,5.1,4.9,5.4,10.1,8.5,16.8,12.0,8.1,11.2,8.3,15.2,9.0,13.1,15.1,6.0,7.1,9.7,8.3,9.4,7.6,6.8,11.6,14.7,10.8,10.7,8.9,7.4,10.3,12.1,6.8,9.7,7.7,13.2,12.4,12.4,8.2,4.6,15.8,7.2,13.8,15.1,11.4,9.0,6.7,10.4,7.3,11.3,12.6,5.0,13.0,13.3,9.4,6.4,12.1,6.8,13.9,14.1,10.6,12.9,12.1,12.1,6.8,8.0,11.0,14.9,8.4,9.1,8.9,5.5,5.1,12.1,11.7]
          }
          ]
        }
      }


  }
}

// -----------------------------------------------------------------------------
// Functions
function pageTexts() {
  // Intro texts
  d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
  d3.select("#subtitle1").text(i18next.t("subtitle1", {ns: "indexhtml"}));
  d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));
  d3.select("#DVpara").html(i18next.t("DVpara", {ns: "indexhtml"}));

  // Intro to Data Exploration
  d3.select("#subtitle2").text(i18next.t("subtitle2", {ns: "indexhtml"}));
  d3.select("#Q1").html(i18next.t("Q1", {ns: "indexhtml"}));
  d3.select("#Q2").html(i18next.t("Q2", {ns: "indexhtml"}));
  d3.select("#Q3").html(i18next.t("Q3", {ns: "indexhtml"}));

  // Fig 1 PTC Growth
  d3.select(".section-growth").select("#section0").text(i18next.t("section0", {ns: "indexhtml"}));
  d3.select(".section-growth").select("#section0-text1").html(i18next.t("section0-text1", {ns: "indexhtml"}));
  d3.select("#growthtsTitle").html(i18next.t("growthtsTitle", {ns: "indexhtml"}));

  // Figs 2 Impacts
  d3.select(".section-impact").select("#section2").html(i18next.t("section2", {ns: "indexhtml"}));
  d3.select(".section-impact").select("#section2-text1").html(i18next.t("section2-text1", {ns: "indexhtml"}));
  d3.select(".section-impact").select("#section2-text1b").html(i18next.t("section2-text1b", {ns: "indexhtml"}));
  // d3.select(".section-impact").select("#section2-text2").html(i18next.t("section2-text2", {ns: "indexhtml"}));

  // Fig 3 Time of Week
  d3.select(".section-tow").select("#section3").html(i18next.t("section3", {ns: "indexhtml"}));
  d3.select(".section-tow").select("#section3-text1").html(i18next.t("section3-text1", {ns: "indexhtml"}));
  d3.select(".dow-label#mon").html(i18next.t("mon", {ns: "dow-abbr"}));
  d3.select(".dow-label#tues").html(i18next.t("tues", {ns: "dow-abbr"}));
  d3.select(".dow-label#wed").html(i18next.t("wed", {ns: "dow-abbr"}));
  d3.select(".dow-label#thurs").html(i18next.t("thurs", {ns: "dow-abbr"}));
  d3.select(".dow-label#fri").html(i18next.t("fri", {ns: "dow-abbr"}));
  d3.select(".dow-label#sat").html(i18next.t("sat", {ns: "dow-abbr"}));
  d3.select(".dow-label#sun").html(i18next.t("sun", {ns: "dow-abbr"}));

  // Ward patterns section
  d3.select(".section-wardpatterns").select("#section4").html(i18next.t("section4", {ns: "indexhtml"}));
}

// Report cards
function showCards() {
  d3.select("#card-1").select(".chart__card-heading")
    .html(i18next.t("fullreport", {ns: "indexhtml"}));
  d3.select("#card-1").select(".chart__card-body")
    .html(i18next.t("fullreportLink", {ns: "indexhtml"}));

d3.select("#card-2").select(".chart__card-heading")
  .html(i18next.t("appendixA", {ns: "indexhtml"}));
  d3.select("#card-2").select(".chart__card-body")
    .html(i18next.t("appendixALink", {ns: "indexhtml"}));

d3.select("#card-3").select(".chart__card-heading")
  .html(i18next.t("appendixB", {ns: "indexhtml"}));
  d3.select("#card-3").select(".chart__card-body")
    .html(i18next.t("appendixBLink", {ns: "indexhtml"}));
}

// Fig 1 - Trips Per Day line chart
function showtpdLine() {
  lineChart(tpdChart, settingsTPDline, ptcData[tpd]);
  rotateLabels("tpdLine", settingsTPDline);
}

// Fig 2c - Shared trips cholorpleth
function showWardPUDOMap() {
    // const ui = new COTUI({initCustomElements: true});
    // ui.Charts();
    //
    // var mapData = new ChartData();
    // var map = document.getElementById("sharedMap");
    // map.updateComponent();
    const options = {
      mapHeight: 1200,
      mapType: 'Gray'
    };
    var yourMap = new cot_map("wardPUDOMap", options);
    yourMap.render();
}

// Fig 3 - Time of Week line chart
function showtowLine() {
  lineChart(towChart, settingsTOWline, ptcData[tow]);
  rotateLabels("towLine", settingsTOWline);
  // axis annotations
  d3.select("#hr")
      .text(i18next.t("hr", {ns: "towline"}));
}

function rotateLabels(chartId, sett) {
  // axes labels
  d3.select(`#${chartId}`).select(".y.axis").select(".chart-label").attr("transform", function(d) {
    return "translate(" + (sett.y.translateXY[0]) + " " + (sett.y.translateXY[1]) + ")rotate(-90)";
  });

  if (sett.x.translateXY) {
    d3.select(`#${chartId}`).select(".x.axis").select(".chart-label").attr("transform", function(d) {
      return "translate(" + (sett.x.translateXY[0]) + " " + (sett.x.translateXY[1]) + ")";
    });
  }
}
// -----------------------------------------------------------------------------
// Initial page load
console.log("CALL init page load")
i18n.load(["webapps/bdit_cot-vfh/i18n"], () => {
  console.log("init page load")
  d3.queue()
      .defer(d3.json, "webapps/bdit_cot-vfh/data/fig1_dailytrips_city.json") // trips per day
      .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig2_dummy_ptc_AM_downtown.json") // time of day ts
      .defer(d3.json, "/webapps/bdit_cot-vfh/data/fig3_tow_profile_city.json") // time of week ts
      .await(function(error, tpdfile, tpdAMfile, towfile) {
        ptcData[tpd] = tpdfile;
        ptcData[tpdAM] = tpdAMfile;
        ptcData[tow] = towfile;

        showCards();
        pageTexts();

        // settings files
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

        showtpdLine();
        showWardPUDOMap();
        showtowLine();

        // hack
        d3.select("#appDisplay").attr("class", "show");
      });
})
