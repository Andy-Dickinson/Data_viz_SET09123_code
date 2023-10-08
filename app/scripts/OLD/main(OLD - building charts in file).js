'use strict';


// !!!!! REMEMBER - to add a div element in index.html
// SVG charts are upside down on y axis, remember this when setting domain
// Styling - each chart should have own css file, imported to main.css
// Add chart boarder by referring to svg element class name

// lab 2 - Selections
// BAR CHART --------------------------------------------------------------------------------------------------------------------------

// To set up elements for a barchart

// makes a top level selection (selects div element with id bar1 and assigns to barContainer variable)
let barContainer = d3.select('div#bar1');

// adds an svg child element, this can be seen in the web consoles elements tab
// let barSvg = barContainer.append('svg');

// add attributes to svg using .attr selection method
// NOTE .attr method completely overrides the attribute value, this can lead to accidentally removing classes when you intend to mearely add one.
// To prevent this, use .classed method, which lets you toggle classes
// returns the current selection

// barSvg = barContainer.append('svg')
//     .attr('width', 800)
//     .attr('height', 500)
//     .attr('class', 'barchart');

// Can append svg element and add attributes in 1 step:
let barSvg = barContainer.append('svg')
    .attr('width', 800)
    .attr('height', 500)
    .classed('barchart', true); // adds class attribute to svg tag



// Binding data and joining elements

// declares the data (dog breed registration data)
// 4 attributes - breed / count(number of registrations) / weight(average breed weight) / height(average breed height)
let dogs = [
    {breed:'Golden Retriever', count:8653, weight: 39.5, height: 56},
    {breed:'Alaskan Malamute', count:261, weight: 36, height: 61},
    {breed:'Newfoundland', count:577, weight: 67.5, height: 68.5},
    {breed:'Siberian Husky', count:391, weight: 21.5, height: 55.5},
    {breed:'Shiba Inu', count:434, weight: 9, height: 38},
    {breed:'Keeshond', count:82, weight: 17.5, height: 44},
    {breed:'Australian Shepherd', count:255, weight: 24, height: 52},
    {breed:'Border Collie', count:1718, weight: 16, height: 51},
    {breed:'German Shepherd', count:7067, weight: 31, height: 60},
    {breed:'Swiss Shepherd', count:110, weight: 32.5, height: 60.5}];


// We will draw a bar chart that displays the number of registrations for each breed. Hence, we need a bar for each breed, with its height proportional to the breed's number of registration.

// SVG allows the following basic shapes:
// rect - Rectangles with one origin and two dimensions
// circle - Circles with one origin and a radius
// ellipse - Ellipses with one origin and two radii
// line - Straight lines with two extrimity points
// polyline - Compound straight lines with several points
// polygon - Similar to polyline but also ensure the last point connects to the first
// path - A complex element to let you draw any shape

// Looking at this list, rect is the obvious candidate for us to draw bars. So we shall make a selection of all rectangles in our bar chart svg:

// this selection is empty initially (no rect elements in the DOM yet and haven't created any)
let bars = barSvg.selectAll('rect');

// need to bind our data set to the selection above using .data method to create and manipulate the rect element based on the data values:
// d=>d.breed key function, providing an accessor to the selection to uniquely identify data entries.
bars = barSvg.selectAll('rect')
    .data(dogs, d=>d.breed);

// Typically, D3 accessor functions have two parameters: the datum and its index (d,i)=>{...}.
// Notice how we are calling .data directly after .select. In most cases, when using one of D3's methods, the method will return the object it was called from, allowing us to chain methods.


// With our selection now bound to data, D3 would have internally created 'enter', 'update' and 'exit' sub-selections to help us add new rect elements needed, change old ones and remove old unnecessary ones. We can access those with the .join method:
// creates rectangle elements - see in DOM elements tab
bars = barSvg.selectAll('rect')
    .data(dogs, d=>d.breed)
    .join('rect')
    .classed('bar', true); // only here in this example to stop empty rectangle elements being added (as we add class 'bar' elements in example below)
// equivalent to:
// let bars = barSvg.selectAll('rect')
//     .data(dogs, d=>d.breed)
//     .join(
//         enter => enter.append('rect') , // create new elements
//         update => update ,              // don't do anything
//         exit => exit.remove()           // remove elements
//     );


// Four attributes matter for rectangles:
// x: the rectangle origin (top left-hand corner*) horizontal coordinate
// y: the rectangle origin vertical coordinate
// width: the rectangle width
// height: the rectangle height

// NOTE in SVG, the vertical axes goes from top to bottom.

// set these attributes using .attr method
// to give them a value based on the data, use an accessor function ((d,i)=>{...})
// bars will be positionned horizontally based on their index, every 40 pixels, with an offset of 5 pixels. They will also have their height based on their value of count (factored to have it fit inside the svg).
bars = barSvg.selectAll('rect.bar')  // reflects the fact that classed method below adds a class 'bar' to rectangle elements. This will now only select rectangle elements with the class 'bar'
    .data(dogs, d=>d.breed)
    .join('rect')
    .classed('bar', true)  // adds class 'bar' to rectangle elements
    .attr('x', (d, i)=>i*40+5) // datas index is used to determine where each bar starts on the x axis. The +5 has effect of shifting/moving entire graph right
    .attr('y', d=>500-(d.count*0.25))  // datas count value is used to determine where the top of each bar starts (height of the bar chart here is 500)
    .attr('height', d=>d.count*0.25) // height of each bar based on data
    .attr('width', 40) // width of each bar
    .style('fill', d=>d.count<400?'#ba4a53':null) // each bar fill colour. This is in the format condition?value_if_true:value_if_false
    .style('stroke', d=>d.count<400? '#381619':null); // outline of each bar colour
    

// -------------------------------------------------------------------------------------------------------------------------------------

// BUBBLE CHART ------------------------------------------------------------------------------------------------------------------------


let bubbleContainer = d3.select('div#bubble1');

let bubbleSvg = bubbleContainer.append('svg')
    .attr('width', 800)
    .attr('height', 500)
    .classed('bubblechart', true);

//  Attributes for a bubble chart:
// cx: the origin (center point) horizontal coordinate
// cy: the origin vertical coordinate
// r: the radius
    
let bubbles = bubbleSvg.selectAll('circle')
    .data(dogs, d=>d.breed)
    .join('circle')
    .attr('cx', d=>d.weight*8)
    .attr('cy', d=>d.height*4)
    .attr('r', d=>d.count*0.005+10)
    .style('fill', d=>d.count<400?'#ba4a53':null) 
    .style('stroke', 'orange');

// -------------------------------------------------------------------------------------------------------------------------------------

// lab 3 - scales & axes --------------------------------------------------------------------------------------------------------







// --------------------------------------------------------------------------------------------------------------------------------

// lab 4 - shapes -------------------------------------------------------------------------------------------------------------------------------------

const width = 800;
const height = 600;

// Dataset
// y = year, c = registration counts
let grHistoric = [{y:2011,c:8081},
                  {y:2012,c:7085},
                  {y:2013,c:7117},
                  {y:2014,c:6977},
                  {y:2015,c:6928},
                  {y:2016,c:7232},
                  {y:2017,c:7846},
                  {y:2018,c:7794},
                  {y:2019,c:8422},
                  {y:2020,c:8653}]; 

// Sort data by y attribute (year)
let grHist_sorted = d3.sort(grHistoric, d => d.y);


// ---------- Line chart --------------------------------

// selects div element as top selection - must be created in index.html
let lineContainer = d3.select('div#line1');

// creates svg elements
let lineSVG = lineContainer.append('svg')
    .attr('width', width)
    .attr('height', height)
    .classed('lineChart', true);

// scales x axis from data y attributes min and max to 0 and chart width
let line_scaleX = d3.scaleLinear()
    .domain([d3.min(grHist_sorted, d => d.y)-1, d3.max(grHist_sorted, d => d.y)+1])
    .range([0, width]);
// scales y axis from data c attributes min and max to 0 and chart height
let line_scaleY = d3.scaleLinear()
    .domain([d3.max(grHist_sorted, d => d.c)*1.1, 0])  // could go to data minimum, d3.min(grHist_sorted, d => d.c) but effectively zooms in chart on y-axis. *1.1 is used to stop data points being on edge of chart.
    .range([0, height]);

// Create x and y axis generators
let line_x_axisGen = d3.axisTop(line_scaleX);
let line_y_axisGen = d3.axisRight(line_scaleY);

// Appends x-axis to the chart within the group element with class 'x-axis'
lineSVG.append('g')
    .attr('class', 'x-axis')
    .attr('transform', "translate(0," + height + ")") // moves x-axis to bottom of chart
    .call(line_x_axisGen);

// Hides first and last ticks of x-axis
d3.selectAll('.x-axis .tick')  // selects all elements of class 'tick' within class 'x-axis'
    .filter((d, i, nodes) => i === 0 || i === nodes.length - 1)
    .attr('visibility', 'hidden');

// Appends y-axis to the chart within the group elenent with class 'y-axis'
lineSVG.append('g')
    .attr('class', 'y-axis')
    .call(line_y_axisGen);

// creates a line generator
let lineGen = d3.line()
    .curve(d3.curveLinear)  // curveCardinal smooths out the curve
    .x(d => line_scaleX(d.y))  // uses y attribute for x axis
    .y(d => line_scaleY(d.c)); // uses c attribute for y axis

// creates a path, joins datum
// draws with the line generator
let line = lineSVG.append('path')
    .datum(grHist_sorted)
    .attr("fill", "none")
    .attr("stroke", "coral")
    .attr("stroke-width", 3)
    .attr('d', lineGen);


// --------------- Pie/Donut Chart ----------------------

// selects div element as top level selection
let pieContainer = d3.select('div#pie_donut');

// creates svg elements
let pieSVG = pieContainer.append('svg')
    .attr('width', width)
    .attr('height', height)
    .classed('pieChart', true);

// creates a pie generator
let pieGen = d3.pie().padAngle(0.02)
    .sort(null).value(d => d.c);

// creates a transformed dataset
let pieData = pieGen(grHist_sorted);

// creates an arc generator
// (creates SVG paths representing circles arcs)
let arcGen = d3.arc()
    .innerRadius(width/4)
    .outerRadius(width/2 - 5);

// draws the arcs
let arcs = pieSVG.selectAll('path')
    .data(pieData, d => d.data.y)
    .join('path')
    .attr('fill', 'cadetblue').attr('fill-opacity', 0.8)
    .attr('stroke', 'cadetblue').attr('stroke-width', 2)
    .attr('d', arcGen);