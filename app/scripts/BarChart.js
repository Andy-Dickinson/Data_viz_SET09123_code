'use strict';

// Imports classes
import Chart from './Chart.js';


/*
Class to render bar charts
Extends class Chart
Uses scaleBand for x-axis
*/
export default class BarChart extends Chart{

    x_domain;
    bars;                           // element selection

    constructor(container, chart_margin=[50,50,50,30], svg_width=600, svg_height=400) {
        super(container, chart_margin, svg_width, svg_height);

        this.svg.classed('barchart', true);
        this.bars = this.chart.selectAll('rect.bar');
    }



  /*
    Method to render bar charts

    Parameters:
    - data: 1d list of dicts
    - category_key: used to look up bar categories, as string
    - category_count: used to look up y-axis values, as string

    Optional params (provide as dict):
        - x_title: x-axis title as string
        - y_title: y-axis title as string
        - padding: padding between bars, defaults 0.15, must be less than 1
        - domain_include_zero: when false, domain min is taken from data min, else lowest of 0 or data_min nice, defaults true
        - y_axis_pad: y-axis padding, provide as list [bottom, top]
        - nice: use nice method for y-axis, defaults true
        - x_tickSize: x-axis ticks defaults 6
        - y_tickSize: y-axis ticks defaults 6
    */
    render(data, category_key, category_count, {x_title, y_title, padding, domain_include_zero, y_axis_pad, nice, x_tickSize, y_tickSize} = {}) {
        
        // Sets the data and keys
        super.setData(data, category_key, category_count);
        
        // Set the x domain
        this.x_domain = data.map(d => d[this.x_key]);

        // Update the x-axis scale using a band scale
        this.updateScalesBand(padding);

        // Updates the y-axis scale
        this.scale_y = super.calculateScale(this.data, this.y_key, [this.chart_height, 0], domain_include_zero, nice, y_axis_pad);

        // Add axes and titles
        super.addAxes(x_title, y_title, x_tickSize, y_tickSize);

        // Draw bars
        this.drawBars();

        // Sets interaction selection (as drawBars has an exit behaviour oddly)
        super.setInterSel(this.bars);

        // Adds events
        super.updateEvents();

        // Adds tooltips
        super.updateTooltips();

        return this;
    }


    /*
    Update the x-axis scale using a band scale
    - padding: Padding between bars (MUST be less than 1)
    */
    updateScalesBand(padding = 0.15) {
        this.scale_x = d3.scaleBand()
            .domain(this.x_domain)
            .range([0, this.chart_width])
            .padding(padding);
    }


    // Draw the bars
    drawBars() {
        
        this.bars = this.bars.data(this.data, d => d[this.x_key])
            .join('rect')
            .classed('bar', true)
            .attr('height', d => this.chart_height - this.scale_y(d[this.y_key]))
            .attr('width', this.scale_x.bandwidth())
            .attr('x', d => this.scale_x(d[this.x_key]))
            .attr('y', d => this.scale_y(d[this.y_key]));
    }
}