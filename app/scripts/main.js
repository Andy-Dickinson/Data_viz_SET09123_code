// building charts from classes

'use strict';

// imports classes
import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import LineChart from './LineChart.js';

let dogsData = [{breed:'Golden Retriever', count:8653, weight: 39.5, height: 56},
    {breed:'Alaskan Malamute', count:261, weight: 36, height: 61},
    {breed:'Newfoundland', count:577, weight: 67.5, height: 68.5},
    {breed:'Siberian Husky', count:391, weight: 21.5, height: 55.5},
    {breed:'Shiba Inu', count:434, weight: 9, height: 38},
    {breed:'Keeshond', count:82, weight: 17.5, height: 44},
    {breed:'Australian Shepherd', count:255, weight: 24, height: 52},
    {breed:'Border Collie', count:1718, weight: 16, height: 51},
    {breed:'German Shepherd', count:7067, weight: 31, height: 60},
    {breed:'Swiss Shepherd', count:110, weight: 32.5, height: 60.5}]



// Create instances of Bar Chart
let barchart1 = new BarChart('div#bar1', [50,50,70,30], 900);

// Render data for barChart using the render method
// binds on and x-axis category taken from breed, y-axis: count
barchart1.render(dogsData, 'breed', 'count', "Breed", "Registration count");

// Example of applying styles, colors, and other attributes based on the data
d3.select('div#bar1')
    .selectAll('g.chart').selectAll('rect.bar').style('fill', d => d['count'] < 400 ? '#ba4a53' : null)
    .style('stroke', d => d['count'] < 400 ? '#381619' : null)
    .style('stroke-width', '2px');


    
// Bubble Chart
let bubblechart1 = new BubbleChart('div#bubble1', [50,50,70,30], 900);
// binds on 'breed', x-axis: weight, y-axis: height, radius: count
bubblechart1.render(dogsData, 'breed', 'weight', 'height', 'count', "Weight", "Height"); // Use the same data as bar chart

// data driven styling
d3.select('div#bubble1')
    .selectAll('g.chart').selectAll('circle.pie').style('fill', d => d['count'] < 400 ? '#ba4a53' : null)
    .style('stroke', d => d['count'] < 400 ? '#381619' : null)
    .style('stroke-width', '2px');



// Line Chart
// Dataset

// y = year, c = registration counts
// let grHistoric =[[{y:2011,c:8081},
//                   {y:2012,c:7085},
//                   {y:2013,c:7117},
//                   {y:2014,c:6977},
//                   {y:2015,c:6928},
//                   {y:2016,c:7232},
//                   {y:2017,c:7846},
//                   {y:2018,c:7794},
//                   {y:2019,c:8422},
//                   {y:2020,c:8653}],
//                   [{y:2011,c:8081},
//                     {y:2012,c:5000},
//                     {y:2013,c:5500},
//                     {y:2014,c:6066},
//                     {y:2015,c:6928},
//                     {y:2016,c:7232},
//                     {y:2017,c:4032},
//                     {y:2018,c:6666},
//                     {y:2019,c:5011},
//                     {y:2020,c:7000}]]; 

let grHistoric =[{y:2011,c:8081},
    {y:2012,c:7085},
    {y:2013,c:7117},
    {y:2014,c:6977},
    {y:2015,c:6928},
    {y:2016,c:7232},
    {y:2017,c:7846},
    {y:2018,c:7794},
    {y:2019,c:8422},
    {y:2020,c:8653}]; 


let linechart1 = new LineChart('div#line1', [50,50,70,30], 900);
linechart1.render(grHistoric, 'y', 'c', 'curveLinear', "Year", "Registration Count", false, false, true, 1, 1, 300, 300);