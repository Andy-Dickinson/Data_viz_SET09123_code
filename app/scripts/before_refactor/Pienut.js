'use strict';

// imports classes
import Chart from './Chart.js';


/*
Class to render pie / donut charts
Extends class Chart
*/
export default class Pienut extends Chart{

    sorted_dataset;
    chartSize;               // based on smallest chart size
    labelSpace;

    constructor(container, chartMargin=[50,50,50,30], svgWidth=600, svgHeight=400, labelSpace=50) {
        super(container, chartMargin, svgWidth, svgHeight);

        // not required for pie chart
        this.axisX.remove();
        this.axisY.remove();

        this.labelSpace = labelSpace;

        // transforms specifically for pie chart (different to other charts)
        this.chart
            .attr('transform', `translate(${this.chartMargin[2]+this.chartWidth/2},${this.chartMargin[0]+this.chartHeight/2})`)    
            
        this.chartSize = Math.min(this.chartWidth, this.chartHeight) - this.labelSpace*2;

        this.svg.classed('pienut', true);
    }


    /* Class to render pie / donut charts
    - categoryKey is used to determine segments
    - categoryCount determines segment size
    All other parameters are optional
    inner/outer_r_factor: factors the radius of the pie based on chart width
    Tick sizes default to 6
    */
   
    render(data, categoryKey, categoryCount, padAngle=0.02, inner_r_factor=0.25, outer_r_factor=0.5) {

        this.data = data;

        let slice = `${categoryKey}`;
        let slice_size = `${categoryCount}`;

        this.sorted_dataset = this.data.slice().sort((a, b) => d3.ascending(a[slice], b[slice]));

        // creates a pie generator
        let pieGen = d3.pie().padAngle(padAngle)
                .sort(null).value(d => d[slice_size]);

        
        // creates a transformed dataset
        let pieData = pieGen(this.sorted_dataset);

        // creates an arc generator
        // (creates SVG paths representing circles arcs)
        let arcGen = d3.arc()
                .innerRadius(this.chartSize * inner_r_factor)
                .outerRadius(this.chartSize * outer_r_factor);

        // creates a scale object that associates a colour with each pie element (drawn from built-in scheme 'd3.schemePastel2' (defines set of gentle colors))
        // scaleOrdinal maps discrete domain values to discrete range values
        var colourScale = d3.scaleOrdinal( d3.schemePastel2 ) 
                .domain( pieData.map(d=>d.index) ); 


        let pieG = this.svg.selectAll('g.chart');
        let piePath = pieG.selectAll('path.pie');

        // Remove existing paths before rendering new ones
        piePath.remove();
    
        // draws the arcs
        let arcs = pieG.selectAll('path.pie')
            .data(pieData)
            .join('path')
            .classed('pie', true)
            .attr('d', arcGen)
            .attr( "fill", d=>colourScale(d.index) ).attr( "stroke", "grey" );

        
        // recalculates scale now including labelSpace
        arcGen = d3.arc()
            .innerRadius(this.chartSize*inner_r_factor + this.labelSpace)
            .outerRadius(this.chartSize*outer_r_factor + this.labelSpace);

        let labels = pieG.selectAll('text.label');
        labels.remove();

        labels = pieG.selectAll('text.label')
            .data(pieData, d => d.data[slice])
            .join('text')
            .classed('label', true)
            .attr('transform', d => `translate(${arcGen.centroid(d)})`)
            .style("text-anchor", "middle")
            .text(d => d.data[slice]);
    }
}