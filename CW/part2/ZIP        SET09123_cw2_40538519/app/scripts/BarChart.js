'use strict';

/*
Class to render bar charts
Uses scaleBand for x-axis
*/
export default class BarChart{

    data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // margin is array [top, bottom, left, right], applied as a transformation
    axis_x; axis_y;                           // g elements for axes
    
    scale_x; scale_y;                         // scales
    
    click; mouseover; mouseout; dblclick;  // events
    click_attribute; mouseover_attribute; mouseout_attribute;
    tipText_f; tips_ref;         // tooltips

    bars;                           // element selection

    constructor(container, chart_margin=[50,50,60,30], svg_width=viewportWidth*0.327, svg_height=viewportHeight*0.48625) {
         // Initialize svg_width, svg_height and chart_margin
         this.svg_width = svg_width;
         this.svg_height = svg_height;
         this.chart_margin = chart_margin; // [top, bottom, left, right]
 
         this.chart_width = this.svg_width - this.chart_margin[2] - this.chart_margin[3],
         this.chart_height = this.svg_height - this.chart_margin[0] - this.chart_margin[1];
 
         
         // Initialise event handlers and tooltips to empty functions
         this.click = () => {};
         this.mouseover = () => {};
         this.mouseout = () => {};
         this.dblclick = () => {};
         this.tipText_f = null;
         this.tips_ref = [];
         this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = "k";


        //  Initialises scales
        this.scale_x = d3.scaleBand();
        this.scale_y = d3.scaleLinear();
 
 
         // Create an SVG element inside the container
         this.svg = d3.select(container)
             .append('svg')
             .attr('width', this.svg_width)
             .attr('height', this.svg_height)
             .classed('viz', true);
 
 
         // Appends g element and adds margins
         this.chart = this.svg.append('g')
             .attr('transform', `translate(${this.chart_margin[2]},${this.chart_margin[0]})`) // Moves g element right by left chart_margin and down by top chart_margin
             .classed('chart', true);
 
         this.axis_x = this.svg.append('g')
             .attr('transform', `translate(${this.chart_margin[2]}, ${this.svg_height - this.chart_margin[1]})`) // Moves x-axis right by left chart_margin and down by (height of svg - bottom chart_margin)
             .classed('axis-x', true);
 
         this.axis_y = this.svg.append('g')
         .attr('transform', `translate(${this.chart_margin[2]}, ${ this.chart_margin[0]})`) // Moves y-axis right by left chart_margin and down by top chart_margin
         .classed('axis-y', true);

        this.svg.classed('barchart', true);
        this.bars = this.chart.selectAll('rect.bar');
    }



    /*
    Method to render bar charts

    Parameters:
        - data: 1d list of dicts, x_title and y_title should be data attribute (optional)

    Optional params (provide as dict):
        - bar_pad: padding between bars, defaults 0.15, must be less than 1
        - include_domain_zero: when false, domain min is taken from data min, else lowest of 0 or data_min nice, defaults true
        - y_axis_pad: y-axis padding, provide as list [bottom, top]
        - dom_y_max: used to set a fixed y axis maximum
        - nice: use nice method for y-axis, defaults true
        - highlight_attribute: string attribute key for highlighting element, default 'k', sets all events to the same. 
                                To set separately, call specific set event function. Note, must match value passed to highlightSelection 
    */
    render(data, {bar_pad, include_domain_zero, y_axis_pad, dom_y_max, nice=true, highlight_attribute}={}) {
        
        // Only applies max data value to y axis if scaled axes radio is checked
        const scaledAxesRadio = document.getElementById('scaledAxes_precip');
        if (scaledAxesRadio.checked) {
            dom_y_max = undefined;
        };

        this.bars = this.chart.selectAll('rect.bar');
        this.data = data;
        
        this.#updateScales(bar_pad, include_domain_zero, y_axis_pad, dom_y_max);
        if (nice) {
            this.scale_y = this.scale_y.nice();
        }
        
        this.#addAxes();

        this.#drawBars();

        if(highlight_attribute){
            this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = highlight_attribute;
        }
        this.#updateEvents(highlight_attribute);

        this.#updateTooltips();

        return this;
    }


    #updateScales(bar_pad=0.15, include_domain_zero, y_axis_pad, dom_y_max) {
        const x_domain = this.data.map(d=>d.k);
        const y_domain = this.#calculate_yDomain(include_domain_zero, y_axis_pad, dom_y_max);
        const x_range = [0, this.chart_width];
        const y_range = [this.chart_height, 0];

        this.scale_x = d3.scaleBand()
            .domain(x_domain)
            .range(x_range)
            .padding(bar_pad);

        this.scale_y = d3.scaleLinear()
            .domain(y_domain)
            .range(y_range);
    }


    // Extracts min and max values from dataset for y scale
    #calculate_yDomain(include_domain_zero=true, y_axis_pad=[0,0], dom_y_max) {
        const min = d3.min(this.data, d=>d.v);
        const max = dom_y_max === undefined ? d3.max(this.data, d=>d.v) : dom_y_max;

        if (include_domain_zero) {
            return [Math.min(0, min) - y_axis_pad[0], max + y_axis_pad[1]];
        } else {
            return [min - y_axis_pad[0], max + y_axis_pad[1]];
        }
    }


     /* Adds axes and axis titles (if defined)
    Titles are a text element within the SVG element
    */
    #addAxes() {
        this.axis_x
            .transition()
            .duration(500)
            .call(d3.axisBottom(this.scale_x));
        this.axis_y
            .transition()
            .duration(500)
            .call(d3.axisLeft(this.scale_y));
        
        // Removes existing titles, before adding new ones
        this.svg.selectAll('text.axis-title').remove();

        if (this.data[0].x_title) {
            this.#addAxisTitle("x");
        }

        if (this.data[0].y_title) {
            this.#addAxisTitle("y");
        }
    }


    // Create an axis title and rotate if it's a Y-axis title
    #addAxisTitle(axis) {
        // X axis title: x = center of chart + left chart margin, y = 1/4 of the bottom chart margin up from the bottom of svg chart
        // Y axis title: x = center of chart - top chart_margin, y = 3/4 of the left chart_margin
        const x_pos = axis === "x" ? this.chart_width / 2 + this.chart_margin[2] : -(this.chart_height / 2) - this.chart_margin[0];
        const y_pos = axis === "x" ? this.svg_height - this.chart_margin[1] / 4 : 3 * (this.chart_margin[3] / 4);

        this.svg.append('text')
            .attr('class', 'axis-title')
            .attr('text-anchor', 'middle')
            .attr('x', x_pos)
            .attr('y', y_pos)
            .attr('transform', axis === "x" ? '' : 'rotate(-90)')
            .text(axis === "x" ? this.data[0].x_title : this.data[0].y_title);
    }


    // Draw the bars
    #drawBars(transition=false) {
        // Bind
        this.bars = this.bars.data(this.data, d=>d.k)

        // Remove old data
        this.bars.exit().remove();

        // Enter and update
        this.bars = this.bars.enter()
            .append('rect')
            .classed('bar', true)
            .merge(this.bars);  // Enters and updates

        if (transition) {
            this.bars = this.bars
                .transition()
                .duration(500)
                .attr('height', d=>this.chart_height - this.scale_y(d.v))
                .attr('width', this.scale_x.bandwidth())
                .attr('x', d=>this.scale_x(d.k))
                .attr('y', d=>this.scale_y(d.v))
                .end();
        } else {
            this.bars = this.bars
            .attr('height', d=>this.chart_height - this.scale_y(d.v))
            .attr('width', this.scale_x.bandwidth())
            .attr('x', d=>this.scale_x(d.k))
            .attr('y', d=>this.scale_y(d.v));
        }

        this.bars = this.chart.selectAll('rect.bar');
    }

    /*
    Updates event handlers
    */
    #updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        this.bars
            .on('click', (e, d)=>{
                this.click(d[`${this.click_attribute}`]); 
            })
            .on('mouseover', (e, d) => {
                this.mouseover(d[`${this.mouseover_attribute}`]);
            })
            .on('mouseout', (e, d) => {
                this.mouseout(d[`${this.mouseout_attribute}`]);
            })

        this.svg
            .on('dblclick', (e, d)=>{
                this.dblclick();
            })
    }


    /*
    Adds tooltips
    */
    #updateTooltips() {
        // destroys any previously defined tooltips
        this.tips_ref.forEach(t=>t.destroy());

        // only adds tooltips if accessor is not null
        if (this.tipText_f) {
            this.bars.attr('data-tippy-content', this.tipText_f);
            this.tips_ref = tippy(this.bars.nodes(), {
                allowHTML: true
            });
        }
    }


    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.v}` 
    default should be null to avoid creating empty tooltips
    */
    setTooltip(f=null) {
        this.tipText_f = f;
        this.#updateTooltips();
        
        return this;
    }


    /*
    Public setter to change click callback
    - f: callback function to set for click 
    e.g. k=>{barchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k"
    */
    setClick(f=()=>{}, highlight_attribute="k") {
        this.click = f;
        this.click_attribute = highlight_attribute;
        this.#updateEvents(); // registers callback on selection

        return this;
    }


    /*
    Public setter to set double click event function
    */
    setDblClick(f=()=>{}) {
        this.dblclick = f;
        this.#updateEvents();

        return this;
    }


    /*
    Public setter to change mouseover callback
    - f: callback function to set for click 
    e.g. k=>{barchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k"
    */
    setMouseover(f=()=>{}, highlight_attribute="k") {
        this.mouseover = f;
        this.mouseover_attribute = highlight_attribute;
        this.#updateEvents();

        return this;
    }


    /*
    Public setter to change mouseout callback
    - f: callback function to set for click 
    e.g. k=>{barchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k"
    */
    setMouseout(f=()=>{}, highlight_attribute="k") {
        this.mouseout = f;
        this.mouseout_attribute = highlight_attribute;
        this.#updateEvents();

        return this;
    }


     /*
    Highlights bars 
    - keyValues: list of key values to search for and highlight related bars
    - highlight_attribute: must match value passed to set event function, default = "k"
    */
    highlightSelection(keyValues=[], highlight_attribute="k") {
        this.bars.classed('highlight', false)
            .filter(d=>keyValues.includes(d[`${highlight_attribute}`]))
            .classed('highlight', true);

        return this;
    }


    /*
    Changes axes when radio button clicked
    */
    axesChange(option, max_x, nice=true) {
        if (option === 'fixed') {
            this.#updateScales(0.15, true, [0,0], max_x);
        } else if (option === 'scaled') {
            this.#updateScales(0.15, true, [0,0]);
        }
        
        if (nice){
            this.scale_y = this.scale_y.nice();
        }

        this.#addAxes();
        this.#drawBars(true);

        return this;
    }
}