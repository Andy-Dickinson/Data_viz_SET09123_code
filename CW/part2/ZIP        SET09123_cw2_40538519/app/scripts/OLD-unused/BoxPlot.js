'use strict';

// Imports classes
import Chart from '../Chart.js';


/*
Class to render box plot charts
Extends class Chart
Uses scaleBand for x-axis
*/
export default class BoxPlot extends Chart{

    x_domain;
    boxes; lines;                          // element selection
    box_data;

    constructor(container, {chart_margin, svg_width, svg_height}={}) {
        super(container, chart_margin, svg_width, svg_height);

        this.svg.classed('box_plot', true);
        this.boxes = this.chart.selectAll('rect.boxes');
        this.lines = this.chart.selectAll()

        this.box_data = [];
    }




    render(data, category_key, category_count, {x_title, y_title, padding, domain_include_zero, y_axis_pad, nice, x_tickSize, y_tickSize} = {}) {
        
        // Sets the data and keys
        super.setData(data, category_key, category_count);
        
        // Set the x domain
        this.x_domain = data.map(d => d[this.x_key]);

        // Sort each dataset
        this.sorted_dataset = data.map(data => d3.sort(data, d => d[this.y_key]));
        this.data = this.sorted_dataset;


    }


    // Prepare the data for the box plots
    setBoxData() {

        this.sorted_dataset.array.forEach(box_d => {
            const box = {};
            const localMin = d3.min(box_d[this.y_key]);
            const localMax = d3.max(box_d[this.y_key]);


        });
    }
}
