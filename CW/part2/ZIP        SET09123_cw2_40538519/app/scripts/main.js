"use strict";

// Imports classes
import BarChart from "./BarChart.js";
import Scatter from "./Scatter.js";
import LineChart from "./LineChart.js";
import Pieburst from "./Pieburst.js";
import Map from "./Map.js";


// Loading data from a file
async function loadData() {
  try {
    let dataset = await d3.csv("data/SET09123_IDV_CW_dataset.csv", (d) => {
      return {
        /*
            Sample:
                name	    lon	        lat	    region	year	month	  max_temp(c)	min_temp(c)	af_days	    rain(mm)    sun
                Aberporth	-4.56999	52.13914	Wales	  2007	  1	      9.5	        5.5	        0	        94.8	      57.5
                Aberporth	-4.56999	52.13914	Wales	  2007	  2	      8.8	        4	          2	        91.9	      87.6
                Aberporth	-4.56999	52.13914	Wales	  2007	  3	      9.5	        4.4	        0	        69	        151.6
                Aberporth	-4.56999	52.13914	Wales	  2007	  4	      13.8	      7.4	        0	        9.8	        235.1
                Aberporth	-4.56999	52.13914	Wales	  2007	  5	      14.3	      8.5	        0	        81.8	      216.8
                Aberporth	-4.56999	52.13914	Wales	  2007	  6	      16.9	      11.6	      0	        92.1	      158.2
                Aberporth	-4.56999	52.13914	Wales	  2007	  7	      16.7	      11.8	      0	        155.2	      181.2
                Aberporth	-4.56999	52.13914	Wales	  2007	  8	      17	        12.3	      0	        59.4	      175.1
                Aberporth	-4.56999	52.13914	Wales	  2007	  9	      16.1	      11.6	      0	        57.4	      147.8
                Aberporth	-4.56999	52.13914	Wales	  2007	  10	    14	        9.2	        0	        28.8	      117.7
                Aberporth	-4.56999	52.13914	Wales	  2007	  11	    10.8	      6.8	        1	        48.6	      52.9
                Aberporth	-4.56999	52.13914	Wales	  2007	  12	    8.7	        3.6	        7	        103.6	      74.4
                */
        station: d.name, // unchanged
        lon: parseFloat(d.lon), // parsed to float
        lat: parseFloat(d.lat), // parsed to float
        region: d.region, // unchanged
        year: parseInt(d.year), // parsed to int
        month: parseInt(d.month), // parsed to int
        max_temp: parseFloat(d.max_temp), // parsed to float
        min_temp: parseFloat(d.min_temp), // parsed to float
        avg_temp: (parseFloat(d.max_temp) + parseFloat(d.min_temp)) / 2, // new attribute
        af_days: parseInt(d.af_days), // parsed to int
        rain: parseFloat(d.rain), // parsed to float
        sun: parseFloat(d.sun), // parsed to float
      };
    });

    // Once the data is loaded and processed, log it to the console
    console.log("Loaded data:");
    console.log(dataset);
    console.log("");

    return dataset;
  } catch (error) {
    console.error("An error occurred loading the data:", error);
  }
}

// Need to wait for async functions
let weatherData = await loadData();



// Log some important readings:
console.log("Month records -")
// Rainfall
const max_precip_reading = d3.max(weatherData, d=>d.rain);
const station_max_rain = weatherData.filter(d=>d.rain === max_precip_reading);
console.log("Highest rainfall recorded:", station_max_rain);

const min_precip_reading = d3.min(weatherData, d=>d.rain);
const station_min_rain = weatherData.filter(d=>d.rain === min_precip_reading);
console.log("Lowest rainfall recorded", station_min_rain);

// Temperatures
const max_avg_temp_reading = d3.max(weatherData, d=>d.avg_temp);
const station_max_avg_temp = weatherData.filter(d=>d.avg_temp === max_avg_temp_reading);
console.log("Highest avg daily temp recorded:", station_max_avg_temp);

const min_avg_temp_reading = d3.min(weatherData, d=>d.avg_temp);
const station_min_avg_temp = weatherData.filter(d=>d.avg_temp === min_avg_temp_reading);
console.log("Lowest avg daily temp recorded:", station_min_avg_temp);

const highest_max_temp_reading = d3.max(weatherData, d=>d.max_temp);
const station_highest_max_temp = weatherData.filter(d=>d.max_temp === highest_max_temp_reading);
console.log("Highest avg daily max temp recorded:", station_highest_max_temp);

const lowest_min_temp_reading = d3.min(weatherData, d=>d.min_temp);
const station_lowest_min_temp = weatherData.filter(d=>d.min_temp === lowest_min_temp_reading);
console.log("Lowest avg daily min temp recorded:", station_lowest_min_temp);

// Sun
const max_sun_reading = d3.max(weatherData, d=>d.sun);
const station_max_sun = weatherData.filter(d=>d.sun === max_sun_reading);
console.log("Highest sun duration recorded:", station_max_sun);

const min_sun_reading = d3.min(weatherData, d=>d.sun);
const station_min_sun = weatherData.filter(d=>d.sun === min_sun_reading);
console.log("Lowest sun duration recorded:", station_min_sun);

// Air frost
const max_af_reading = d3.max(weatherData, d=>d.af_days);
const station_max_af = weatherData.filter(d=>d.af_days === max_af_reading);
console.log("Highest number of days of air frost recorded:", station_max_af);

console.log("");



// Custom locale number formats
let enUK = d3.formatLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["£", ""],
});
let formatGBP = enUK.format("$,.2f");
let f_2dp = d3.format(".2f"); // Formats to 2 decimal places


/* 
If attribute is list of values, normalises by min/max of all those listed, otherwise normalises by min/max of specific attribute
*/
function normaliseData(datum, attribute) {
  let min, max;

  if (Array.isArray(attribute)) {
    // Normalize based on list of attributes
    min = d3.min(weatherData, d => d3.min(attribute, attr => d[`${attr}`]));
    max = d3.max(weatherData, d => d3.max(attribute, attr => d[`${attr}`]));
  } else {
    // Normalize based on a single attribute
    min = d3.min(weatherData, d=>d[`${attribute}`]);
    max = d3.max(weatherData, d=>d[`${attribute}`]);
  }

  return (datum - min) / (max - min);
}


// Used to convert integer months to string representations
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

/*
 Great Britain central coordinates:
 latitude: 54.00278
 longitude: -2.54537
 https://www.ordnancesurvey.co.uk/blog/where-is-the-centre-of-great-britain
 (used address location provided here to get lat-lon via https://www.gps-coordinates.net/)
*/
const centralLatitude = 54.00278;
const centralLongitude = -2.54537;

const latitudes = weatherData.map(d => d.lat);
latitudes.sort(d3.ascending);
const medianLatitude = d3.median(latitudes);

const longitudes = weatherData.map(d => d.lon);
longitudes.sort(d3.ascending);
const medianLongitude = d3.median(longitudes);

const horizontalSplit = medianLatitude; // Change to centralLatitude to see stations split by this point
const verticalSplit = medianLongitude;  // Change to centralLongitude to see stations split by this point


/*
Changes charts to show by station (Triggered from bubble map when station clicked, resets when bubble map is double clicked)
*/
// Variables to maintain current states
var station = null;
let precip_curr_view = ()=>{};
let temp_rf_curr_view = ()=>{};
let tmp_mon_lc_curr_view = ()=>{};
let sun_af_curr_data;

let chartsByStation = station => {
  precip_curr_view(station);
  temp_rf_curr_view(station);
  tmp_mon_lc_curr_view(station);
  sun_af_lc(sun_af_curr_data, station);
}

let resetChartsByStation = () => {
  station = null;
  chartsByStation(station);
}


/* 
Shared highlighting
*/
let highlightMonth = month => {
  precip_bars.highlightSelection([month]);
  tmp_v_rf_scat.highlightSelection([month], "month");
  tempOverMon_lc.highlightSelection([month], "month");
  sun_by_mon_lc.highlightSelection([month], "month");
  burst_chart.highlightSelection([month]);
}

/*
 Allows only the selected element in multiline chart to be highlighted whilst still performing shared highlighting with other charts
 */
let highlightMonth_fm_multiline = (ds, month) => {
  precip_bars.highlightSelection([month]);
  tmp_v_rf_scat.highlightSelection([month], "month");
  tempOverMon_lc.highlightSelection([ds, month], ["dataset", "month"]);
  sun_by_mon_lc.highlightSelection([month], "month");
  burst_chart.highlightSelection([month]);
}

let resetHighlightMonth = () => {
  precip_bars.highlightSelection([]);
  tmp_v_rf_scat.highlightSelection([]);
  tempOverMon_lc.highlightSelection([]);
  sun_by_mon_lc.highlightSelection([]);
  burst_chart.highlightSelection([]);
}

let highlightYear = year => {
  precip_bars.highlightSelection([year]);
  tmp_v_rf_scat.highlightSelection([year], "year");
  tempOverMon_lc.highlightSelection([year], "k");
}

/*
 Allows only the selected element in multiline chart to be highlighted whilst still performing shared highlighting with other charts
 */
 let highlightYear_fm_multiline = (ds, year) => {
  precip_bars.highlightSelection([year]);
  tmp_v_rf_scat.highlightSelection([year], "year");
  tempOverMon_lc.highlightSelection([ds, year], ["dataset", "k"]);
}
let resetHighlightYear = () => {
  precip_bars.highlightSelection([]);
  tmp_v_rf_scat.highlightSelection([]);
  tempOverMon_lc.highlightSelection([]);
}





/*
Barchart for monthly precipitation -month (x bars) by average precipitation (y axis)
*/

/*
Default view for precipitation bar chart - also resets to this on double click
k is month name
v is avg. rainfall
*/
function default_precip_bars(station) {
  precip_curr_view = (location)=>default_precip_bars(location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

  // Average rainfall by month
  let avgPerc_mon_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.mean(v, (d) => d.rain),
      (d) => d.month
    )
    .map((d) => {
      return { k: monthNames[d[0] - 1], v: d[1], x_title: station===null ? 'Month (All Years Avg.)' : 'Month - ' + station + ' Station (All Years Avg.)', y_title: "Avg. Rainfall (mm)"};
    });
  
  // Render, set tooltips and events
  station===null ?
  precip_bars.setTooltip((d) => `${d.k} Average Rainfall: <br>${f_2dp(d.v)} mm`)
  : precip_bars.setTooltip((d) => `${station} Station<br>${d.k} Average Rainfall: <br>${f_2dp(d.v)} mm`);
  precip_bars
    .setMouseover(highlightMonth)
    .setMouseout(resetHighlightMonth)
    .setClick((k)=>{
      precip_bars.mouseout();  // Triggers mouseout to unhighlight elements
      precipMonthOverYears(k, station)}, 'k')
    .setDblClick(()=>default_precip_bars(station))
    .render(avgPerc_mon_ds, {dom_y_max: max_precip_reading});
}


/* 
Second level view
Filters data by month passed, and groups by year
k is year
v is average rainfall
*/
function precipMonthOverYears(month, station) {
  precip_curr_view = (location)=>precipMonthOverYears(month, location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

  // Average rainfall by year
  let avgPerc_years_ds = d3
    .rollups(
      dataToGroup.filter(d => monthNames[d.month-1] === month),
      (v) => ({
        avgRain: d3.mean(v, (d) => d.rain),
      }),
      (d) => d.year
    )
    .map((d) => {
      return { k: d[0], v: d[1].avgRain, x_title: station===null ? 'Year (' + month + ' Avg.)': 'Year - ' + station + ' Station (' + month + ')', y_title: station===null ? "Avg. Rainfall (mm)" : 'Total Rainfall (mm)'}
    })
    
    station===null ? 
    precip_bars.setTooltip((d) => `${month} ${d.k} Average Rainfall: <br>${f_2dp(d.v)} mm`) 
      : precip_bars.setTooltip((d) => `${station} Station<br>${month} ${d.k} Total Rainfall: <br>${f_2dp(d.v)} mm`)
    precip_bars
    .setMouseover(highlightYear)
    .setMouseout(resetHighlightYear)
    .setClick((k) => {
      precip_bars.mouseout(); // Triggers mouseout to unhighlight elements
      precip_specificYear(k, station)}, 'k')
    .setDblClick(()=>default_precip_bars(station))
    .render(avgPerc_years_ds, {dom_y_max: max_precip_reading}); 
}


/*
Third level view
Filters data by specific year, and groups by month
k is month
v is average rainfall
*/
function precip_specificYear(year, station) {
  precip_curr_view = (location)=>precip_specificYear(year, location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

  // Average rainfall for specific year
  let avgPerc_specific_year_ds = d3
    .rollups(
      dataToGroup.filter(d => d.year === year),
      (v) => ({
        avgRain: d3.mean(v, (d) => d.rain),
      }),
      (d) => d.month
    )
    .map((d) => {
      return { k: monthNames[d[0]-1], v: d[1].avgRain, x_title: station===null ? 'Month (' + year + ' Avg.)': 'Month - ' + station + ' Station (' + year + ')', y_title: station===null ? "Avg. Rainfall (mm)" : "Total Rainfall (mm)"}
    })

  station===null ? 
  precip_bars.setTooltip((d) => `${d.k} ${year} Average Rainfall: <br>${f_2dp(d.v)} mm`) 
  : precip_bars.setTooltip((d) => `${station} Station<br>${d.k} ${year} Total Rainfall: <br>${f_2dp(d.v)} mm`) 
  precip_bars
    .setMouseover(highlightMonth)
    .setMouseout(resetHighlightMonth)
    .setClick((k)=>{
      precip_bars.mouseout();  // Triggers mouseout to unhighlight elements
      precipMonthOverYears(k, station)}, 'k')
    .setDblClick(()=>default_precip_bars(station))
    .render(avgPerc_specific_year_ds, {dom_y_max: max_precip_reading});
}

let precip_bars = new BarChart("div#precipByMon_bar");

default_precip_bars(station);

// Event listener for radio buttons to change axes scale
document.getElementById('precipRadios').addEventListener('change', (event) => {
  const selected = document.querySelector('input[name="precipAxes"]:checked').value;
  precip_bars.axesChange(selected, max_precip_reading);
});
 



/*
Scatter chart for temperature (x axis) vs rainfall (y axis), grouped by month
*/

/*
Default view for temp vs rainfall scatter - also resets to this on double click
k is avg. temp
v is avg. rainfall
*/
function default_tmp_rf(station) {
  temp_rf_curr_view = (location)=>default_tmp_rf(location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

  // Average rainfall and temperature by month
  let tmp_v_rf_ds = d3
    .rollups(
      dataToGroup,
      (v) => {
        return {
          avg_temp: d3.mean(v, (d) => d.avg_temp),
          avg_rain: d3.mean(v, (d) => d.rain),
        };
      },
      (d) => d.month
    )
    .map((d) => {
      return {
        month: monthNames[d[0] - 1],
        k: d[1].avg_temp,
        v: d[1].avg_rain,
        x_title: station===null ? "Avg. Temp (°c) - (All Years)" : "Avg. Temp (°c) - " + station + " Station (All Years)",
        y_title: "Avg. Rainfall (mm)"
      };
    });
    
  // Render, set tooltips and events
  station===null ?
  tmp_v_rf_scat.setTooltip((d)=>`${d.month} Averages - <br>Daily Temp: ${f_2dp(d.k)} °c <br>Rainfall: ${f_2dp(d.v)} mm`)
  : tmp_v_rf_scat.setTooltip((d)=>`${station} Station<br>${d.month} Averages - <br>Daily Temp: ${f_2dp(d.k)} °c <br>Rainfall: ${f_2dp(d.v)} mm`)
  tmp_v_rf_scat
    .setMouseover(highlightMonth)
    .setMouseout(resetHighlightMonth)
    .setClick((month)=>{
      tmp_v_rf_scat.mouseout(); // Triggers mouseout to unhighlight elements
      tmpRfScatOverYears(month, station)}, 'month')
    .setDblClick(()=>default_tmp_rf(station))
    .render(tmp_v_rf_ds, {highlight_attribute:"month", dom_x_max: max_avg_temp_reading, dom_y_max: max_precip_reading});
}


/*
Second level view
Filters data by month passed, and groups by year
k is avg temp
v is avg rainfall
*/
function tmpRfScatOverYears(month, station) {
  temp_rf_curr_view = (location)=>tmpRfScatOverYears(month, location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

   // Average rainfall and temperature by year
   let tmp_v_rf_ds = d3
   .rollups(
     dataToGroup.filter(d => monthNames[d.month-1] === month),
     (v) => {
       return {
         avg_temp: d3.mean(v, (d) => d.avg_temp),
         avg_rain: d3.mean(v, (d) => d.rain),
       };
     },
     (d) => d.year
   )
   .map((d) => {
     return {
       year: d[0],
       k: d[1].avg_temp,
       v: d[1].avg_rain,
       x_title: station===null ? "Avg. Temp (°c) - (" + month +")" : "Avg. Temp (°c) - " + station + " Station (" + month +")",
       y_title: station===null ? "Avg. Rainfall (mm)" : "Total Rainfall (mm)"
     };
   });
   
  // Render, set tooltips and events
  station===null ?
  tmp_v_rf_scat.setTooltip((d)=>`${month} ${d.year} Averages - <br>Daily Temp: ${f_2dp(d.k)} °c <br>Rainfall: ${f_2dp(d.v)} mm`)
  : tmp_v_rf_scat.setTooltip((d)=>`${station} Station<br>${month} ${d.year} - <br>Average Daily Temp: ${f_2dp(d.k)} °c <br>Total Rainfall: ${f_2dp(d.v)} mm`)
  tmp_v_rf_scat
    .setMouseover(highlightYear)
    .setMouseout(resetHighlightYear)
    .setClick((year)=>{
      tmp_v_rf_scat.mouseout(); // Triggers mouseout to unhighlight elements
      tmpRf_specificYear(year, station)}, 'year')
    .setDblClick(()=>default_tmp_rf(station))
    .render(tmp_v_rf_ds, {highlight_attribute:"year", dom_x_max: max_avg_temp_reading, dom_y_max: max_precip_reading});
}


/*
Third level view
Filters data by specific year, and groups by month
k is avg temp
v is avg rainfall
*/
function tmpRf_specificYear(year, station) {
  temp_rf_curr_view = (location)=>tmpRf_specificYear(year, location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

   // Average rainfall and temperature by year
   let tmp_v_rf_ds = d3
   .rollups(
     dataToGroup.filter(d => d.year === year),
     (v) => {
       return {
         avg_temp: d3.mean(v, (d) => d.avg_temp),
         avg_rain: d3.mean(v, (d) => d.rain),
       };
     },
     (d) => d.month
   )
   .map((d) => {
     return {
       month: monthNames[d[0]-1],
       k: d[1].avg_temp,
       v: d[1].avg_rain,
       x_title: station===null ? "Avg. Temp (°c) - (" + year +")" : "Avg. Temp (°c) - " + station + " Station (" + year +")",
       y_title: station===null ? "Avg. Rainfall (mm)" : "Total Rainfall (mm)"
     };
   });
   
  // Render, set tooltips and events
  station===null ?
  tmp_v_rf_scat.setTooltip((d)=>`${d.month} ${year} Averages - <br>Daily Temp: ${f_2dp(d.k)} °c <br>Rainfall: ${f_2dp(d.v)} mm`)
  : tmp_v_rf_scat.setTooltip((d)=>`${station} Station<br>${year} ${d.month} - <br>Average Daily Temp: ${f_2dp(d.k)} °c <br>Total Rainfall: ${f_2dp(d.v)} mm`)
  tmp_v_rf_scat
     .setMouseover(highlightMonth)
     .setMouseout(resetHighlightMonth)
    .setClick((month)=>{
      tmp_v_rf_scat.mouseout(); // Triggers mouseout to unhighlight elements
      tmpRfScatOverYears(month, station)}, 'month')
    .setDblClick(()=>default_tmp_rf(station))
    .render(tmp_v_rf_ds, {highlight_attribute:"month", dom_x_max: max_avg_temp_reading, dom_y_max: max_precip_reading});
}

let tmp_v_rf_scat = new Scatter("div#tmpRf_scat");

default_tmp_rf(station);

// Event listener for radio buttons to change axes scale
document.getElementById('scatRadios').addEventListener('change', (event) => {
  const selected = document.querySelector('input[name="scatAxes"]:checked').value;
  tmp_v_rf_scat.axesChange(selected, max_avg_temp_reading, max_precip_reading);
});




/* 
Multi-line chart for average temp trends by month - average, max recorded and min recorded lines - month (x axis) temp (y axis), grouped by month
*/

/*
Default view for multi-line chart - also resets to this on double click
k is month
v is temp
*/
function default_tmp_mon_lc(station) {
  tmp_mon_lc_curr_view = (location)=>default_tmp_mon_lc(location);
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

  // Mean average daily temp recorded by month
  let avgTempData_mon_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.mean(v, (d) => d.avg_temp),
      (d) => d.month
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: "Mean Average<br>Daily Temp", dataset: "Avg.", x_title: station===null ? "Month (All Years)" : "Month - " + station + " Station (All Years)", y_title: "Temperature (°c)"};
    });

  // Lowest average daily temp on record by year
  let minTempData_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.min(v, (d) => d.min_temp),
      (d) => d.month
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: "Lowest on Record<br>Avg. Daily Temp", dataset: "Lows", x_title: station===null ? "Month (All Years)" : "Month - " + station + " Station (All Years)", y_title: "Temperature (°c)"};
    });

  // Highest average daily temp on record by month
  let maxTempData_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.max(v, (d) => d.max_temp),
      (d) => d.month
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: "Highest on Record<br>Avg. Daily Temp", dataset: "Highs", x_title: station===null ? "Month (All Years)" : "Month - " + station + " Station (All Years)", y_title: "Temperature (°c)"};
    });

  // Combine datasets
  let tempsBy_mon_ds = [avgTempData_mon_ds, minTempData_ds, maxTempData_ds];

  let local_y_dom_min = lowest_min_temp_reading;
  let local_y_dom_max = highest_max_temp_reading;
  let local_y_dom_zero = true;

  // Only applies max data value to y axis if scaled axes radio is checked
  const scaledAxesRadio = document.getElementById('scaledAxes_ml');
  if (scaledAxesRadio.checked) {
      local_y_dom_min = undefined;
      local_y_dom_max = undefined;
      local_y_dom_zero=false;
  };

  // Render, set tooltips and events
  station=== null ?
  tempOverMon_lc.setTooltip_dots((d)=>`${monthNames[d.k-1]} ${d.descrption}: ${f_2dp(d.v)} °c`)
  :  tempOverMon_lc.setTooltip_dots((d)=>`${station} Station<br>${monthNames[d.k-1]} ${d.descrption}: ${f_2dp(d.v)} °c`);
  tempOverMon_lc
    .setTooltip_lines((d)=>`Month ${d[0].dataset}`)
    .setMouseover(highlightMonth_fm_multiline, ["dataset", "month"])
    .setMouseout(resetHighlightMonth)
    .setClick((month) => {
      tempOverMon_lc.mouseout(); // Triggers mouseout to unhighlight elements
      temp_mon_lc_monthOverYears(month, station)}, 'month')
    .setDblClick(()=>default_tmp_mon_lc(station))
    .render(tempsBy_mon_ds, {
      include_x_domain_zero: false,
      include_y_domain_zero: local_y_dom_zero,
      axis_pad: [1, 1, 1, 1],
      x_tick_format: (month)=>monthNames[month-1],
      dom_y_min: local_y_dom_min,
      dom_y_max: local_y_dom_max
    });
}


/*
Second level view for multi line chart
Filters data by month passed, and groups by year
k is year
v is average temp
*/
function temp_mon_lc_monthOverYears(month, station) {
  tmp_mon_lc_curr_view = (location)=>temp_mon_lc_monthOverYears(month, location);
  let dataToGroup = weatherData
            .filter(d => station === null || d.station === station)
            .filter(d => monthNames[d.month-1] === month);

  // Mean average daily temp recorded by month
  let avgTempData_mon_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.mean(v, (d) => d.avg_temp),
      (d) => d.year
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: "Mean Average<br>Daily Temp", dataset: "Avg.", x_title: station===null ? "Year (" + month + " Avg.)" : "Year - " + station + " Station (" + month + ")", y_title: "Temperature (°c)"};
    });

  // Lowest average daily temp on record by year
  let minTempData_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.min(v, (d) => d.min_temp),
      (d) => d.year
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: station===null ? "Lowest on Record<br>Avg. Daily Temp" : "<br>Lowest Daily Temp", dataset: "Lows", x_title: station===null ? "Year (" + month + " Avg.)" : "Year - " + station + " Station (" + month + ")", y_title: "Temperature (°c)"};
    });

  // Highest average daily temp on record by month
  let maxTempData_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.max(v, (d) => d.max_temp),
      (d) => d.year
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: station===null ? "Highest on Record<br>Avg. Daily Temp" : "<br>Highest Daily Temp", dataset: "Highs", x_title: station===null ? "Year (" + month + " Avg.)" : "Year - " + station + " Station (" + month + ")", y_title: "Temperature (°c)"};
    });

  // Combine datasets
  let tempsBy_mon_ds = [avgTempData_mon_ds, minTempData_ds, maxTempData_ds];

  let local_y_dom_min = lowest_min_temp_reading;
  let local_y_dom_max = highest_max_temp_reading;
  let local_y_dom_zero = true;

  // Only applies max data value to y axis if scaled axes radio is checked
  const scaledAxesRadio = document.getElementById('scaledAxes_ml');
  if (scaledAxesRadio.checked) {
      local_y_dom_min = undefined;
      local_y_dom_max = undefined;
      local_y_dom_zero=false;
  };

  // Render, set tooltips and events
  station=== null ?
  tempOverMon_lc.setTooltip_dots((d)=>`${month} ${d.k} ${d.descrption}: ${f_2dp(d.v)} °c`)
  :  tempOverMon_lc.setTooltip_dots((d)=>`${station} Station<br>${month} ${d.k} ${d.descrption}: ${f_2dp(d.v)} °c`);
  tempOverMon_lc
    .setTooltip_lines((d)=>`Year ${d[0].dataset}`)
    .setMouseover(highlightYear_fm_multiline, ["dataset", "k"])
    .setMouseout(resetHighlightYear)
    .setClick((k) => {
      tempOverMon_lc.mouseout(); // Triggers mouseout to unhighlight elements
      temp_mon_lc_specificYear(k, station)}, 'k')
    .setDblClick(()=>default_tmp_mon_lc(station))
    .render(tempsBy_mon_ds, {
      include_x_domain_zero: false,
      include_y_domain_zero: local_y_dom_zero,
      axis_pad: [1, 1, 1, 1],
      dom_y_min: local_y_dom_min,
      dom_y_max: local_y_dom_max
    });
}


/*
Third level view for multi line chart
Filters data by specific year, and groups by month
k is month
v is average temp
*/
function temp_mon_lc_specificYear(year, station) {
  tmp_mon_lc_curr_view = (location)=>temp_mon_lc_specificYear(year, location);
  let dataToGroup = weatherData
            .filter(d => station === null || d.station === station)
            .filter(d => d.year === year);

  // Mean average daily temp recorded by month
  let avgTempData_mon_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.mean(v, (d) => d.avg_temp),
      (d) => d.month
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: "Mean Average<br>Daily Temp", dataset: "Avg.", x_title: station===null ? "Month (" + year + ")" : "Month - " + station + " Station (" + year + ")", y_title: "Temperature (°c)"};
    });

  // Lowest average daily temp on record by year
  let minTempData_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.min(v, (d) => d.min_temp),
      (d) => d.month
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: station===null ? "Lowest on Record<br>Avg. Daily Temp" : "<br>Lowest Daily Temp", dataset: "Lows", x_title: station===null ? "Month (" + year + ")" : "Month - " + station + " Station (" + year + ")", y_title: "Temperature (°c)"};
    });

  // Highest average daily temp on record by month
  let maxTempData_ds = d3
    .rollups(
      dataToGroup,
      (v) => d3.max(v, (d) => d.max_temp),
      (d) => d.month
    )
    .map((d) => {
      return { k: d[0], v: d[1], month: monthNames[d[0]-1], descrption: station===null ? "Highest on Record<br>Avg. Daily Temp" : "<br>Highest Daily Temp", dataset: "Highs", x_title: station===null ? "Month (" + year + ")" : "Month - " + station + " Station (" + year + ")", y_title: "Temperature (°c)"};
    });

  // Combine datasets
  let tempsBy_mon_ds = [avgTempData_mon_ds, minTempData_ds, maxTempData_ds];

  let local_y_dom_min = lowest_min_temp_reading;
  let local_y_dom_max = highest_max_temp_reading;
  let local_y_dom_zero = true;

  // Only applies max data value to y axis if scaled axes radio is checked
  const scaledAxesRadio = document.getElementById('scaledAxes_ml');
  if (scaledAxesRadio.checked) {
      local_y_dom_min = undefined;
      local_y_dom_max = undefined;
      local_y_dom_zero=false;
  };

  // Render, set tooltips and events
  station=== null ?
  tempOverMon_lc.setTooltip_dots((d)=>`${monthNames[d.k-1]} ${year} ${d.descrption}: ${f_2dp(d.v)} °c`)
  :  tempOverMon_lc.setTooltip_dots((d)=>`${station} Station<br>${monthNames[d.k-1]} ${year} ${d.descrption}: ${f_2dp(d.v)} °c`);
  tempOverMon_lc
    .setTooltip_lines((d)=>`Month ${d[0].dataset}`)
    .setMouseover(highlightMonth_fm_multiline, ["dataset", "month"])
    .setMouseout(resetHighlightMonth)
    .setClick((month) => {
      tempOverMon_lc.mouseout(); // Triggers mouseout to unhighlight elements
      temp_mon_lc_monthOverYears(month, station)}, 'month')
    .setDblClick(()=>default_tmp_mon_lc(station))
    .render(tempsBy_mon_ds, {
      include_x_domain_zero: false,
      include_y_domain_zero: local_y_dom_zero,
      axis_pad: [1, 1, 1, 1],
      x_tick_format: (month)=>monthNames[month-1],
      dom_y_min: local_y_dom_min,
      dom_y_max: local_y_dom_max
    });
}

// Create instance of linechart
let tempOverMon_lc = new LineChart("div#tempMon_line");

default_tmp_mon_lc(station);

// Event listener for radio buttons to change axes scale
document.getElementById('mlRadios').addEventListener('change', (event) => {
  const selected = document.querySelector('input[name="mlAxes"]:checked').value;
  let format_x_if_months = (month)=>{return month>13 ? month : monthNames[month-1]};
  tempOverMon_lc.axesChange(selected, lowest_min_temp_reading, highest_max_temp_reading, [1, 1, 1, 1], format_x_if_months);
});

 


/* 
Line chart for sunshine hours or air frost days over months - month (x axis ) by total average sunshine hours or air frost days (y axis)
k is month
v is sunshine hours or air frost days
*/
function sun_af_lc(load_dataset, station) {
  sun_af_curr_data = load_dataset;
  let dataToGroup = weatherData.filter(d => station === null || d.station === station);

  // Average sun by month
  let sunAf_by_mon_ds = d3
    .rollups(
      dataToGroup,
      (v) => {
        return {
          avg_sunAf: d3.mean(v, (d) => d[`${load_dataset}`]),
        };
      },
      (d) => d.month
    )
    .map((d) => {
      return {
        k: d[0],
        v: d[1].avg_sunAf,
        month: monthNames[d[0] - 1],
        dataset: load_dataset==="sun" ? "Monthly Avg. Sun Hours" : "Monthly Avg. Air Frost Days",
        x_title: station===null ? "Month (All Years)" : "Month - " + station + " Station (All Years)",
        y_title: load_dataset==="sun" ? "Sun Hours" : "Air Frost Days"
      };
    });

  // Render, set tooltips and events
  sun_by_mon_lc
    .setTooltip_dots((d) => load_dataset==="sun" ? `${d.month} Average Sun:<br>${f_2dp(d.v)} Hours` : `${d.month} Average Air Frost:<br>${f_2dp(d.v)} Days`)
    .setTooltip_lines((d) => `${d[0].dataset}`)
    .setMouseover(highlightMonth, "month")
    .setMouseout(resetHighlightMonth)
    .render(sunAf_by_mon_ds, {
      include_labels: false,
      x_tick_format: (month)=>monthNames[month-1],
      axis_pad: [0, 1, 0, 0],
      curve_type: 'curveMonotoneX'
    });
}

  
// Create instance of linechart
let sun_by_mon_lc = new LineChart("div#sunByMon_line");

sun_af_lc("sun", station);


// Event listener for dropdown data selection
const lc_dropdown = document.getElementById('lineDropdown');
lc_dropdown.addEventListener('change', (event) => {
  sun_af_lc(lc_dropdown.value, station);
});





/*
Bubble chart over map for Avg. Temp by location, stations plotted on map with average temp = size
k is station (binding key)
lon is longitude (horizontal position)
lat is latitude (vertical position)
r is average temp
*/

// Average temperature grouped by station
// Larger bubbles will be placed behind smaller ones (i.e those with higher avg. temp will be under other stations)
let tmp_by_loc_ds = d3
  .rollups(
    weatherData,
    (v) => {
      return {
        lat: v[1].lat,
        lon: v[1].lon,
        temp: d3.mean(v, (d) => d.avg_temp),
        num_records: v.length
      };
    },
    (d) => d.station
  )
  .map((d) => {
    return {
      k: d[0],
      lon: d[1].lon,
      lat: d[1].lat,
      r: d[1].temp,
      num_records: d[1].num_records,
      x_title: "Longitude",
      y_title: "Latitude"
    };
  });


let tmp_by_loc_bubb = new Map("div#map");

tmp_by_loc_bubb
  .setTooltip(
    (d) =>
      `${d.k} (${d.lat}, ${d.lon}) -<br>Number of Records: ${d.num_records}<br>Avgerage Temp: ${f_2dp(
        d.r
      )} °c`
  )
  .setMouseover((k) => {
    tmp_by_loc_bubb.highlightSelection([k]);
  })
  .setMouseout((k) => {
    tmp_by_loc_bubb.highlightSelection();
  })
  .setClick((k)=>{
    tmp_by_loc_bubb.selectionStroke(k);
    station = k;
    chartsByStation(k);
  })
  .setDblClick(()=>{
    tmp_by_loc_bubb.selectionStroke()
    station = null;
    resetChartsByStation();
  })
  .render(tmp_by_loc_ds);




/*
Sunburst chart. Inner ring represents months of year split by positionSplit (north/south or east/west), outer ring segments represent different weather parameters
Pie chart in centre show distribution of data for sunburst

Burst major keys:
k is relevant attribute value (month, af_days, rain etc)
v is normalised value at child  - determines size of parent node segments
original value at child nodes can be obtained with key 'value'

Pie keys:
k is group (north/south or east/west)
v is number of records in group
*/
  
// Function to format aggregated data into hierarchical structure for sunburst part of chart 
function formatBurstData(data) {
  let data_f= {
    k: 'burst', // Name of the dataset
    children: data.flatMap(([pos_cat, months]) => 
        months.map(([month, values]) => ({
          k: monthNames[month-1],
          attr: 'month',
          tt: monthNames[month-1] + ' Averages for the ' + pos_cat,
          pos_cat: pos_cat,
          month: monthNames[month-1],
          children: [
            { 
              k: 'af_days ' + monthNames[month-1], 
              attr: 'af_days',
              pos_cat: pos_cat, 
              month: monthNames[month-1], 
              value: values.avgAfDays,
              v: normaliseData(values.avgAfDays, 'af_days'), 
              tt: monthNames[month-1] + ' Average (' + pos_cat + ') -<br>Air Frost: ' + f_2dp(values.avgAfDays) + ' days'
            },
            { 
              k: 'rain ' + monthNames[month-1], 
              attr: 'rain', 
              pos_cat: pos_cat, 
              month: monthNames[month-1], 
              value: values.avgRain,
              v: normaliseData(values.avgRain, 'rain'), 
              tt: monthNames[month-1] + ' Average (' + pos_cat + ') -<br>Rainfall: ' + f_2dp(values.avgRain) + ' mm'
            },
            { 
              k: 'sun ' + monthNames[month-1], 
              attr: 'sun',
              pos_cat: pos_cat, 
              month: monthNames[month-1],
              value: values.avgSun,
              v: normaliseData(values.avgSun, 'sun'),
              tt: monthNames[month-1] + ' Average (' + pos_cat + ') -<br>Sun: ' + f_2dp(values.avgSun) + ' hours'
            },
            { 
              k: 'avg_temp ' + monthNames[month-1], 
              attr: 'avg_temp', 
              pos_cat: pos_cat, 
              month: monthNames[month-1], 
              value: values.avgTemp,
              v: normaliseData(values.avgTemp, 'avg_temp'), 
              tt: monthNames[month-1] + ' Average (' + pos_cat + ') -<br>Temp: ' + f_2dp(values.avgTemp) + ' °c'
            },
          ],
        })),
    ),
  };
  return data_f;
}
  

// Aggregates data for sunburst to group by north and south around central location
let burst_ds = d3
  .rollups(
    weatherData,
    (v) => ({
      avgAfDays: d3.mean(v, (d) => d.af_days),
      avgRain: d3.mean(v, (d) => d.rain),
      avgSun: d3.mean(v, (d) => d.sun),
      avgTemp: d3.mean(v, (d) => d.avg_temp)
    }),
    (d) => (d.lat >= horizontalSplit ? 'North' : 'South'), // Group by north or south based on latitude
    (d) => d.month
  )

// Find the index of the "South" group
const southIndex = burst_ds.findIndex(([group]) => group === 'South');

// Reverse "South" order of arrays (so months align for burst chart)
burst_ds[southIndex][1].reverse();

// Puts North dataset first so on top part of sunburst
if (southIndex === 0) {
  burst_ds.reverse();
}

// Format data
let burst_f_ds = formatBurstData(burst_ds);

// 
let pie_data = d3
  .rollups(
    weatherData,
    (v) =>  {
      return {
        num_records: v.length,
        num_stations: (new Set(v.map(d=>d.station))).size
      };
    },
    (d) => (d.lat >= horizontalSplit ? 'North' : 'South'), // Group by north or south based on latitude
  )
    .map((d) => {
      return { k: d[0], v: d[1].num_records, num_stations: d[1].num_stations, tt: String(d[0]) + ' -<br>Stations: ' + String(d[1].num_stations) + '<br>Data Points: ' + String(d[1].num_records), split_type: 'lat', split: horizontalSplit };
    });


// Puts North datapoints first so top of pie
if (pie_data[0].k === 'South') {
  pie_data.reverse();
}


// Append pie_data to burst_f_ds with key"centreData"
burst_f_ds['centreData'] = pie_data;



// Alt dataset for east west split

// Aggregates data for sunburst to group by east and west around central location
let burst_alt = d3
  .rollups(
    weatherData,
    (v) => ({
      avgAfDays: d3.mean(v, (d) => d.af_days),
      avgRain: d3.mean(v, (d) => d.rain),
      avgSun: d3.mean(v, (d) => d.sun),
      avgTemp: d3.mean(v, (d) => d.avg_temp)
    }),
    (d) => (d.lon >= verticalSplit ? 'East' : 'West'), // Group by east or west based on longitude
    (d) => d.month
  )

// Find the index of the "West" group
const westIndex = burst_alt.findIndex(([group]) => group === 'West');

// Reverse "West" order of arrays (so months align for burst chart)
burst_alt[westIndex][1].reverse();

// Puts East dataset first so on right part of sunburst
if (westIndex === 0) {
  burst_alt.reverse();
}

// Format data
let burst_f_alt = formatBurstData(burst_alt);

// 
let pie_data_alt = d3
  .rollups(
    weatherData,
    (v) =>  {
      return {
        num_records: v.length,
        num_stations: (new Set(v.map(d=>d.station))).size
      };
    },
    (d) => (d.lon >= verticalSplit ? 'East' : 'West'), // Group by east or west based on longitude
  )
    .map((d) => {
      return { k: d[0], v: d[1].num_records, num_stations: d[1].num_stations, tt: String(d[0]) + ' -<br>Stations: ' + String(d[1].num_stations) + '<br>Data Points: ' + String(d[1].num_records), split_type: 'lon', split: verticalSplit };
    });


// Puts East datapoints first so right of pie
if (pie_data_alt[0].k === 'West') {
  pie_data_alt.reverse();
}


// Append pie_data to burst_f_ds with key"centreData"
burst_f_alt['centreData'] = pie_data_alt;

let burst_chart = new Pieburst("div#burst");

burst_chart
.setTooltip(
  (d) =>
    `${d.data.tt}`
)
.setMouseover(highlightMonth)
.setMouseout(resetHighlightMonth)
.setClick((k)=>burst_chart.swapData([k], ['North', 'South', 'East', 'West']))
.render(burst_f_alt,  // alt dataset passed first as synthetic click switches on load (to ensure map bubbles are loaded and coloured)
  {
    pieCentre:true,
    inner_colour_attr:"pos_cat", 
    leaf_colour_attr:"attr", 
    cat_colours:["#FF6666", "#8FBC8F"],
    leaf_colours:["#A9A9A9", "#4E6E82", "#FDB827", "#FF6347"],
    pie_colours:["#FF0000", "#33a02c"],
    alt_data: {
      data:burst_f_ds, 
      pieCentre:true, 
      inner_colour_attr:"pos_cat", 
      leaf_colour_attr: "attr",
      spin_burst:"-90",
      cat_colours:["#6FA4D5", "#ffc07e"],
      leaf_colours:["#A9A9A9", "#4E6E82", "#FDB827", "#FF6347"],
      pie_colours:["#1f78b4", "#ff7f0e"]
    }
  });




  
/* 
Synthetically clicks pie center which colours map bubbles
*/
document.querySelector('path.pie').dispatchEvent(new Event('click'));