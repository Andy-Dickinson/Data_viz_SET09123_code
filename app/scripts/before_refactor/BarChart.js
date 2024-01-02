'use strict';

// imports classes
import Chart from './Chart.js';


/*
Class to render bar charts
Extends class Chart
Uses scaleBand for x-axis
*/
export default class BarChart extends Chart{

    x_domain;

    constructor(container, chartMargin=[50,50,50,30], svgWidth=600, svgHeight=400) {
        super(container, chartMargin, svgWidth, svgHeight);

        this.svg.classed('barchart', true);
    }


    /* Class to render bar charts
    - data: dataset as a list of dictionaries
    - categoryKey: used to look up bar categories
    - categoryCount: used to look up y-axis values
    All other parameters are optional
    Padding MUST be less than 1, defaults to 0.15
    Tick sizes default to 6
    */
    render(data, categoryKey, categoryCount, x_title, y_title, padding, x_tickSize, y_tickSize) {

        this.data = data;
        this.x_key = `${categoryKey}`;
        this.y_key = `${categoryCount}`;
        this.x_domain = data.map(d => d[`${categoryKey}`]);

        // x-axis is bandScale
        this.updateScalesBand(padding);
        this.addAxes(x_title, y_title, x_tickSize, y_tickSize);


        let barsG = this.svg.selectAll('g.chart');
        let rectangles = barsG.selectAll('rect.bar');

        // Remove existing bars before rendering new ones
        rectangles.remove();


        // Draws
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

        // first scales linear which sets scale for y axis
        super.updateScalesLinear();

        // scales band for x-axis
        this.scaleX = d3.scaleBand()
            .domain(this.x_domain)
            .range([0, this.chartWidth])
            .padding(padding);
    }
}