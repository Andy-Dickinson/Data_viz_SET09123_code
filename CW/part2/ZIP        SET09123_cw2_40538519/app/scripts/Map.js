import UK from '../libs/uk.js';

export default class Map{

    data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // margin is array [top, bottom, left, right], applied as a transformation

    scale_r;        // Scale to determine bubble radius
    zoom_radius_scale;   // Scale to adjust bubble radius for zoom
    
    click; mouseover; mouseout; dblclick;  // events
    click_attribute; mouseover_attribute; mouseout_attribute;
    tipText_f; tips_ref;         // tooltips

    bubbles;            // element selection
    
    

    projection;
    path;

    zoom;
    zoom_scale;

    ukUnits;
    ukBorders;
    ukCoast;

    // constructor
    constructor(container, chart_margin=[15,15,15,15], svg_width=viewportWidth*0.327, svg_height=viewportHeight*0.48625){
        // Initialize svg_width, svg_height and chart_margin
        this.svg_width = svg_width;
        this.svg_height = svg_height;
        this.chart_margin = chart_margin;  // Array [top, bottom, left, right]

        this.chart_width = this.svg_width - this.chart_margin[2] - this.chart_margin[3],
        this.chart_height = this.svg_height - this.chart_margin[0] - this.chart_margin[1];

        this.zoom_radius_scale = d3.scaleLinear()
            .domain([1, 8])  // Scale domain based on zoom scaleExtent
            .range([1, 0.25]); // Range set to be original size down to 1/4 size so bubbles get smaller with zoom allowing location to be more easily identified

        // Initialise event handlers and tooltips to empty functions
        this.click = () => {};
        this.mouseover = () => {};
        this.mouseout = () => {};
        this.dblclick = () => {};
        this.tipText_f = null;
        this.tips_ref = [];
        this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = "k";

        
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


        // getting the TopoJSON objects
        this.ukUnits = topojson.feature(UK, UK.objects.subunits);
        this.ukBorders = topojson.mesh(UK, UK.objects.subunits, (a,b)=>a!==b);
        this.ukCoast = topojson.mesh(UK, UK.objects.subunits, (a,b)=>a==b);

        this.svg.classed('bubblechart', true);
        this.bubbles = this.chart.selectAll('circle.bubble');
    }

    
    // Function to set the zoom behaviour
    #setZoom(data, min_bubble_r, max_bubble_r){
        this.zoom_scale = 1;
        this.zoom = d3.zoom()
            // Defines boundaries for which zoom behaviour is active (top left corner to bottom right corner - where zoom is allowed)
            .extent([[0,0], [this.svg_width,this.svg_height]])
            // Defines allowable translation range (how far user can pan)
            .translateExtent([[0,0], [this.svg_width,this.svg_height]])
            // Min / max zoom scales
            .scaleExtent([1,8])
            .on('zoom', ({transform})=>{
                // Separates translation from scaling to stop unwanted behaviour
                const scaled_center_x = (this.chart_margin[2]) * transform.k;
                const scaled_center_y = (this.chart_margin[0]) * transform.k;

                const adjusted_translate_x = scaled_center_x + transform.x;
                const adjusted_translate_y = scaled_center_y + transform.y;
                
                this.chart.attr('transform', `translate(${adjusted_translate_x}, ${adjusted_translate_y}) scale(${transform.k})`);

                if (transform.k !== this.zoom_scale){
                    // new zoom scale, need to re-render
                    // saves zoom_scale for next zoom call
                    this.zoom_scale = transform.k;
                    this.render(data, min_bubble_r, max_bubble_r);
                }
            })

        // Disables double click zoom to allow resetting of selectionStroke
        this.svg
            .call(this.zoom)
            .on('dblclick.zoom', null);
    }

    
    /* Render method to create or update the bubble chart

    Parameters:
        - data: 1d list of dicts, should have following keys with representative values- k: bubble binding data, lon: (x-axis) longitude values, lat: (y-axis) latitude values, r: radius values

    Optional params (provide as dict):
        - min_bubble_r: minimum bubble radius, default 3
        - max_bubble_r: maximum bubble radius, defaults 10
    */
    render(data, {min_bubble_r=3, max_bubble_r=10}={}){

        this.data = data;

        // Initialises the zoom
        if (this.zoom_scale === undefined) {
            this.#setZoom(data, min_bubble_r, max_bubble_r);
        }
        
        this.projection = d3.geoConicConformal()
            .fitSize([this.chart_width,this.chart_height], this.ukUnits);

        this.path = d3.geoPath()
            .pointRadius(4/this.zoom_scale)
            .projection(this.projection);


        // Data sorted in descending order so as to ensure small bubbles are plotted ontop of larger ones
        this.data = d3.sort(this.data, (a, b) => b.r - a.r);

        this.#setRadiusScale(min_bubble_r, max_bubble_r);


        this.#drawMapFeatures();

        this.#drawBubbles();

        // Adds events
        this.#updateEvents();

        // Adds tooltips
        this.#updateTooltips();
        
    
        return this;
    }


    #setRadiusScale(min_bubble_r, max_bubble_r) {
        let min = d3.min(this.data, d=>d.r);
        let max = d3.max(this.data, d=>d.r);

        const r_domain = [min, max];
        const r_range = [min_bubble_r, max_bubble_r];

        this.scale_r = d3.scaleLinear()
            .domain(r_domain)
            .range(r_range);
    }


    #drawMapFeatures() {
        // Land (grey features)
        this.chart.selectAll('path.unit')
            .data(this.ukUnits.features)
            .join('path')
            .classed('unit', true)
            .attr('d', this.path)
            .style('fill',d=>d.id==='IRL'?'white':'lightgrey');
        
        // Boarders (dotted lines)
        this.chart.selectAll('path.borders')
            .data([this.ukBorders])
            .join('path')
            .classed('borders', true)
            .attr('d', this.path)
            .style('stroke-chart_width', 1/this.zoom_scale)
            .style('stroke', 'lightslategrey')
            .style('stroke-dasharray', '1px 1px')
            .style('fill','none');

        // Coast line
        this.chart.selectAll('path.coast')
            .data([this.ukCoast])
            .join('path')
            .classed('coast', true)
            .attr('d', this.path)
            .style('stroke-chart_width', 1/this.zoom_scale)
            .style('stroke', 'lightslategrey')
            .style('fill','none');
    }


    #drawBubbles() {
        
        this.bubbles = this.bubbles.data(this.data, d => d.k ) // Bind data
            .join('circle')
            .classed('bubble', true)
            .attr('cx', d => this.projection([d.lon, d.lat])[0])
            .attr('cy', d => this.projection([d.lon, d.lat])[1])
            .attr('r', d => this.scale_r(d.r) * this.zoom_radius_scale(this.zoom_scale)); 

            
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


    /*
    Sets selected bubble to have a stroke class
    - keyValues: list of key values to search for and stroke related bubbles
    - stroke_attribute: must match value passed to set event function, default = "k"
    */
    selectionStroke(keyValues=[], stroke_attribute="k") {
        this.bubbles.classed('stroke', false)
            .filter(d=>keyValues.includes(d[`${stroke_attribute}`]))
            .classed('stroke', true);

        return this;
    }
}