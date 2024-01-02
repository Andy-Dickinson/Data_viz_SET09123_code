'use strict';

/*
Class to render bubble charts
*/
export default class BubbleChart{

    data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // margin is array [top, bottom, left, right], applied as a transformation
    axis_x; axis_y;                           // g elements for axes
    
    scale_x; scale_y; scale_r;                // scales
    
    click; mouseover; mouseout;  // events
    click_attribute; mouseover_attribute; mouseout_attribute;
    tipText_f; tips_ref;         // tooltips

    bubbles;            // element selection

    constructor(container, chart_margin=[50,50,60,30], svg_width=590, svg_height=389) {
        // Initialize svg_width, svg_height and chart_margin
        this.svg_width = svg_width;
        this.svg_height = svg_height;
        this.chart_margin = chart_margin;

        this.chart_width = this.svg_width - this.chart_margin[2] - this.chart_margin[3],
        this.chart_height = this.svg_height - this.chart_margin[0] - this.chart_margin[1];

        
        // Initialise event handlers and tooltips to empty functions
        this.click = () => {};
        this.mouseover = () => {};
        this.mouseout = () => {};
        this.tipText_f = null;
        this.tips_ref = [];
        this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = "k";


        //  Initialises scales
        this.scale_x = d3.scaleLinear();
        this.scale_y = d3.scaleLinear();
        this.scale_r = d3.scaleLinear();


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

        this.svg.classed('bubblechart', true);
        this.bubbles = this.chart.selectAll('circle.bubble');
    }



    /* Render method to create or update the bubble chart

    Parameters:
        - data: 1d list of dicts, should have following keys with representative values- k: bubble binding data, x: x-axis values, y: y-axis values, r: radius values, x_title and y_title should be data attribute (optional)

    Optional params (provide as dict):
        - include_x_domain_zero: for x-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true
        - include_y_domain_zero: for y-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true 
        - axis_pad: axis padding, provide as list [x_left, x_right, y_bott, y_top], all default to 0
        - nice: use nice method for axes, defaults true
        - x_tickSize: x-axis ticks defaults 6
        - y_tickSize: y-axis ticks defaults 6
        - size_factor: of bubbles, used to scale bubble size default 1
    */
    render(data, {include_x_domain_zero, include_y_domain_zero, axis_pad, nice=true, x_ticksize, y_ticksize, size_factor} = {}) {

        this.data = data;
        

        // Data sorted in descending order so as to ensure small bubbles are plotted ontop of larger ones
        this.data = d3.sort(this.data, (a, b) => b.r - a.r);


        // Sets x and y scales used for the axes
        this.#updateScales(include_x_domain_zero, include_y_domain_zero, axis_pad);
        if (nice) {
            this.scale_x = this.scale_x.nice();
            this.scale_y = this.scale_y.nice();
        }
        
        this.#addAxes(x_ticksize, y_ticksize);       

        this.#drawBubbles(size_factor);

        // Adds events
        this.#updateEvents();

        // Adds tooltips
        this.#updateTooltips();

        return this;
    }


    // Updates scales based on dataset min/max
    #updateScales(include_x_domain_zero, include_y_domain_zero, axis_pad) {
        // x and y scales
        const x_domain = this.#calculateDomain("x", include_x_domain_zero, axis_pad);
        const y_domain = this.#calculateDomain("y", include_y_domain_zero, axis_pad);
        const x_range = [0, this.chart_width];
        const y_range = [this.chart_height, 0];

        this.scale_x = d3.scaleLinear()
            .domain(x_domain)
            .range(x_range);

        this.scale_y = d3.scaleLinear()
            .domain(y_domain)
            .range(y_range);


        // r scale
        const r_domain = this.#calculateDomain("r");

        // Sets max_radius to lowest value of chart height or width / number of data points 
        const max_radius = Math.min(this.chart_height, this.chart_width) / this.data.length;
        
        // rangeR
        const r_range = [0, max_radius];

        // Calculates scale for radius, domain_zero used, nice method not used
        this.scale_r = d3.scaleLinear()
            .domain(r_domain)
            .range(r_range);
    }


    
    // Extracts min and max values from dataset for scales
    #calculateDomain(axis, include_domain_zero=true, axis_pad=[0,0,0,0]) {
        let min;
        let max;
        
        if (axis === "r") {
            min = d3.min(this.data, d=>d.r);
            max = d3.max(this.data, d=>d.r);
        } else {
            min = axis === "x" ? d3.min(this.data, d=>d.x) : d3.min(this.data, d=>d.y);
            max = axis === "x" ? d3.max(this.data, d=>d.x) : d3.max(this.data, d=>d.y);
            axis_pad = axis === "x" ? axis_pad.slice(0,2) : axis_pad.slice(2,4);
        }

        if (include_domain_zero) {
            return [Math.min(0, min) - axis_pad[0], max + axis_pad[1]];
        } else {
            return [min - axis_pad[0], max + axis_pad[1]];
        }
    }


    /* Adds axes and axis titles (if defined)
    Titles are a text element within the SVG element
    */
    #addAxes(x_tickSize=6, y_tickSize=6) {
        this.axis_x.call(d3.axisBottom(this.scale_x).tickSize(x_tickSize));
        this.axis_y.call(d3.axisLeft(this.scale_y).tickSize(y_tickSize));
        
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


    // Draw bubbles
    #drawBubbles(size_factor = 1) {
       this.bubbles = this.bubbles.data(this.data, d => d.k) // Bind data
            .join('circle')
            .classed('bubble', true)
            .attr('cx', d => this.scale_x(d.x)) // x-axis
            .attr('cy', d => this.scale_y(d.y))  // y-axis 
            .attr('r', d => this.scale_r(d.r)*size_factor); // Radius
    }


    /*
    Updates event handlers
    */
    #updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        this.bubbles.on('click', (e, d)=>{
            this.click(d[`${this.click_attribute}`]); 
        })
        .on('mouseover', (e, d) => {
            this.mouseover(d[`${this.mouseover_attribute}`]);
        })
        .on('mouseout', (e, d) => {
            this.mouseout(d[`${this.mouseout_attribute}`]);
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
            this.bubbles.attr('data-tippy-content', this.tipText_f);
            this.tips_ref = tippy(this.bubbles.nodes(), {
                allowHTML: true
            });
        }
    }


    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.y}` 
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
    Highlights bubbles
    - keyValues: list of key values to search for and highlight related bubbles
    - highlight_attribute: must match value passed to set event function, default = "k"
    */
    highlightSelection(keyValues=[], highlight_attribute="k") {
        this.bubbles.classed('highlight', false)
            .filter(d=>keyValues.includes(d[`${highlight_attribute}`]))
            .classed('highlight', true);

        return this;
    }
}