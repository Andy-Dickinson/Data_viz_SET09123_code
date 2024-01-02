'use strict';

// Imports classes
import Chart from './Chart.js';

/*
Class to render bubble charts
Extends class Chart
*/
export default class BubbleChart extends Chart {

    binding_key;        // Key used to bind data to bubbles (what is the category of each bubble)
    radius_key;         // Key used to define radius of each bubble
    scale_r;
    bubbles;            // element selection

    constructor(container, chart_margin=[50,50,50,30], svg_width=600, svg_height=400) {
        super(container, chart_margin, svg_width, svg_height);

        this.svg.classed('bubblechart', true);
        this.bubbles = this.chart.selectAll('circle.bubble');
    }



    /* Render method to create or update the bubble chart

    Parameters:
    - data: 1d list of dicts
    - binding_key: key to select each bubble category, as string
    - x_key: key to determine x-axis postion, as string
    - y_key: key to determine y-axis position, as string
    - radius_key: key to determine bubble size, as string

    Optional params (provide as dict):
        - x_title: x-axis title as string
        - y_title: y-axis title as string
        - include_x_domain_zero: for x-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true
        - include_y_domain_zero: for y-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true 
        - axis_pad: axis padding, provide as list [x_left, x_right, y_bott, y_top], all default to 0
        - nice: use nice method for y-axis, defaults true
        - x_tickSize: x-axis ticks defaults 6
        - y_tickSize: y-axis ticks defaults 6
        - max_radius: of bubbles, default lowest value of chart height or width / number of data points 
        - min_radius: of bubbles, default max_radius / number of data points
    */
    render(data, binding_key, x_key, y_key, radius_key, {x_title, y_title, include_x_domain_zero, include_y_domain_zero, axis_pad, nice, x_tickSize, y_tickSize, max_radius, min_radius} = {}) {

        this.setBubbleData(data, binding_key, x_key, y_key, radius_key); // Not a direct call to parent method

        // Data sorted in descending order so as to ensure small bubbles are plotted ontop of larger ones
        this.data = d3.sort(this.data, (a, b) => b[this.radius_key] - a[this.radius_key]);


        // Sets x and y scales used for the axes
        super.updateScalesLinear(include_x_domain_zero, include_y_domain_zero, axis_pad, nice);
        super.addAxes(x_title, y_title, x_tickSize, y_tickSize);

        this.setRadiusScale(max_radius, min_radius);

        this.drawBubbles();
        
        // Sets interaction selection (as drawBars has an exit behaviour oddly)
        super.setInterSel(this.bubbles);

        // Adds events
        super.updateEvents();

        // Adds tooltips
        super.updateTooltips();

        return this;
    }


    // Set data, binding_key, x_key, y_key, and radius_key
    setBubbleData(data, binding_key, x_key, y_key, radius_key) {
        super.setData(data, x_key, y_key); // Set x_key and y_key
        this.binding_key = `${binding_key}`;
        this.radius_key = `${radius_key}`;

        super.setInterKey(this.binding_key);
    }


    // Draw bubbles
    drawBubbles() {

       this.bubbles = this.bubbles.data(this.data, d => d[this.binding_key]) // Bind data
            .join('circle')
            .classed('bubble', true)
            .attr('cx', d => this.scale_x(d[this.x_key])) // X-axis coordinate
            .attr('cy', d => this.scale_y(d[this.y_key]))  // Y-axis scale accounts for upside-down mapping
            .attr('r', d => this.scale_r(d[this.radius_key])); // Radius
    }


    // Set the radius scale
    setRadiusScale(max_radius = undefined, min_radius = undefined) {
        // Sets max_radius if undefined to lowest value of chart height or width / number of data points 
        if (max_radius === undefined) {
            max_radius = Math.min(this.chart_height, this.chart_width) / this.data.length;
        }

        // Sets min_radius if undefined to max_radius / number of data points
        if (min_radius === undefined) {
            min_radius = max_radius / this.data.length;
        }

        
        // rangeR - Highest value of 0 or min_radius to lowest value of max_radius or data max
        const rangeR = [Math.max(0, min_radius), Math.min(max_radius, d3.max(this.data, d => d[this.radius_key]))];


        // Calculates scale for radius, nice method not used
        this.scale_r = super.calculateScale(this.data, this.radius_key, rangeR, true, false); 
    }
}