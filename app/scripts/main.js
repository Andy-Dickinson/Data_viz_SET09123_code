// building charts from classes

'use strict';

// imports classes
import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';

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

// Create instances of BarChart and BubbleChart
let barchart1 = new BarChart('div#bar1', 900, 400, [50, 50, 70, 30]);
// let bubblechart1 = new BubbleChart('div#bubble1', 800, 500, [5,5,5,5]);

// Render data using the render method
barchart1.render(dogsData, 'breed', 'count', "Breed", "Registration count");

// Example of applying styles, colors, and other attributes based on the data
d3.select('div#bar1')
    .selectAll('g.chart').selectAll('rect.bar').style('fill', d => d['count'] < 400 ? '#ba4a53' : null)
    .style('stroke', d => d['count'] < 400 ? '#381619' : null)
    .style('stroke-width', '2px');


// bubblechart1.render(dogsData); // Use the same data for both charts

