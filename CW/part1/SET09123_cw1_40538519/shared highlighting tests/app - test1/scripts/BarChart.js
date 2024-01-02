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
    _bars_ia_key; _bars_ia_sel;     // interaction selection and key
    _bars_click; _bars_mouseover; _bars_mouseout;

    constructor(container, {chart_margin, svg_width, svg_height}={}) {
        super(container, chart_margin, svg_width, svg_height);

        this.svg.classed('barchart', true);
        this.bars = this.chart.selectAll('rect.bar');


        this._bars_click = () => {};
        this._bars_mouseover = () => {};
        this._bars_mouseout = () => {};
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

        this._bars_ia_key = this.x_key;
        
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
        this.setInterSel(this.bars);

        // Adds events
        this.updateEvents();

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






    /*
    Updates event handlers
    */
    updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        this.getInterSel().on('click', (event, datum) => {
                this._bars_click(datum[this.getInterKey()]); // changes clicked attribute
            })
            .on('mouseover', (event, datum) => {
                this._bars_mouseover(datum[this.getInterKey()]);
            })
            .on('mouseout', (event, datum) => {
                this._bars_mouseout(datum[this.getInterKey()]);
            })
    }



     /*
    Highlights bars based on key values passed provided
    - keyValues: list of key values to search for and highlight related bars
    */
    highlightSelection(keyValues = []) {
        this.getInterSel().classed('highlight', false)
            .filter(d=>keyValues.includes(d[this.getInterKey()]))
            .classed('highlight', true);
        return this;
    }



    /*
    Public setter to change click callback
    - f: callback function to set for click 
    e.g. k=>{barchart1.highlightSelection([k]);} where k would be the key value passed in by the datum inupdateEvents
    */
    setClick(f = ()=>{}) {
        this._bars_click = f;
        this.updateEvents(); // registers callback on selection
        return this;
    }


    /*
    Public setter to change mouseover callback
    */
    setMouseover(f = ()=>{}) {
        this._bars_mouseover = f;
        this.updateEvents();
        return this;
    }


    /*
    Public setter to change mouseout callback
    */
    setMouseout(f = ()=>{}) {
        this._bars_mouseout = f;
        this.updateEvents();
        return this;
    }

    
    /*
    Set interaction selection
    */
    setInterSel(selection) {
        this._bars_ia_sel = selection;
    }


    /*
    Retrives interactive selection
    */
    getInterSel() {
        return this._bars_ia_sel;
    }


    /*
    Set interaction key
    */
    setInterKey(key) {
        this._bars_ia_key = key;
    }


    /*
    Retrives interaction key
    */
    getInterKey() {
        return this._bars_ia_key;
    }
}