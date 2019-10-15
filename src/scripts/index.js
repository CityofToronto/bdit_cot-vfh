var junk="junk";

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
function pageTexts() {
  // Intro texts
  d3.select(".page-header h1").text(i18next.t("pagetitle", {ns: "indexhtml"}));
  d3.select("#subtitle1").text(i18next.t("subtitle1", {ns: "indexhtml"}));
  d3.select("#introp").html(i18next.t("introp", {ns: "indexhtml"}));
  d3.select("#DVpara").html(i18next.t("DVpara", {ns: "indexhtml"}));
  d3.select("#reportButton").html(i18next.t("fullreport", {ns: "indexhtml"}));
  d3.select("#appendixA").html(i18next.t("appendixA", {ns: "indexhtml"}));
  d3.select("#appendixB").html(i18next.t("appendixB", {ns: "indexhtml"}));

  // Intro to Data Exploration
  d3.select("#subtitle2").text(i18next.t("subtitle2", {ns: "indexhtml"}));
  d3.select("#Q1").html(i18next.t("Q1", {ns: "indexhtml"}));
  d3.select("#Q2").html(i18next.t("Q2", {ns: "indexhtml"}));
  d3.select("#Q3").html(i18next.t("Q3", {ns: "indexhtml"}));

  // Fig 1 PTC Growth
  d3.select(".section-growth").select("#section0").text(i18next.t("section0", {ns: "indexhtml"}));
  d3.select(".section-growth").select("#section0-text1").html(i18next.t("section0-text1", {ns: "indexhtml"}));
  d3.select("#growthtsTitle").html(i18next.t("growthtsTitle", {ns: "indexhtml"}));

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
}
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
// Chart functions
function showCards() {
  d3.select("#card-1").select(".chart__card-body")
    .html(i18next.t("fullreportLink", {ns: "indexhtml"}));

  d3.select("#card-2").select(".chart__card-body")
    .html(i18next.t("appendixALink", {ns: "indexhtml"}));

  d3.select("#card-3").select(".chart__card-body")
    .html(i18next.t("appendixBLink", {ns: "indexhtml"}));
}

// Fig 1 - Trips Per Day line chart
function showtpdLine() {
  lineChart(tpdChart, settingsTPDline, ptcData[tpd]);
  rotateLabels("tpdLine", settingsTPDline);
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
        showtowLine();

        // hack
        d3.select("#appDisplay").attr("class", "show");
      });
})
