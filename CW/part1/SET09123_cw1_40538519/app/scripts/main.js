"use strict";

// Imports classes
import BarChart from "./BarChart.js";
import BubbleChart from "./BubbleChart.js";
import LineChart from "./LineChart.js";
import Pienut from "./Pienut.js";
import Scatter from "./Scatter.js";

/*
To improve:
- add shared highlighting
- FIXED bubble chart flashing of highlighting and tooltips
- FIXED singled line chart line data for tooltip coming from dots
- fix tool tips for lineChart when multiple lines, for dots, highlighting all elements with same x value, for lines, highlighting all lines
- change dashboard dimentions to be responsive (difficult as charts are build on specific dimentions such as the scales are [0, chartWidth])
- add titles to charts
- add a horizontal line for multi line temperature chart to show 0 point
- colour bubbles based on region
- possibly improve how everything looks - look at css files, change text size/font colours used?
*/

// Loading data from a file
async function loadData() {
  try {
    let dataset = await d3.csv("data/SET09123_IDV_CW_dataset.csv", (d) => {
      return {
        /*
                name	    lon	        lat	        region	year	month	max_temp(c)	min_temp(c)	af_days	    rain(mm)sun
                Aberporth	-4.56999	52.13914	Wales	2007	1	    9.5	        5.5	        0	        94.8	57.5
                Aberporth	-4.56999	52.13914	Wales	2007	2	    8.8	        4	        2	        91.9	87.6
                Aberporth	-4.56999	52.13914	Wales	2007	3	    9.5	        4.4	        0	        69	    151.6
                Aberporth	-4.56999	52.13914	Wales	2007	4	    13.8	    7.4	        0	        9.8	    235.1
                Aberporth	-4.56999	52.13914	Wales	2007	5	    14.3	    8.5	        0	        81.8	216.8
                Aberporth	-4.56999	52.13914	Wales	2007	6	    16.9	    11.6	    0	        92.1	158.2
                Aberporth	-4.56999	52.13914	Wales	2007	7	    16.7	    11.8	    0	        155.2	181.2
                Aberporth	-4.56999	52.13914	Wales	2007	8	    17	        12.3	    0	        59.4	175.1
                Aberporth	-4.56999	52.13914	Wales	2007	9	    16.1	    11.6	    0	        57.4	147.8
                Aberporth	-4.56999	52.13914	Wales	2007	10	    14	        9.2	        0	        28.8	117.7
                Aberporth	-4.56999	52.13914	Wales	2007	11	    10.8	    6.8	        1	        48.6	52.9
                Aberporth	-4.56999	52.13914	Wales	2007	12	    8.7	        3.6	        7	        103.6	74.4
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

    return dataset;
  } catch (error) {
    console.error("An error occurred loading the data:", error);
  }
}

// Need to wait for async functions
let weatherData = await loadData();



// Custom locale number formats
let enUK = d3.formatLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["£", ""],
});
let formatGBP = enUK.format("$,.2f");
let f_2dp = d3.format(".2f"); // Formats to 2 decimal places



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



// Shared highlighting
let highlightMonth = month => {
  tempOverMon_lc.highlightSelection([month]);
  precip_bars.highlightSelection([month]);
  tmp_v_rf_scat.highlightSelection([month]);
  season_dist_pie.highlightSelection([month]);
  sun_by_mon_lc.highlightSelection([month]);
}
// specific highlighting for multi line chart (so as not to select all month dots on the chart)
let highlightMonth_ml = month => {
  precip_bars.highlightSelection([month]);
  tmp_v_rf_scat.highlightSelection([month]);
  season_dist_pie.highlightSelection([month]);
  sun_by_mon_lc.highlightSelection([month]);
}
let resetHighlightMonth = () => {
  tempOverMon_lc.highlightSelection();
  precip_bars.highlightSelection();
  tmp_v_rf_scat.highlightSelection();
  season_dist_pie.highlightSelection();
  sun_by_mon_lc.highlightSelection();
}





/* 
Line chart for average temp trends by month - average, max recorded and min recorded lines - month (x axis) temp (y axis), grouped by month
*/
// Mean average daily temp recorded by month
let avgTempData_mon_ds = d3
  .rollups(
    weatherData,
    (v) => d3.mean(v, (d) => d.avg_temp),
    (d) => d.month
  )
  .map((d) => {
    return { month: d[0], temp: d[1], dataset: "Average" };
  });

// Lowest average daily temp recorded by year
let minTempData_ds = d3
  .rollups(
    weatherData,
    (v) => d3.min(v, (d) => d.min_temp),
    (d) => d.month
  )
  .map((d) => {
    return { month: d[0], temp: d[1], dataset: "Lowest" };
  });

// Highest average daily temp recorded by month
let maxTempData_ds = d3
  .rollups(
    weatherData,
    (v) => d3.max(v, (d) => d.max_temp),
    (d) => d.month
  )
  .map((d) => {
    return { month: d[0], temp: d[1], dataset: "Highest" };
  });

// Combine datasets
let tempsBy_mon_ds = [avgTempData_mon_ds, minTempData_ds, maxTempData_ds];

// Create instance of linechart
let tempOverMon_lc = new LineChart("div#tempMon_line");

// Render, set tooltips and events
tempOverMon_lc
  .render(tempsBy_mon_ds, "month", "temp", ["Avg.", "Lows", "Highs"], {
    x_title: "Month",
    y_title: "Temperature (°c)",
    include_x_domain_zero: false,
    axis_pad: [1, 1, 0, 0],
    curve_type: "curveNatural",
    line_ia_key: "dataset"
  })
  .setTooltip((d) => `${monthNames[d.month-1]} ${d.dataset}: ${f_2dp(d.temp)} °c`)
  .highlightSelectionPoint()
  .setTooltipLine((d, i) => `Month ${tempOverMon_lc.line_groups[i]}`)
  .highlightEventsLine();
  

  // changes x axis values to month names
  tempOverMon_lc.axis_x
  .call(d3.axisBottom(tempOverMon_lc.scale_x)
    .tickValues(monthNames.map((month, i) => i + 1))
    .tickFormat((d, i) => monthNames[i])
  );

  


/*
Barchart for monthly precipitation - average precipitation (y axis) by month (x bars)
*/
// Average rainfall by month
let avgPerc_mon_ds = d3
  .rollups(
    weatherData,
    (v) => d3.mean(v, (d) => d.rain),
    (d) => d.month
  )
  .map((d) => {
    return { month: monthNames[d[0] - 1], rain: d[1] };
  });

let precip_bars = new BarChart("div#precipByMon_bar");

// Render, set tooltips and events
precip_bars
  .render(avgPerc_mon_ds, "month", "rain", {
    x_title: "Month",
    y_title: "Avg. Rainfall (mm)"
  })
  .setTooltip((d) => `${d.month} Rainfall: ${f_2dp(d.rain)} mm`)
  .setMouseover(highlightMonth)
  .setMouseout(resetHighlightMonth);
  // .setMouseover((k) => {
  //   precip_bars.highlightSelection([k]);
  // })
  // .setMouseout((k) => {
  //   precip_bars.highlightSelection();
  // });




/*
Bubble chart for Temp by location, long (x-axis), lat (y-axis), average temp = size, also want station name
*/

// Average temperature grouped by latitude then longitude, contains station name also
// Larger bubbles will be placed behind smaller ones (i.e those with higher avg. temp will be under other stations)
let tmp_by_loc_ds = d3
  .rollups(
    weatherData,
    (v) => {
      return {
        station: v[1].station,
        lon: v[1].lon,
        temp: d3.mean(v, (d) => d.avg_temp),
      };
    },
    (d) => d.lat,
    (d) => d.lon
  )
  .map((d) => {
    return {
      lat: d[0],
      lon: d[1][0][1].lon,
      station: d[1][0][1].station,
      temp: d[1][0][1].temp,
    };
  });

let tmp_by_loc_bubb = new BubbleChart("div#tmpByLoc_bubb");

tmp_by_loc_bubb
  .render(tmp_by_loc_ds, "station", "lon", "lat", "temp", {
    x_title: "Longitude",
    y_title: "Latitude",
    include_y_domain_zero: false,
    axis_pad: [0, 0, 1, 0],
    size_factor: 1.4
  })
  .setTooltip(
    (d) =>
      `${d.station} - Lat: ${d.lat} Lon: ${d.lon} Avg. Temp: ${f_2dp(
        d.temp
      )} °c`
  )
  .setMouseover((k) => {
    tmp_by_loc_bubb.highlightSelection([k]);
  })
  .setMouseout((k) => {
    tmp_by_loc_bubb.highlightSelection();
  });

 


/*
Scatter chart for temperature (x axis) vs rainfall (y axis), grouped by month
*/
// Average rainfall and temperature by month
let tmp_v_rf_ds = d3
  .rollups(
    weatherData,
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
      temp: d[1].avg_temp,
      rain: d[1].avg_rain
    };
  });

// Data, x_key, y_key, group_titles = [],
let tmp_v_rf_scat = new Scatter("div#tmpRf_scat");

// Render, set tooltips and events
tmp_v_rf_scat
  .render(
    tmp_v_rf_ds,
    "temp",
    "rain",
    ["Temp Vs Rainfall"],
    { x_title: "Avg. Temperature (°c)", y_title: "Avg. Rainfall (mm)" },
    false
  )
  .setTooltip(
    (d) =>
      `${d.month} Averages - Temp: ${f_2dp(d.temp)} °c Rainfall: ${f_2dp(
        d.rain
      )} mm`
  )
  .setMouseover((k) => {
    tmp_v_rf_scat.highlightSelection([k]);
  })
  .setMouseout((k) => {
    tmp_v_rf_scat.highlightSelection();
  });

  


/* 
Pie chart for seasonal distribution of data, grouped into segments by month 
(spring - march,april,may) (summer - June, july, august) (Autumn - sep, oct, nov) (Winter - dec, jan, feb)
*/
function monthToSeason(month) {
  if (month >= 3 && month <= 5) {
    return "Spring";
  } else if (month >= 6 && month <= 8) {
    return "Summer";
  } else if (month >= 9 && month <= 11) {
    return "Autumn";
  } else {
    return "Winter";
  }
}

// Number of datapoints per season
let season_dist_ds = d3
  .rollups(
    weatherData,
    (v) => v.length,
    (d) => monthToSeason(d.month)
  )
  .map((d) => {
    return { season: d[0], data_points: d[1] };
  });

let season_dist_pie = new Pienut("div#seasonDist_pi", 65);

// Render, set tooltips and events
season_dist_pie
  .render(season_dist_ds, "season", "data_points", {
    inner_r_factor: 0.2,
    outer_r_factor: 0.7
  })
  .setTooltip((d) => `${d.season} Data Points: ${d.data_points}`)
  .setMouseover((k) => {
    season_dist_pie.highlightSelection([k]);
  })
  .setMouseout((k) => {
    season_dist_pie.highlightSelection();
  });

 


/* 
Line chart for sunshine hours over months - month (x axis ) by total average sunshine hours (y axis)
*/

// Average sun by month
let sun_by_mon_ds = d3
  .rollups(
    weatherData,
    (v) => {
      return {
        avg_sun: d3.mean(v, (d) => d.sun),
      };
    },
    (d) => d.month
  )
  .map((d) => {
    return {
      month_name: monthNames[d[0] - 1],
      month: d[0],
      sun: d[1].avg_sun,
    };
  });

// Create instance of linechart
let sun_by_mon_lc = new LineChart("div#sunByMon_line");

// Render, set tooltips and events
sun_by_mon_lc
  .render(sun_by_mon_ds, "month", "sun", ["Monthly Avg. Sun Hours"], {
    x_title: "Month",
    y_title: "Sun Hours",
    include_labels: false,
    axis_pad: [0, 1, 0, 0],
    curve_type: "curveNatural"
  })
  .setTooltip((d) => `${d.month_name} Average Sun: ${f_2dp(d.sun)} Hours`)
  .setMouseover((k) => {
    sun_by_mon_lc.highlightSelection([k]);
  })
  .setMouseout((k) => {
    sun_by_mon_lc.highlightSelection();
  })
  .setTooltipLine((d, i) => `${sun_by_mon_lc.line_groups[i]}`)
  .highlightEventsLine();
  
// changes x axis values to month names
sun_by_mon_lc.axis_x
.call(d3.axisBottom(sun_by_mon_lc.scale_x)
  .tickValues(monthNames.map((month, i) => i + 1))
  .tickFormat((d, i) => monthNames[i])
);
  









//   Other plot ideas for exploration:

/* scatter average temp vs lat - lat (x axis) by temp (lat)
group by lattitude
for each group calculate average temp
format to add c to temp
plot

if can get scatter working properly, can extend this to show min and max in different colours
*/

/* box plot for temp distribution by region - region (x axis) by temp (y axis)
group by region
For each region, calculate the statistics needed to create the box plot, such as the minimum, maximum, median, and quartiles.
plot
*/
