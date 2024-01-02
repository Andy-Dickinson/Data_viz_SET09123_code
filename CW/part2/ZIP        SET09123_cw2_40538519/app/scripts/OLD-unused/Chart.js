'use strict';

/*
Creates chart contained within g element, contained in SVG inside container passed
Margins are applied by transforming the g element within the svg element
Defines function to set linear scales - accounts for upside down mapping of y-axis
Defines function to calculate scales and domain
Defines function to add and create axes
Axes titles are a text element within the SVG element
Defines function to set a colourScale
Specific charts are rendered from their relevant classes
*/
export default class Chart {

    data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // chart element, margin is array [top, bottom, left, right], applied as a transformation
    axis_x; axis_y;                           // g elements for axes
    x_key; y_key;                           // template literal string
    scale_x; scale_y;                         // scales
    colour_scale;
    _click; _mouseover; _mouseout;  // events
    _tipText_f; _tips_ref;         // tooltips
    _ia_sel;  _ia_key;             // interaction selection and key used to access data for interactions, sel set in child classes after drawing (as has exit behaviour), key set in setData to x_key, view data attached to selection with logging _ia_sel.data()


    /*
    Constructor for Chart
    - container: DOM selector
    - chart_margin: chart area margins [top, bottom, left, right]
    - svg_width: visualisation Width
    - svg_height: visualisation Height
    */
    constructor(container, chart_margin=[50,50,60,30], svg_width=590, svg_height=389) {

        // Initialize svg_width, svg_height and chart_margin
        this.svg_width = svg_width;
        this.svg_height = svg_height;
        this.chart_margin = chart_margin;

        this.chart_width = this.svg_width - this.chart_margin[2] - this.chart_margin[3],
        this.chart_height = this.svg_height - this.chart_margin[0] - this.chart_margin[1];

        
        // Initialize event handlers and tooltips to empty functions or provide default behaviors
        this._click = () => {};
        this._mouseover = () => {};
        this._mouseout = () => {};
        this._tipText_f = null;
        this._tips_ref = [];


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
    }



    /* Set data, x_key, and y_key
    keys are set as template literals
    */
    setData(data, x_key, y_key) {
        this.data = data;
        this.x_key = `${x_key}`;
        this.y_key = `${y_key}`;

        this._ia_key = this.x_key;
    }


    /* Update linear scales for X and Y axes
    For x and y zero: when false, takes data min as domain min, when true, takes lowest of 0 or datamin
    */
    updateScalesLinear(include_x_domain_zero = true, include_y_domain_zero = true, nice, axis_pad = [0, 0, 0, 0]) {
        this.scale_x = this.calculateScale(this.data, this.x_key, [0, this.chart_width], include_x_domain_zero, nice, axis_pad.slice(0, 2));
        this.scale_y = this.calculateScale(this.data, this.y_key, [this.chart_height, 0], include_y_domain_zero, nice, axis_pad.slice(2, 4));
    }


    // Calculate a linear scale with optional nice() method
    calculateScale(data, key, range, include_domain_zero, nice = true, axis_pad) {
        const domain = this.calculateDomain(data, key, include_domain_zero, axis_pad);
        
        const scale = d3.scaleLinear().domain(domain).range(range);
        if (nice) {
            scale.nice();
        }
        return scale;
    }


    /* Calculate the domain for a scale
    When include_domain_zero is false, domain min is taken from data min
    axis_pad adds padding to the domain effectively increasing the axis to fit the data away from the edges
    */
    calculateDomain(data, key, include_domain_zero = true, axis_pad = [0, 0]) {
        const min = d3.min(data, d => d[key]);
        const max = d3.max(data, d => d[key]);
        if (include_domain_zero) {
            return [Math.min(0, min) - axis_pad[0], max + axis_pad[1]];
        } else {
            return [min - axis_pad[0], max + axis_pad[1]];
        }
    }


    /* Adds axes and axes titles (if defined)
    Titles are a text element within the SVG element
    */
    addAxes(x_title = undefined, y_title = undefined, x_tickSize = 6, y_tickSize = 6) {
        this.createAxis(this.scale_x, this.axis_x, x_title, x_tickSize, 'bottom'); // Use 'bottom' for x-axis
        this.createAxis(this.scale_y, this.axis_y, y_title, y_tickSize, 'left'); // Use 'left' for y-axis
    }

    
    // Create an axis using the specified scale and add an optional title
    createAxis(scale, axis, title, tick_size, position) {
        const axisGenerator = position === 'bottom' ? d3.axisBottom(scale).tickSize(tick_size) : d3.axisLeft(scale).tickSize(tick_size);
        axis.call(axisGenerator);

        if (title !== undefined) {
            this.createAxisTitle(title, scale, position);
        }
    }


    // Create an axis title and rotate if it's a Y-axis title
    createAxisTitle(title, scale) {
        // X axis title: x = center of chart + left chart margin, y = 1/4 of the bottom chart margin up from the bottom of svg chart
        // Y axis title: x = center of chart - top chart_margin, y = 3/4 of the left chart_margin
        const x = scale === this.scale_x ? this.chart_width / 2 + this.chart_margin[2] : -(this.chart_height / 2) - this.chart_margin[0];
        const y = scale === this.scale_x ? this.svg_height - this.chart_margin[1] / 4 : 3 * (this.chart_margin[3] / 4);

        this.svg.append('text')
            .attr('class', 'axis-title')
            .attr('text-anchor', 'middle')
            .attr('x', x)
            .attr('y', y)
            .attr('transform', scale === this.scale_x ? '' : 'rotate(-90)')
            .text(title);
    }


    // Set the color scale
    setColourScale(domain, range = 'schemeSet2', scale = 'scaleOrdinal') {
        this.colour_scale = d3[`${scale}`]()
            .domain(domain)
            .range(d3[`${range}`]);
    }


    /*
    Updates event handlers
    */
    updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
       
        this.getInterSel().on('click', (event, datum) => {
                this._click(datum[this.getInterKey()]); // changes clicked attribute
            })
            .on('mouseover', (event, datum) => {
                this._mouseover(datum[this.getInterKey()]);
            })
            .on('mouseout', (event, datum) => {
                this._mouseout(datum[this.getInterKey()]);
            })
    }


    /*
    Adds tooltips
    */
    updateTooltips() {
        // destroys any previously defined tooltips
        this._tips_ref.forEach(t => t.destroy());

        // only adds tooltips if accessor is not null
        if (this._tipText_f) {
            this.getInterSel().attr('data-tippy-content', this._tipText_f);
            this._tips_ref = tippy(this.getInterSel().nodes(), {
                allowHTML: true
            });
        }
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
        this._click = f;
        this.updateEvents(); // registers callback on selection
        return this;
    }


    /*
    Public setter to change mouseover callback
    */
    setMouseover(f = ()=>{}) {
        this._mouseover = f;
        this.updateEvents();
        return this;
    }


    /*
    Public setter to change mouseout callback
    */
    setMouseout(f = ()=>{}) {
        this._mouseout = f;
        this.updateEvents();
        return this;
    }

    
    /*
    Set interaction selection
    */
    setInterSel(selection) {
        this._ia_sel = selection;
    }


    /*
    Retrives interactive selection
    */
    getInterSel() {
        return this._ia_sel;
    }


    /*
    Set interaction key
    */
    setInterKey(key) {
        this._ia_key = key;
    }


    /*
    Retrives interaction key
    */
    getInterKey() {
        return this._ia_key;
    }


    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.v}` 
    default should be null to avoid creating empty tooltips
    */
    setTooltip(f = null) {
        this._tipText_f = f;
        this.updateTooltips();
        return this;
    }
}