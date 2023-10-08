'use strict';

// imports classes
import Chart from './Chart.js';


/*
Class to build Line charts
Extends class Chart
*/
export default class LineChart extends Chart{


    constructor(container, margin=[50,50,50,30], width=600, height=400) {
        super(container, margin, width, height);

        this.svg.classed('linechart', true);
    }


    /* Render method to create or update the line chart
    - categoryKey: used to look up bar categories
    - categoryCount: used to look up y-axis values
    All other parameters are optional
    Padding MUST be less than 1, defaults to 0.15
    Tick sizes default to 6
    */
    render(data, x_key, y_key, x_title, y_title, x_tickSize, y_tickSize) {

        this.data = data;
        this.x_key = `${x_key}`;
        this.y_key = `${y_key}`;
        this.x_domain = data.map(d => d[`${x_key}`]);

        // checks if data is 1d or 2d - if more than one line is required
        if (data.every(d => !Array.isArray(d))) {
            console.log("1d");
        } else{
            console.log("2d");
        }

        // x-axis is bandScale
        this.updateScalesBand(padding);
        this.addAxes(x_title, y_title, x_tickSize, y_tickSize);


        let barsG = this.svg.selectAll('g.chart');
        let rectangles = barsG.selectAll('rect.bar');

        // Remove existing bars before rendering new ones
        rectangles.remove();


        // Create D3 rectangles for data binding
        let barsBinded = rectangles
            .data(data, d => d[this.x_key]) // binds data by category
            .join('rect')
            .classed('bar', true)
            .attr('height', d => this.chartHeight - this.scaleY(d[this.y_key])) // height of each bar, accounts for upside down mapping
            .attr('width', this.scaleX.bandwidth())  // width of each bar
            .attr('x', d => this.scaleX(d[this.x_key])) // horizontal coordinate origin - based on scaleBand
            .attr('y', d => this.scaleY(d[this.y_key])); // vertical coordinate origin (top left corner of each bar) - move each bar down by its own scaled height (reverse mapping on y-axis)
    }



    updateScalesBand(padding=0.15) {

        // first scales linear which sets chart width and height along with y axis
        super.updateScalesLinear();

        // scales band for x-axis
        this.scaleX = d3.scaleBand()
            .domain(this.x_domain)
            .range([0, this.chartWidth])
            .padding(padding);
    }
}