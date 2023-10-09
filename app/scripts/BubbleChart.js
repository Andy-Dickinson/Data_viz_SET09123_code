'use strict';

// imports classes
import Chart from './Chart.js';

/*
Class to render bubble charts
Extends class Chart
*/
export default class BubbleChart extends Chart {

    binding_key;
    radius_key;
    scaleR;

    constructor(container, margin=[50,50,50,30], width=600, height=400) {
        super(container, margin, width, height);

        this.svg.classed('bubblechart', true);
    }


    /* Render method to create or update the bubble chart
    - binding_key: used to bind data
    - x_key: used to look up x-axis values
    - y_key: used to look up y-axis values
    - radius_key: used to look up bubble radius
    All other parameters are optional
    min and max radius is based off chart size and data length if not specified
    Tick sizes default to 6
    */
    render(data, binding_key, x_key, y_key, radius_key, x_title, y_title, max_radius, min_radius, x_tickSize, y_tickSize) {

        this.binding_key = `${binding_key}`;
        this.x_key = `${x_key}`;
        this.y_key = `${y_key}`;
        this.radius_key = `${radius_key}`;
        // data sorted in descending order so as to ensure small bubbles are plotted ontop of larger ones
        this.data = d3.sort(data, (a, b) => b[this.radius_key] - a[this.radius_key]);

        // sets scales and axes
        this.updateScalesRadius(max_radius, min_radius);
        this.addAxes(x_title, y_title, x_tickSize, y_tickSize);


        let bubbles = this.svg.selectAll('g.chart');
        let circles = bubbles.selectAll('circle.pie');

        // Remove existing bars before rendering new ones
        circles.remove();


        // Draws
        let barsBinded = circles
            .data(data, d => d[this.binding_key]) // binds data
            .join('circle')
            .classed('pie', true)
            .attr('cx', d => this.scaleX(d[this.x_key])) // x-axis coordinate
            .attr('cy', d => this.scaleY(d[this.y_key]))  // y-axis scale accounts for upside down mapping
            .attr('r', d => this.scaleR(d[this.radius_key])); // radius
    }



    updateScalesRadius(max_radius, min_radius) {

        // first scales linear which sets chart width and height along with x and y axis domains and scales
        super.updateScalesLinear();

        // sets max_radius if undefined to lowest value of chart height or width / number of data points 
        if (max_radius === undefined) {
            max_radius = Math.min(this.chartHeight, this.chartWidth) / this.data.length;
        }

        // sets min_radius if undefined to max_radius / number of data points
        if (min_radius === undefined) {
            min_radius = max_radius / this.data.length;
        }

        // domainR - takes lowest value either from dataset or 0 to data max
        let domainR = [Math.min(0, d3.min(this.data, d => d[this.radius_key])), d3.max(this.data, d => d[this.radius_key])];
        // rangeR - highest value of 0 or min_radius to lowest value of max_radius or data max
        let rangeR = [Math.max(0, min_radius), Math.min(max_radius, d3.max(this.data, d => d[this.radius_key]))];
        this.scaleR = d3.scaleLinear(domainR, rangeR);
    }
}