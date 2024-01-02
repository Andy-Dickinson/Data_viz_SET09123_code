'use strict';

// Imports classes
import Chart from './Chart.js';

/*
Class to render line charts

Colours do not generate properly if no group_titles provided - have not managed to find a fix for this
Probably should be extended by LineChart, but because of this bug, it currently does not
// INTERACTIONS ONLY SETUP FOR ONE DATASET CURRENTLY

Extends class Chart
*/
export default class Scatter extends Chart{

    points; labels;    // element selection

    constructor(container, {chart_margin, svg_width, svg_height}={}) {
        // Sets svg, margin, chart dimensions, axes and transforms
        super(container, chart_margin, svg_width, svg_height);

        this.svg.classed('scatter', true);
        this.points = this.chart.selectAll('g.points');
        this.labels = this.chart.selectAll('g.labels');
    }



    /* Render a scatter plot

    Note if no group_titles is provided, all datasets will be the same colour - need to find a fix. Then put in param for include_labels and move group_titles into optionals
    // INTERACTIONS ONLY SETUP FOR ONE DATASET CURRENTLY


    Parameters:
    - data: 1d list of dicts (for 1 line), or 2d list of list of dicts (for multiple lines)
    - x_key: key to determine x-axis postion, as string
    - y_key: key to determine y-axis position, as string
    - group_titles(optional if 1 dataset): list of string group titles in order relating to the dataset
    
    Optional params (provide as dict):
        - x_title: x-axis title as string
        - y_title: y-axis title as string
        - include_x_domain_zero: for x-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true
        - include_y_domain_zero: for y-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true 
        - axis_pad: axis padding, provide as list [x_left, x_right, y_bott, y_top], all default to 0
        - nice: use nice method for axes
        - x_tickSize: x-axis ticks defaults 6
        - y_tickSize: y-axis ticks defaults 6
        - label_shift: moves labels away from right edge of chart, defaults 40
        - label_spacing: vertically moves labels away from each other, defaults 25
        - dot_size: defaults 5
        - colour_scale: must be d3 built in colour scale provided as string, defaults 'scaleOrdinal'
        - colour_range: must be d3 built in colour range provided as string, defaults 'schemeSet2'
        - use_labels: boolean, adds labels from group_titles for each dataset, defaults true

        NOTE: Only one scale is created from data min/max values for each axis, which all lines are plotted against
        Possible curve_types: see https://d3js.org/d3-shape/curve#curveLinear
    */
    render(data, x_key, y_key, group_titles = [], {x_title, y_title, include_x_domain_zero, include_y_domain_zero, axis_pad, nice, x_ticksize, y_ticksize, label_shift, label_spacing, dot_size, colour_scale, colour_range} = {}, use_labels=true) {

        // If dataset is 1d, make it 2d
        if (data.every(d => !Array.isArray(d))) {
            data = [data];
        }

        // Sets keys
        super.setData(data, x_key, y_key);

        // set colour scale and draw labels
        if (group_titles.length > 0 && use_labels===true) {
            super.setColourScale(group_titles, colour_range, colour_scale);
            this.drawLabels(group_titles, label_shift, label_spacing);
        } else {
            // does not produce different colours for different datasets for some reason
            super.setColourScale(this.data, colour_range, colour_scale);
        }


        // Extracts min and max x and y values from entire dataset(s), and used to set scales and axes
        this.updateChart(data, include_x_domain_zero, include_y_domain_zero, nice, axis_pad, x_title, y_title, x_ticksize, y_ticksize);

        this.drawpoints(dot_size, group_titles);



        // INTERACTIONS ONLY SETUP FOR ONE DATASET CURRENTLY
        // Sets interaction selection to ensure correct (as drawBars has an exit behaviour oddly)
        super.setInterSel(this.points);

        // Adds events
        super.updateEvents();

        // Adds tooltips
        super.updateTooltips();

        return this;
    }
    

    // Updates scales and and axes based on entire dataset(s) min/max
    updateChart(data, include_x_domain_zero, include_y_domain_zero, nice, axis_pad, x_title, y_title, x_ticksize, y_ticksize) {
        // Extracts min and max values from entire dataset for scales
        const x_data_min = d3.min(data, ds => d3.min(ds, d => d[this.x_key]));
        const x_data_max = d3.max(data, ds => d3.max(ds, d => d[this.x_key]));
        const y_data_min = d3.min(data, ds => d3.min(ds, d => d[this.y_key]));
        const y_data_max = d3.max(data, ds => d3.max(ds, d => d[this.y_key]));

        // Set data for the linear scales
        this.data = [{ [this.x_key]: x_data_min, [this.y_key]: y_data_min }, { [this.x_key]: x_data_max, [this.y_key]: y_data_max }];

        // Update the scales and add axes
        super.updateScalesLinear(include_x_domain_zero, include_y_domain_zero, nice, axis_pad);
        this.addAxes(x_title, y_title, x_ticksize, y_ticksize);

        // Restore the original dataset
        this.data = data;
    }


    // Draw points on the scatter chart
    drawpoints(dot_size = 8, group_titles) {

        // adds a new dot element for each dataset provided in this.data
        this.points = this.points.data(this.data)
            .enter()
            .append('g')
            .classed("points", true)
            .style("fill", (d, i) => this.colour_scale(group_titles[i]))  // dot element coloured for each dataset
                .selectAll("circle")  // circles for each dataset point
                .data(d => d)
                .enter()
                .append("circle")
                .classed("point", true)
                .attr("cx", d => this.scale_x(d[this.x_key]))
                .attr("cy", d => this.scale_y(d[this.y_key]))
                .attr("r", dot_size)
                .attr("stroke", "white");
    }


    // Draw labels for each group
    drawLabels(group_titles, label_shift = 40, label_spacing = 25) {

        this.labels = this.labels.data(this.data)
            .enter()
            .append('g')
            .classed('labels', true)
            .each((all_datasets, i, dataset) => {
                // gets g element corresponding to the label for each dataset
                const labelGroup = d3.select(dataset[i]);

                labelGroup
                    .append("text")
                    .text(group_titles[i])
                    .attr("x", this.chart_width - label_shift) // Shift label away from the edge of the chart
                    .attr("y", label_spacing * i)
                    .style("fill", this.colour_scale(group_titles[i])) // Each label coloured same as the corresponding dataset
                    .style("font-size", 20)
                    .style("alignment-baseline", "middle");
            });
    }
}