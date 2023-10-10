'use strict';

// imports classes
import Chart from './Chart.js';


/*
Class to render pie / donut charts
Extends class Chart
*/
export default class Pie_donut extends Chart{

    sorted_dataset;

    constructor(container, margin=[50,50,50,30], width=600, height=400) {
        super(container, margin, width, height);

        this.svg.classed('pie_donut', true);
    }


    /* Class to render pie / donut charts
    - categoryKey is used to determine segments
    - categoryCount determines segment size
    All other parameters are optional
    inner/outer_r_factor: factors the radius of the pie based on chart width
    Tick sizes default to 6
    */
   
    render(data, categoryKey, categoryCount, padAngle=0.02, inner_r_factor=0.2, outer_r_factor=1, x_title, y_title) {

        this.data = data;
        
        // -----------------Titles need doing differently ----------------------------------------------

        let slice = `${categoryKey}`;
        let slice_size = `${categoryCount}`;

        this.sorted_dataset = this.data.slice().sort((a, b) => d3.ascending(a[slice], b[slice]));

        // creates a pie generator
        let pieGen = d3.pie().padAngle(padAngle)
                .sort(null).value(d => d.c);//[slice_size]);

        
        // creates a transformed dataset
        let pieData = pieGen(this.sorted_dataset);

        // creates an arc generator
        // (creates SVG paths representing circles arcs)
        let arcGen = d3.arc()
                .innerRadius(this.chartWidth/4)//*inner_r_factor)
                .outerRadius(this.chartWidth/2-5);//outer_r_factor);

        // creates a scale object that associates a colour with each pie element (drawn from built-in scheme 'd3.schemePastel2' (defines set of gentle colors))
        // scaleOrdinal maps discrete domain values to discrete range values
        // var scC = d3.scaleOrdinal( d3.schemePastel2 ) 
        //         .domain( pieData.map(d=>d.index) ); 


        let pieG = this.svg.selectAll('g.chart');
        let piePath = pieG.selectAll('path.pie');

        // Remove existing paths before rendering new ones
        piePath.remove();

        
        // draws the arcs
        let arcs = pieG.selectAll('path')
            .data(pieData, d => d.data.y)//[slice])
            .join('path')
            .classed('pie', true)
            .attr('fill', 'cadetblue').attr('fill-opacity', 0.8)
            .attr('stroke', 'cadetblue').attr('stroke-width', 2)
            .attr('d', arcGen);
    }
}
/*
*/


/*
// code from main OLD - which works but needs translating
render(data){
// selects div element as top level selection
let pieContainer = d3.select('div#pie_donut');

// creates svg elements
let pieSVG = pieContainer.append('svg')
    .attr('this.chart', this.chartWidth)
    .attr('height', this.chartHeight)
    .classed('pieChart', true);

// creates a pie generator
let pieGen = d3.pie().padAngle(0.02)
    .sort(null).value(d => d.c);

// creates a transformed dataset
let pieData = pieGen(data);

// creates an arc generator
// (creates SVG paths representing circles arcs)
let arcGen = d3.arc()
    .innerRadius(this.chartWidth/4)
    .outerRadius(this.chartWidth/2 - 5);

// draws the arcs
let arcs = pieSVG.selectAll('path')
    .data(pieData, d => d.data.y)
    .join('path')
    .attr('fill', 'cadetblue').attr('fill-opacity', 0.8)
    .attr('stroke', 'cadetblue').attr('stroke-width', 2)
    .attr('d', arcGen);
}
}
/*
*/






/*
// code from book - which also works
 // creates instance of the pie layout, configures it, and invokes on dataset. (transforms the data)
    // returns an array of objects with one object for each record in original dataset. Each contains reference to original data, start and end angles of associated slice
    var pie = d3.pie().value(d=>d.votes).padAngle(0.025)( data );

    // creates and configures an arc generator. Used to take transformed dataset and create svg path
    var arcMkr = d3.arc().innerRadius( 50 ).outerRadius( 140 )
        .cornerRadius(10);

    // creates a scale object that associates a colour with each pie element (drawn from built-in scheme 'd3.schemePastel2' (defines set of gentle colors))
    // scaleOrdinal maps discrete domain values to discrete range values
    var scC = d3.scaleOrdinal( d3.schemePastel2 ) 
        .domain( pie.map(d=>d.index) ) 

    // selects destination element, appends g element and moves into position
    var g = d3.select( "#pie" )
        .append( "g" ).attr( "transform", "translate(300, 150)" )

    g.selectAll( "path" ).data( pie ).enter().append( "path" ) // binds
        .attr( "d", arcMkr ) // invokes generator
        .attr( "fill", d=>scC(d.index) ).attr( "stroke", "grey" );

    // adds text labels to slices
    g.selectAll( "text" ).data( pie ).enter().append( "text" ) 
        .text( d => d.data.name )
        .attr( "x", d=>arcMkr.innerRadius(70).centroid(d)[0] ) // centroid() returns coordinates of center of each pie slice. Here we are moving label towards rim
        .attr( "y", d=>arcMkr.innerRadius(70).centroid(d)[1] )
        .attr( "font-family", "sans-serif" ).attr( "font-size", 14 )
        .attr( "text-anchor", "middle" );
}
/*
*/