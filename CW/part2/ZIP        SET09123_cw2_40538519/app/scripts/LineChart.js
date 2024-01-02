'use strict';

/*
Class to render line charts
*/
export default class LineChart{

    data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // margin is array [top, bottom, left, right], applied as a transformation
    axis_x; axis_y;                           // g elements for axes
    
    scale_x; scale_y;                         // scales
    
    click; mouseover; mouseout; dblclick;  // dot events
    click_attribute; mouseover_attribute; mouseout_attribute;

    tipText_dots_f; tips_dots_ref; tipText_lines_f; tips_lines_ref;        // tooltips
    
    lines; dots; labels;    // element selection

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
        this.tipText_dots_f = null;
        this.tips_dots_ref = [];
        this.tipText_lines_f = null;
        this.tips_lines_ref = []; 
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

        // Add the 'linechart' class to the SVG
        this.svg.classed('linechart', true);
        this.lines = this.chart.selectAll('path.line');
        this.dots = this.chart.selectAll('g.dots');
        this.labels = this.chart.selectAll('g.labels');
    }



    /*
    Renders a line chart

    Parameters:
        - data: 1d list of dicts (for 1 line), or 2d list of list of dicts (for multiple lines), x_title and y_title should be set in the first dataset (optional)
    
    Optional params (provide as dict):
        - include_x_domain_zero: for x-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true
        - include_y_domain_zero: for y-axis, when false, domain min is taken from data min, else lowest of 0 or data_min, defaults true 
        - axis_pad: axis padding, provide as list [x_left, x_right, y_bott, y_top], all default to 0
        - dom_y_min: used to set a fixed y axis minimum
        - dom_y_max: used to set a fixed y axis maximum
        - nice: use nice method for axes, defaults true
        - x_tickSize: x-axis ticks defaults 6
        - y_tickSize: y-axis ticks defaults 6
        - line_width: defaults 3
        - curve_type: defines curve used for line gen as string, defaults 'curveNatural'
        - dot_size: defaults 5
        - include_labels: boolean, defaults true. Each dataset must have 'dataset' attribute in which the label text is the value
        - x_tick_format: set if wanting to format values used for x-axis tick labels
        - highlight_attribute: string attribute key for highlighting dot element, default 'k', sets all events to the same. 
                                To set separately, call specific set event function. Note, must match value passed to highlightSelection 

        NOTE: Only one scale is created from data min/max values for each axis, which all lines are plotted against
        Possible curve_types: see https://d3js.org/d3-shape/curve#curveLinear
    */
    render(data, {include_x_domain_zero, include_y_domain_zero, axis_pad, dom_y_min, dom_y_max, nice=true, x_ticksize, y_ticksize, line_width, curve_type, dot_size, include_labels=true, x_tick_format, highlight_attribute} = {}) {

        this.data = data;
        
        // If dataset is 1D, convert it to 2D
        if (this.data.every(d => !Array.isArray(d))) {
            this.data = [this.data];
        }

        // Sort each dataset
        this.data = this.data.map(dataset => d3.sort(dataset, d => d.k));

        // Extracts min and max x and y values from entire dataset(s), and used to set scales and axes
        this.#updateScales(include_x_domain_zero, include_y_domain_zero, axis_pad, dom_y_min, dom_y_max);
        if (nice) {
            this.scale_x = this.scale_x.nice();
            this.scale_y = this.scale_y.nice();
        }

        this.#addAxes(x_tick_format, x_ticksize, y_ticksize);
        
        this.#drawPaths(false, line_width, curve_type);
       
        this.#drawDots(false, dot_size);

        if(include_labels){
            // Add labels at the end of each line
            this.#addLabels(false);
        }

        if(highlight_attribute){
            this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = highlight_attribute;
        }
        this.#updateEvents();

        this.#updateTooltips();

        return this;
    }


    // Updates scales based on entire dataset(s) min/max
    #updateScales(include_x_domain_zero, include_y_domain_zero, axis_pad, dom_y_min, dom_y_max) {
        const x_domain = this.#calculateDomain(include_x_domain_zero, axis_pad, "x");
        const y_domain = this.#calculateDomain(include_y_domain_zero, axis_pad, "y", dom_y_min, dom_y_max);
        const x_range = [0, this.chart_width];
        const y_range = [this.chart_height, 0];

        this.scale_x = d3.scaleLinear()
            .domain(x_domain)
            .range(x_range);

        this.scale_y = d3.scaleLinear()
            .domain(y_domain)
            .range(y_range);
    }


    // Extracts min and max values from entire dataset for scales
    #calculateDomain(include_domain_zero=true, axis_pad=[0,0,0,0], axis, dom_min, dom_max) {
        let min;
        let max;
        const pad = axis === "x" ? axis_pad.slice(0,2) : axis_pad.slice(2,4);
        
        if (axis === "x") {
            min = d3.min(this.data, ds=>d3.min(ds, d=>d.k));
            max = d3.max(this.data, ds=>d3.max(ds, d=>d.k));
        } else if (dom_max && dom_min !== undefined) {
            min = dom_min;
            max = dom_max;
        } else {
            min = d3.min(this.data, ds=>d3.min(ds, d=>d.v));
            max = d3.max(this.data, ds=>d3.max(ds, d=>d.v));
        }
        
        if (include_domain_zero===true) {
            return [Math.min(0, min) - pad[0], max + pad[1]];
        } else {
            return [min - pad[0], max + pad[1]];
        }
    }


    /* Adds axes and axis titles (if defined)
    x_title and y_title should be set in the first dataset
    Titles are a text element within the SVG element
    */
    #addAxes(x_tick_format, x_tickSize=6, y_tickSize=6) {

            this.axis_x
                .transition()
                .duration(500)
                .call(d3.axisBottom(this.scale_x).tickSize(x_tickSize).tickFormat((d,i)=> x_tick_format ? x_tick_format(d) : d));
            this.axis_y
                .transition()
                .duration(500)
                .call(d3.axisLeft(this.scale_y).tickSize(y_tickSize));

        // Removes existing titles before adding new ones
        this.svg.selectAll('text.axis-title').remove();

        if (this.data[0][0].x_title) {
            this.#addAxisTitle("x");
        }

        if (this.data[0][0].y_title) {
            this.#addAxisTitle("y");
        }
    }


    /* Create an axis title and rotate if it's a Y-axis title
    x_title and y_title should be set in the first dataset
    */
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
            .text(axis === "x" ? this.data[0][0].x_title : this.data[0][0].y_title);
    }


    /* Add paths for each dataset
    Each line is coloured uniquely
    */
    #drawPaths(transition=false, line_width=3, curve_type='curveNatural') {
        const line_gen = d3.line()
            .x(d=>this.scale_x(d.k))
            .y(d=>this.scale_y(d.v))
            .curve(d3[curve_type]);
        const colour_scale = d3.scaleOrdinal()
            .domain([0,this.data.length])
            .range(d3.schemeSet2);
        
        // Bind
        this.lines = this.lines.data(this.data);

        // Remove old data
        this.lines.exit().remove();

        // Enter and update
        this.lines = this.lines.enter()
            .append('path')
            .merge(this.lines); // Enters and updates

        if (transition) {
            this.lines = this.lines
                .transition()
                .duration(500)
                .each((ds,i,nodes)=>{d3.select(nodes[i]).classed("line " + (i + 1), true);}) // sets class name based on dataset number (index + 1)
                .attr('d', ds=>line_gen(ds))
                .style('stroke', (ds,i)=>colour_scale(i)) // Apply colors based on dataset index
                .style('stroke-width', line_width)
                .style('fill', 'none')
                .end();
        } else {
            this.lines = this.lines
                .each((ds,i,nodes)=>{d3.select(nodes[i]).classed("line " + (i + 1), true);}) // sets class name based on dataset number (index + 1)
                .attr('d', ds=>line_gen(ds))
                .style('stroke', (ds,i)=>colour_scale(i)) // Apply colors based on dataset index
                .style('stroke-width', line_width)
                .style('fill', 'none')
        }

        this.lines = this.chart.selectAll('path.line');
    }


    // Add dots for each dataset
    #drawDots(transition=false, dot_size = 5) {
        const colour_scale = d3.scaleOrdinal()
        .domain([0, this.data.length])
        .range(d3.schemeSet2);

        // Bind
        this.dots = this.chart.selectAll('g.dots')
            .data(this.data);

        // Remove old data
        this.dots.exit().remove();

        // Enter datasets
        const dsGroups = this.dots.enter()
            .append('g')
            .merge(this.dots)
            .each((ds, i, nodes) => {
                d3.select(nodes[i]).classed("dots " + (i + 1), true);
            })  // sets class name based on dataset number (index + 1)
            .style('fill', (ds, i) => colour_scale(i));

        // Enter and update dots
        const ds_dots = dsGroups.selectAll('circle')
            .data(d => d, (d) => d.k)  
            .join(
                enter => enter.append('circle')
                    .classed('dot', true)
                    .attr('stroke', 'white')
                    .attr('cx', d => this.scale_x(d.k))
                    .attr('cy', d => this.scale_y(d.v))
                    .attr('r', dot_size),  
                update => update
                    .transition()
                    .duration(transition ? 500 : 0)
                    .attr('cx', d => this.scale_x(d.k))
                    .attr('cy', d => this.scale_y(d.v))
                    .attr('r', dot_size) 
            );

        this.dots = dsGroups.selectAll('circle').merge(ds_dots);
    }


    /* Add labels at the end of each line
    Each dataset must have 'dataset' attribute in which the label text is the value
    */
    #addLabels(transition) {
        const colour_scale = d3.scaleOrdinal()
        .domain([0, this.data.length])
        .range(d3.schemeSet2);

    // Bind
    this.labels = this.chart.selectAll('g.labels')
        .data(this.data);

    // Remove old data
    this.labels.exit().remove();

    // Enter and update labels
    this.labels.enter()
        .append('g')
        .classed('labels', true)
        .merge(this.labels)
        .each((ds, i, g_ele) => {
            // Gets the last data point of each dataset and finds its dots scaled position
            const lastIndex = ds.length - 1;
            const lastDataPoint = ds[lastIndex];
            const xPosition = this.scale_x(lastDataPoint.k);
            const yPosition = this.scale_y(lastDataPoint.v);

            // Gets g element corresponding to the label of the last data point for each dataset
            const labelGroup = d3.select(g_ele[i]);

            labelGroup.selectAll('text')
                .data([ds[i].dataset])  
                .join(
                    enter => enter.append('text')
                        .attr('x', xPosition + 10) // shifts label slightly away from last dot
                        .attr('y', yPosition)
                        .style('fill', colour_scale(i))
                        .style('font-size', 15)
                        .style('alignment-baseline', 'middle')
                        .text(d => d),
                    update => update
                        .transition()
                        .duration(transition ? 500 : 0)
                        .attr('x', xPosition + 10) 
                        .attr('y', yPosition) 
                );
        });

        this.labels = this.chart.selectAll('g.labels');
    }


    /*
    Updates event handlers
    */
    #updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        // Dots
        this.dots.on('click', (e, d)=>{
            if (Array.isArray(this.click_attribute)) {
                this.click(...this.click_attribute.map(attr => d[`${attr}`]));
            } else {
                this.click(d[`${this.click_attribute}`]);
            }
        })
        .on('mouseover', (e, d) => {
            if (Array.isArray(this.mouseover_attribute)) {
                this.mouseover(...this.mouseover_attribute.map(attr => d[`${attr}`]));
            } else {
                this.mouseover(d[`${this.mouseover_attribute}`]);
            }
        })
        .on('mouseout', (e, d) => {
            if (Array.isArray(this.mouseout_attribute)) {
                this.mouseout(...this.mouseout_attribute.map(attr => d[`${attr}`]));
            } else {
                this.mouseout(d[`${this.mouseout_attribute}`]);
            }
        })

        // Lines
        this.lines.on('mouseover', (e, d) => {
            d3.select(e.target).classed('highlight', true);
        })
        .on('mouseout', (e, d) => {
            d3.select(e.target).classed('highlight', false);
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
        this.tips_dots_ref.forEach(t=>t.destroy());
        this.tips_lines_ref.forEach(t=>t.destroy());

        // only adds tooltips if accessor is not null
        if (this.tipText_dots_f) {
            this.dots.attr('data-tippy-content', this.tipText_dots_f);
            this.tips_dots_ref = tippy(this.dots.nodes(), {
                allowHTML: true
            });
        }

        // only adds tooltips if accessor is not null
        if (this.tipText_lines_f) {
            this.lines.attr('data-tippy-content', this.tipText_lines_f);
            this.tips_lines_ref = tippy(this.lines.nodes(), {
                allowHTML: true
            });
            
        }
    }
    

    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.v}` 
    default should be null to avoid creating empty tooltips
    */
    setTooltip_dots(f=null) {
        this.tipText_dots_f = f;
        this.#updateTooltips();

        return this;
    }
    

    /*
    Sets accessor function to create tooltip text based on datum of elements
    e.g. d=>`${d.k}: ${d.v}` 
    default should be null to avoid creating empty tooltips
    */
    setTooltip_lines(f=null) {
        this.tipText_lines_f = f;
        this.#updateTooltips();

        return this;
    }


    /*
    Public setter to change click callback for dots
    - f: callback function to set for click 
    e.g. k=>{linchart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k". This can be a list of keys to check, if so, the order in which the keys are passed to highlight_attribute must match the order passed to highlightSelection function
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
    Public setter to change mouseover callback for dots
    - f: callback function to set for click 
    e.g. k=>{linechart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k". This can be a list of keys to check, if so, the order in which the keys are passed to highlight_attribute must match the order passed to highlightSelection function
    */
    setMouseover(f=()=>{}, highlight_attribute="k") {
        this.mouseover = f;
        this.mouseover_attribute = highlight_attribute;
        this.#updateEvents();

        return this;
    }


    /*
    Public setter to change mouseout callback for dots
    - f: callback function to set for click 
    e.g. k=>{linechart1.highlightSelection([k]);} where k would be the key value passed in by the datum in updateEvents
    - highlight_attribute: must match value passed to highlightSelection function, default = "k". This can be a list of keys to check, if so, the order in which the keys are passed to highlight_attribute must match the order passed to highlightSelection function
    */
    setMouseout(f=()=>{}, highlight_attribute="k") {
        this.mouseout = f;
        this.mouseout_attribute = highlight_attribute;
        this.#updateEvents();

        return this;
    }


     /*
    Highlights dots
    - keyValues: list of key values to search for and highlight related dots
    - highlight_attribute: must match value passed to set event function, default = "k". This can be a list of keys to check, if so, the order in which the keys are passed to highlight_attribute must match the order passed to the set event function
    */
    highlightSelection(keyValues=[], highlight_attribute="k") {
        this.dots.classed('highlight', false);
        
        if (Array.isArray(highlight_attribute)) {
            // Ensures only a single datapoint is highlighted and not all with same x value (d.k)
            this.dots.filter(d=>highlight_attribute.every((key, index) => d[key] !== undefined && d[key] === keyValues[index]))
                .classed('highlight', true);
        } else {
            this.dots.filter(d=>keyValues.includes(d[`${highlight_attribute}`]))
                .classed('highlight', true);
        }
        
        return this;
    }
    

    /*
    Changes axes when radio button clicked
    */
    axesChange(option, min_y, max_y, axis_pad, x_tick_format, nice=true, include_labels=true) {
        if (option === 'fixed') {
            this.#updateScales(false, true, axis_pad, min_y, max_y);
        } else if (option === 'scaled') {
            this.#updateScales(false, false, axis_pad);
        }

        if (nice) {
            this.scale_x = this.scale_x.nice();
            this.scale_y = this.scale_y.nice();
        }

        this.#addAxes(x_tick_format);
        this.#drawPaths(true);
        this.#drawDots(true);
        
        if(include_labels) {
            this.#addLabels(true)
        }

        return this;
    }
}