'use strict';

// To set up elements for a barchart

// makes a selection
let barContainer = d3.select('div#bar1');

// adds an svg child element, this can be seen in the web consoles eleemnts tab
let barSvg = barContainer.append('svg');

// adds attributes to svg using .attr selection method
// NOTE .attr method completely overrides the attribute value, this can lead to accidentally removing classes when you intend to mearely add one.
// To prevent this, use .classed method, which lets you toggle classes
// returns the current selection

// barSvg = barContainer.append('svg')
//     .attr('width', 800)
//     .attr('height', 500)
//     .attr('class', 'barchart');

barSvg = barContainer.append('svg')
    .attr('width', 800)
    .attr('height', 500)
    .classed('barchart', true);



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


// With our selection now bound to data, D3 would have internally created enter, update and exit sub-selections to help us add new rect elements needed, change old ones and remove old unnecessary ones. We can access those with the .join method:
// creates rectangle elements - see in DOM elements tab
bars = barSvg.selectAll('rect')
    .data(dogs, d=>d.breed)
    .join('rect');
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
// to give them a value based on the data, use an accessor function (.data)
// bars will be positionned horizontally based on their index, every 40 pixels, with an offset of 5 pixels. They will also have their height based on their value of count (factored to have it fit inside the svg).
bars = barSvg.selectAll('rect')
    .data(dogs, d=>d.breed)
    .join('rect')
    .attr('x', (d, i)=>i*40+5)
    .attr('height', d=>d.count*0.25)
    .attr('width', 40)
    .attr('y', (d, i)=>);