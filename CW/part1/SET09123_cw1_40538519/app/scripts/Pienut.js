'use strict';

// Imports classes
import Chart from './Chart.js';


/*
Class to render pie / donut charts
Extends class Chart
Could rework how labels are generated, as if too long, or segments squished, they get on top of each other - but can also adjust with CSS targeting text.label
*/
export default class Pienut extends Chart{

    sorted_dataset;
    chart_size;             // Based on smallest chart size
    slice; slice_size;      // Pie segment keys: category and count
    label_space;
    pie_paths; pie_labels;  // element selection


    constructor(container, label_space=50, {chart_margin, svg_width, svg_height}={}) {
        super(container, chart_margin, svg_width, svg_height);

        // Not required for pie chart
        this.axis_x.remove();
        this.axis_y.remove();

        this.label_space = label_space;

        // Transforms specifically for pie chart (different to other charts)
        this.chart
            .attr('transform', `translate(${this.chart_margin[2]+this.chart_width/2},${this.chart_margin[0]+this.chart_height/2})`)    
            
        this.chart_size = Math.min(this.chart_width, this.chart_height) - this.label_space*2;

        this.svg.classed('pienut', true);
        this.pie_paths = this.chart.selectAll('path.pie');
        this.pie_labels = this.chart.selectAll('text.label')
    }



    /* Render a pie/donut chart

    Parameters:
    - data: 1d list of dicts
    - category_key: defines key for pie segment categories, as string
    - category_count: defines key for determining size of each segment, as string
   
    Optional params (provide as dict):
        - pad_angle: padding between segments, defaults 0.02
        - inner_r_factor: factor of chart_size for inner radius, defaults 0.25
        - outer_r_factor: factor of chart_size for outer radius, defaults 0.5
        - colour_scale: must be d3 built in colour scale provided as string, defaults 'scaleOrdinal'
        - colour_range: must be d3 built in colour range provided as string, defaults 'schemeSet2'
    */
    render(data, category_key, category_count, {pad_angle, inner_r_factor, outer_r_factor, colour_scale, colour_range} = {}) {
        // Set data, category_key, and category_count
        this.data = data;
        this.slice = `${category_key}`;
        this.slice_size = `${category_count}`;
        super.setInterKey(this.slice);

        var data = [{k:'Spring', t:100}]

        // Sort the dataset based on category_key
        this.sorted_dataset = this.data.sort((a, b) => d3.ascending(a[this.slice_size], b[this.slice_size]));

        // Generators and colour scale
        const pieData = this.createPieGen(pad_angle)(this.sorted_dataset);   // Transformed dataset
        let arcGen = this.createArcGen(inner_r_factor, outer_r_factor);
        super.setColourScale(pieData.map(d=>d.index), colour_range, colour_scale);

        // Draw the pie segments
        this.drawArcs(pieData, arcGen);

        // Update arc generator for adding labels
        arcGen = this.createArcGen(inner_r_factor, outer_r_factor, this.label_space);

        // Draw labels for pie segments
        this.drawLabels(pieData, arcGen);

        // Sets interaction selection (as drawBars has an exit behaviour oddly)
        this.setInterSel(this.pie_paths);

        // Adds events
        this.updateEvents(); // Overrides parent method

        // Adds tooltips
        this.updateTooltips(); // Overrides parent method

        return this;
    }
 

    // Create a pie generator
    createPieGen(pad_angle = 0.02) {
        return d3.pie()
            .padAngle(pad_angle)
            .sort(null)
            .value(d => d[this.slice_size]);
    }


    /* Create an arc generator
    label_space param is used when adjusting radius for label space
    */
    createArcGen(inner_r_factor = 0.25, outer_r_factor = 0.5, label_space = 0) {
        return d3.arc()
            .innerRadius(this.chart_size * inner_r_factor + label_space)
            .outerRadius(this.chart_size * outer_r_factor + label_space);
    }


    // Draw pie segments
    drawArcs(pieData, arcGen) {

        this.pie_paths = this.pie_paths.data(pieData)
                .join('path')
                .classed('pie', true)
                .attr('d', arcGen)
                .attr('fill', d => this.colour_scale(d.index))
                .attr('stroke', 'grey');
    }


    // Draw labels for pie segments
    drawLabels(pieData, arcGen) {

        this.pie_labels = this.pie_labels.data(pieData, d => d.data[this.slice])
                .join('text')
                .classed('label', true)
                .attr('transform', d => `translate(${arcGen.centroid(d)})`)
                .style('text-anchor', 'middle')
                .text(d => d.data[this.slice]);
    }


    /*
    Updates event handlers
    Overrides parent method
    */
    updateEvents() {
        var sele = super.getInterSel();
        var key = super.getInterKey();
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        sele.on('click', (event, datum) => {
                this._click(datum.data[key]); // changes clicked attribute
            })
            .on('mouseover', (event, datum) => {
                this._mouseover(datum.data[key]);
            })
            .on('mouseout', (event, datum) => {
                this._mouseout(datum.data[key]);
            })
    }


    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.v}` 
    default should be null to avoid creating empty tooltips
    Overrides parent method
    */
    setTooltip(f = null) {
        this._tipText_f = f;
        this.updateTooltips();  // Overrides parent method
        return this;
    }


    /*
    Adds tooltips
    Overrides parent method
    */
    updateTooltips() {
        var sele = super.getInterSel();

        // destroys any previously defined tooltips
        this._tips_ref.forEach(t => t.destroy());

        // only adds tooltips if accessor is not null
        if (this._tipText_f) {
            
            sele.attr('data-tippy-content', d=>this._tipText_f(d.data));
            this._tips_ref = tippy(sele.nodes());
        }
    }


    /*
    Highlights bars based on key values passed provided
    - keyValues: list of key values to search for and highlight related bars
    Overrides parent method
    */
    highlightSelection(keyValues = []) {
        super.getInterSel().classed('highlight', false)
            .filter(d=>keyValues.includes(d.data[super.getInterKey()]))
            .classed('highlight', true);
        return this;
    }
}