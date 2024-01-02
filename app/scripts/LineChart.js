'use strict';

import Chart from './Chart.js';

/*
Class to render line charts
Extends the Chart class

Could maybe extend class Scatter, but haven't had the time to look at
*/
export default class LineChart extends Chart {

    sorted_dataset;
    lines; dots; labels;    // element selection
    _click_line; _mouseover_line; _mouseout_line;  // events 
    _tipText_f_line; _tips_ref_line;         // tooltips
    _ia_sel_line; _ia_key_line; // interaction selection, inherited attribute is used for dots

    constructor(container, chart_margin = [50, 50, 50, 30], svg_width = 600, svg_height = 400) {
        super(container, chart_margin, svg_width, svg_height);

        this.sorted_dataset = [];

        // Add the 'linechart' class to the SVG
        this.svg.classed('linechart', true);
        this.lines = this.chart.selectAll('path.line');
        this.dots = this.chart.selectAll('g.dots');
        this.labels = this.chart.selectAll('g.labels');

        // Initialize event handlers and tooltips to empty functions or provide default behaviors
        this._click_line = () => {};
        this._mouseover_line = () => {};
        this._mouseout_line = () => {};
        this._tipText_f_line = null;
        this._tips_ref_line = [];
    }



    /*
    Renders a line chart

    Parameters:
    - data: 1d list of dicts (for 1 line), or 2d list of list of dicts (for multiple lines)
    - x_key: key to determine x-axis postion, as string
    - y_key: key to determine y-axis position, as string
    - line_groups: list of string group titles in order relating to the dataset
    
    Optional params (provide as dict):
        - x_title: x-axis title as string
        - y_title: y-axis title as string
        - include_x_domain_zero: for x-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true
        - include_y_domain_zero: for y-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true 
        - axis_pad: axis padding, provide as list [x_left, x_right, y_bott, y_top], all default to 0
        - nice: use nice method for y-axis
        - x_tickSize: x-axis ticks defaults 6
        - y_tickSize: y-axis ticks defaults 6
        - curve_type: defines curve used for line gen as string, defaults 'curveLinear'
        - include_labels: boolean, defaults true
        - dot_size: defaults 5
        - line_width: defaults 3
        - colour_scale: must be d3 built in colour scale provided as string, defaults 'scaleOrdinal'
        - colour_range: must be d3 built in colour range provided as string, defaults 'schemeSet2'

        NOTE: Only one scale is created from data min/max values for each axis, which all lines are plotted against
        Possible curve_types: see https://d3js.org/d3-shape/curve#curveLinear
    */
    render(data, x_key, y_key, line_groups, {x_title, y_title, include_x_domain_zero, include_y_domain_zero, axis_pad, nice, x_ticksize, y_ticksize, curve_type, include_labels, dot_size, line_width, colour_scale, colour_range} = {}) {
        // Set keys
        super.setData(data, x_key, y_key);
        this.setInterKeyLine(this.x_key); // initialises line key to same as dots key

        // If dataset is 1D, convert it to 2D
        if (data.every(d => !Array.isArray(d))) {
            data = [data];
        }

        // Sort each dataset
        this.sorted_dataset = data.map(data => d3.sort(data, d => d[this.x_key]));
        this.data = this.sorted_dataset;


        // Extracts min and max x and y values from entire dataset(s), and used to set scales and axes
        this.updateChart(this.sorted_dataset, include_x_domain_zero, include_y_domain_zero, nice, axis_pad, x_title, y_title, x_ticksize, y_ticksize);


        // Create a line generator
        const lineGen = this.createLineGen(curve_type);

        // Create colour scale
        super.setColourScale(line_groups, colour_range, colour_scale);

        // Add paths for each dataset
        this.addPaths(line_groups, lineGen, line_width);

        // Add the points
        this.addDots(line_groups, dot_size);

        if(include_labels === undefined || include_labels === true){
            // Add labels at the end of each line
            this.addLabels(line_groups);
        }


        // Dots events and tooltips
        // Sets interaction selection (as drawBars has an exit behaviour oddly)
        super.setInterSel(this.dots);

        // Adds events
        super.updateEvents();

        // Adds tooltips
        super.updateTooltips();


        // Line events and tooltips
        // Sets interaction selection (as drawBars has an exit behaviour oddly)
        this.setInterSelLine(this.lines); // Overrides parent method

        // Adds events
        this.updateEventsLine(); // Overrides parent method

        // Adds tooltips
        this.updateTooltipsLine(); //Overrides parent method


        return this;
    }


    // Create a line generator
    createLineGen(curve_type = 'curveLinear') {
        return d3.line()
            .x(d => this.scale_x(d[this.x_key]))
            .y(d => this.scale_y(d[this.y_key]))
            .curve(d3[curve_type]);
    }


    // Add paths for each dataset
    addPaths(line_groups, lineGen, line_width = 3) {

        this.lines = this.lines.data(this.sorted_dataset)
            .enter()
            .append('path')
            .each((d,i, nodes) => {d3.select(nodes[i]).classed("line " + (i + 1), true);}) // sets class name based on dataset number (index + 1)
            .attr('d', d => lineGen(d))
            .style('stroke', (d, i) => this.colour_scale(line_groups[i])) // Apply colors based on line_groups
            .style('stroke-width', line_width)
            .style('fill', 'none');
    }


    // Add dots for each dataset
    addDots(line_groups, dot_size = 5) {

        this.dots = this.dots.data(this.sorted_dataset)
            .enter()
            .append('g')
            .each((d,i, nodes) => {d3.select(nodes[i]).classed("dots " + (i + 1), true);}) // sets class name based on dataset number (index + 1)
            .style('fill', (d, i) => this.colour_scale(line_groups[i])) // dots coloured based on grouping
                .selectAll('circle')
                .data(d => d)
                .enter()
                .append('circle')
                .classed('dot', true)
                .attr('cx', d => this.scale_x(d[this.x_key]))
                .attr('cy', d => this.scale_y(d[this.y_key]))
                .attr('r', dot_size)
                .attr('stroke', 'white');
    }


    // Add labels at the end of each line
    addLabels(line_groups) {

        this.labels = this.labels.data(this.sorted_dataset)
            .enter()
            .append('g')
            .classed('labels', true)
            .each((data, i, d) => {
                // Gets the last data point of each dataset and finds its dots scaled position
                const lastIndex = data.length - 1;
                const lastDataPoint = data[lastIndex];
                const xPosition = this.scale_x(lastDataPoint[this.x_key]);
                const yPosition = this.scale_y(lastDataPoint[this.y_key]);

                // Gets g element corresponding to the label of the last data point for each dataset
                const labelGroup = d3.select(d[i]);

                labelGroup
                    .append('text')
                    .text(line_groups[i])
                    .attr('x', xPosition + 10) // shifts label slightly away from last dot
                    .attr('y', yPosition)
                    .style('fill', this.colour_scale(line_groups[i]))
                    .style('font-size', 15)
                    .style('alignment-baseline', 'middle');
            });
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


    /*
    Updates event handlers
    */
    updateEventsLine() {
        var sele = this.getInterSelLine();
        var key = this.getInterKeyLine();
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        sele.on('click', (event, datum, index) => {
                this._click_line(datum[key]); // changes clicked attribute
            })
            .on('mouseover', (event, datum) => {
                this._mouseover_line(datum[key]);
            })
            .on('mouseout', (event, datum) => {
                this._mouseout_line(datum[key]);
            })
    }


    /*
    Adds tooltips
    */
    updateTooltipsLine() {
        // destroys any previously defined tooltips
        this._tips_ref_line.forEach(t => t.destroy());

        // only adds tooltips if accessor is not null
        if (this._tipText_f_line) {
            
            this.getInterSelLine().attr('data-tippy-content', this._tipText_f_line);
            this._tips_ref_line = tippy(this.getInterSelLine().nodes());
        }
    }


    /*
    Highlights bars based on key values passed provided
    - keyValues: list of key values to search for and highlight related bars
    */
    highlightSelectionLine(keyValues = []) {
        this.getInterSelLine()
            .classed('highlight', false)
            .filter(d=>keyValues.includes(d[this.getInterKeyLine()]))
            .classed('highlight', true);
        return this;
    }


    /*
    Public setter to change click callback
    - f: callback function to set for click 
    e.g. k=>{barchart1.highlightSelection([k]);} where k would be the key value passed in by the datum inupdateEvents
    */
    setClickLine(f = ()=>{}) {
        this._click_line = f;
        this.updateEventsLine(); // registers callback on selection
        return this;
    }


    /*
    Public setter to change mouseover callback
    */
    setMouseoverLine(f = ()=>{}) {
        this._mouseover_line = f;
        this.updateEventsLine();
        return this;
    }


    /*
    Public setter to change mouseout callback
    */
    setMouseoutLine(f = ()=>{}) {
        this._mouseout_line = f;
        this.updateEventsLine();
        return this;
    }


    /*
    Set interaction selection
    */
    setInterSelLine(selection) {
        this._ia_sel_line = selection;
    }


    /*
    Retrives interactive selection
    */
    getInterSelLine() {
        return this._ia_sel_line;
    }


    /*
    Set interaction key
    */
    setInterKeyLine(key) {
        this._ia_key_line = key;
    }


    /*
    Retrives interaction key
    */
    getInterKeyLine() {
        return this._ia_key_line;
    }


    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.v}` 
    default should be null to avoid creating empty tooltips
    */
    setTooltipLine(f = null) {
        this._tipText_f_line = f;
        this.updateTooltipsLine();
        return this;
    }
}