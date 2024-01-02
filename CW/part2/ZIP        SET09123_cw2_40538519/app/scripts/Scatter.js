'use strict';

/*
Class to render line charts
*/
export default class Scatter{

    data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // margin is array [top, bottom, left, right], applied as a transformation
    axis_x; axis_y;                           // g elements for axes
    
    scale_x; scale_y;                         // scales
    
    click; mouseover; mouseout; dblclick;  // events
    click_attribute; mouseover_attribute; mouseout_attribute;
    tipText_f; tips_ref;         // tooltips

    points;    // element selection

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
        this.scale_x = d3.scaleLinear();
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

        this.svg.classed('scatter', true);
        this.points = this.chart.selectAll('circle.point');
    }



    /* 
    Render a scatter plot

    Parameters:
        - data: 1d list of dicts (for 1 line), x_title and y_title should be data attribute (optional)
    
    Optional params (provide as dict):
        - include_x_domain_zero: for x-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true
        - include_y_domain_zero: for y-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true 
        - axis_pad: axis padding, provide as list [x_left, x_right, y_bott, y_top], all default to 0
        - dom_x_max: used to set a fixed x axis maximum
        - dom_y_max: used to set a fixed y axis maximum
        - nice: use nice method for axes (applied to both)
        - dot_size: defaults 5
        - highlight_attribute: string attribute key for highlighting element, default 'k', sets all events to the same. 
                                To set separately, call specific set event function. Note, must match value passed to highlightSelection 
    */
    render(data, {include_x_domain_zero, include_y_domain_zero, axis_pad, dom_x_max, dom_y_max, nice=true, dot_size, highlight_attribute}={}) {

        /* Only applies data max values to axes if scaled axes radio checked
        Makes other param adjustments for when scaled is selected
        */
        const scaledAxesRadio = document.getElementById('scaledAxes_scat');
        if (scaledAxesRadio.checked) {
            dom_x_max = undefined;
            dom_y_max = undefined;
            include_x_domain_zero=false;
            include_y_domain_zero=false;
            axis_pad = [0.5,0.5,5,5];  // Ensure matches pad for scaled in axes change
        }

        this.data = data;
        
        // Extracts min and max x and y values from entire dataset(s), and used to set scales and axes
        this.#updateScales(include_x_domain_zero, include_y_domain_zero, axis_pad, dom_x_max, dom_y_max);
        if (nice) {
            this.scale_x = this.scale_x.nice();
            this.scale_y = this.scale_y.nice();
        }
        
        this.#addAxes();

        this.#drawPoints(dot_size);
        
        if(highlight_attribute){
            this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = highlight_attribute;
        }
        this.#updateEvents();

        this.#updateTooltips();

        return this;
    }
    

    // Updates scales based on dataset min/max
    #updateScales(include_x_domain_zero, include_y_domain_zero, axis_pad, dom_x_max, dom_y_max) {
        const x_domain = this.#calculateDomain(include_x_domain_zero, axis_pad, "x", dom_x_max);
        const y_domain = this.#calculateDomain(include_y_domain_zero, axis_pad, "y", dom_y_max);
        const x_range = [0, this.chart_width];
        const y_range = [this.chart_height, 0];
        
        this.scale_x = d3.scaleLinear()
            .domain(x_domain)
            .range(x_range);

        this.scale_y = d3.scaleLinear()
            .domain(y_domain)
            .range(y_range);
    }


    
    // Extracts min and max values from dataset for scales
    #calculateDomain(include_domain_zero=true, axis_pad=[0,0,0,0], axis, dom_max) {
        const min = axis === "x" ? d3.min(this.data, d=>d.k) : d3.min(this.data, d=>d.v);
        let max;
        
        if (dom_max !== undefined){
            max = dom_max;
        } else {
            max = axis === "x" ? d3.max(this.data, d=>d.k) : d3.max(this.data, d=>d.v);
        }
        const pad = axis === "x" ? axis_pad.slice(0,2) : axis_pad.slice(2,4);
        
        if (include_domain_zero) {
            return [Math.min(0, min) - pad[0], max + pad[1]];
        } else {
            return [min - pad[0], max + pad[1]];
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
        
        // Removes existing titles before adding new ones
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


    // Draw points on the scatter chart
    #drawPoints(dot_size=8, transition=false) {
        
        // Bind
        this.points = this.points.data(this.data, d=>d.k);

        // Remove old data
        this.points.exit().remove();

        // Enter and update
        this.points = this.points.enter()
            .append('circle')
            .classed("point", true)
            .merge(this.points);  // Enters and updates

        if (transition) {
            this.points = this.points
                .transition()
                .duration(500)
                .attr("cx", d=>this.scale_x(d.k))
                .attr("cy", d => this.scale_y(d.v))
                .attr("r", dot_size)
                .end();
        } else {
            this.points = this.points
                .attr("cx", d=>this.scale_x(d.k))
                .attr("cy", d => this.scale_y(d.v))
                .attr("r", dot_size);
        }

        this.points = this.chart.selectAll('circle.point');
    }


    /*
    Updates event handlers
    */
    #updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        this.points
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
            this.points.attr('data-tippy-content', this.tipText_f);
            this.tips_ref = tippy(this.points.nodes(), {
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
    e.g. k=>{scatterchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
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
    e.g. k=>{scatterchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
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
    e.g. k=>{scatterchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k"
    */
    setMouseout(f=()=>{}, highlight_attribute="k") {
        this.mouseout = f;
        this.mouseout_attribute = highlight_attribute;
        this.#updateEvents();

        return this;
    }


     /*
    Highlights points
    - keyValues: list of key values to search for and highlight related points
    - highlight_attribute: must match value passed to set event function, default = "k"
    */
    highlightSelection(keyValues=[], highlight_attribute="k") {
        this.points.classed('highlight', false)
            .filter(d=>keyValues.includes(d[`${highlight_attribute}`]))
            .classed('highlight', true);

        return this;
    }


    /*
    Changes axes when radio button clicked
    */
    axesChange(option, max_x, max_y, nice=true) {
        if (option === 'fixed') {
            this.#updateScales(true, true, [0,0,0,0], max_x, max_y);
        } else if (option === 'scaled') {
            this.#updateScales(false, false, [0.5,0.5,5,5]); // Ensure matches values set in render for scaled
        }

        if (nice) {
            this.scale_x = this.scale_x.nice();
            this.scale_y = this.scale_y.nice();
        }

        this.#addAxes();
        this.#drawPoints(8, true);

        return this;
    }
}