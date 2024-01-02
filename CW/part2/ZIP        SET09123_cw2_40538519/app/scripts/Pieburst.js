'use strict';

/*
Class to render sunburst charts with optional pie centre
*/
export default class Pieburst{

    data; current_data; alt_data;
    svg; svg_width; svg_height;               // svg - visualisation element
    chart;                                  // g element containing chart
    chart_height; chart_width; chart_margin;   // margin is array [top, bottom, left, right], applied as a transformation

    radius;
    arc_gen;
    
    click; mouseover; mouseout;  // events
    click_attribute; mouseover_attribute; mouseout_attribute;
    tipText_f; tips_ref;         // tooltips

    burst_paths; pie_paths; paths;   // element selection

    zoom;
    zoom_scale;

    new_render;

    constructor(container, chart_margin=[5,5,5,5], svg_width=viewportWidth*0.327, svg_height=viewportHeight*0.48625) {
        // Initialize svg_width, svg_height and chart_margin
        this.svg_width = svg_width;
        this.svg_height = svg_height;
        this.chart_margin = chart_margin; // [top, bottom, left, right]

        this.chart_width = this.svg_width - this.chart_margin[2] - this.chart_margin[3],
        this.chart_height = this.svg_height - this.chart_margin[0] - this.chart_margin[1];

        // Sets radius for sunburst, multiplies by 0.95 so as to allow room for extending leaves
        this.radius = (Math.min(this.chart_width, this.chart_height) / 2)*0.95;
        this.arc_gen = null;

        // Initialise event handlers and tooltips to empty functions
        this.click = () => {};
        this.mouseover = () => {};
        this.mouseout = () => {};
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
            .attr('transform', `translate(${this.chart_margin[2]+this.chart_width/2},${this.chart_margin[0]+this.chart_height/2})`)   
            .classed('chart', true);

        this.svg.classed('sunburst', true);
        this.burst_paths = this.chart.selectAll('path.burst');
        this.pie_paths = this.chart.selectAll('path.pie');
        this.paths = this.chart.selectAll('path');

        this.new_render = true;
    }


    // Function to set the zoom behaviour
    #setZoom(data, pieCentre, inner_colour_attr, leaf_colour_attr, spin_burst, cat_colours, leaf_colours, pie_colours, highlight_attribute, alt_data){
        this.zoom_scale = 1;
        
        this.zoom = d3.zoom()
            // Defines boundaries for which zoom behaviour is active (top left corner to bottom right corner - where zoom is allowed)
            .extent([[0,0], [this.svg_width,this.svg_height]])
            // Defines allowable translation range (how far user can pan)
            .translateExtent([[0,0], [this.svg_width,this.svg_height]])
            // Min / max zoom scales
            // Min / max zoom scales
            .scaleExtent([1,8])
            .on('zoom', ({transform})=>{ 

                // Separates translation from scaling to stop unwanted behaviour
                const scaled_centre_x = (this.chart_margin[2] + this.chart_width / 2) * transform.k;
                const scaled_centre_y = (this.chart_margin[0] + this.chart_height / 2) * transform.k;

                const adjusted_translate_x = scaled_centre_x + transform.x;
                const adjusted_translate_y = scaled_centre_y + transform.y;

                // Include rotation in the transformation if it exists
                const rotation = spin_burst ? ` rotate(${spin_burst})` : '';
                
                this.chart.attr('transform', `translate(${adjusted_translate_x}, ${adjusted_translate_y}) ${rotation} scale(${transform.k})`);


                if (transform.k !== this.zoom_scale){
                    // new zoom scale, need to re-render
                    // saves zoom_scale for next zoom call
                    this.zoom_scale = transform.k;
                    this.render(data, {pieCentre:pieCentre, inner_colour_attr:inner_colour_attr, leaf_colour_attr:leaf_colour_attr, spin_burst:spin_burst, cat_colours:cat_colours, leaf_colours:leaf_colours, pie_colours:pie_colours, highlight_attribute:highlight_attribute, alt_data:alt_data});
                }
            });


        this.svg
            .call(this.zoom)
            .on('dblclick.zoom', null);
    }


    /*
    Render a sunburst chart

    Parameters:
        - data: dict (or list containing a single dict) which has key 'k' with the value of the name of the dataset used for burst. All nodes with children should have key 'children' with value list of dicts. Each child node should have 'k' with name of node slice. Only leaf nodes should have key 'v' which represents the size of the node slice (ideally normalised). Parent node sizes are calculated from leaf nodes. To extend leaves when parent highlighted, must have key 'attr' in parent node where value matches key in leaf node.

    Optional params:
        - pieCentre: set to true if data contains key 'centreData' (as entry in data dict) and value is a list of dictionaries containing key 'k' where the value represents each segment category, and key 'v' which represents the slice size
        - inner_colour_attr: defaults "k", attribute used to colour ring 1 and middle rings
        - leaf_colour_attr: defaults "k", attribute used to colour leaf nodes, ,should match a value in leaf_k_values in data
        - spin_burst: applies rotate transformation to the rendered sunburst, provide as positive or negative string value, e.g. '-90'
        - cat_colours: default d3.schemeCategory10, specify list of colours or scheme for category colours used for inner and middle rings
        - leaf_colours: default d3.schemeSet2, specify list of colours or scheme for colours used for leaf nodes
        - pie_colours: default null, specify list of colours for pie centre
        - highlight_attribute: string attribute key for highlighting element, default 'k', sets all events to the same. 
                                To set separately, call specific set event function. Note, must match value passed to highlightSelection 
        - alt_data: dict of render attributes for swapping data (can be combinied with an event e.g. on click to call swapData)
    */
    render(data, {pieCentre, inner_colour_attr="k", leaf_colour_attr="k", spin_burst, cat_colours=d3.schemeCategory10, leaf_colours=d3.schemeSet2, pie_colours=d3.schemePaired, highlight_attribute, alt_data}={}){
        
        // Initialises the zoom
        if (this.zoom_scale === undefined || this.new_render) {
            this.new_render = false;
            // Optional rotate of chart applied
            if (spin_burst) {
                let curr_transform = this.chart.attr('transform');
                this.chart.attr('transform', curr_transform + ` rotate(${spin_burst})`);
            }

            this.#setZoom(data, pieCentre, inner_colour_attr, leaf_colour_attr, spin_burst, cat_colours, leaf_colours, pie_colours, highlight_attribute, alt_data);
        }

        
        if (Array.isArray(data) && data[0]){
            this.data = data[0];
        } else {
            this.data = data;
        }

        // Stores data for swapping
        this.current_data = {data:data, pieCentre:pieCentre, inner_colour_attr:inner_colour_attr, leaf_colour_attr:leaf_colour_attr, spin_burst:spin_burst, cat_colours:cat_colours, leaf_colours:leaf_colours, pie_colours:pie_colours, highlight_attribute:highlight_attribute};
        this.alt_data = alt_data;


        // Instance of partition, dividing availiable space into circles
        const partition = d3.partition()
            .size([2 * Math.PI, this.radius]);
    
        
        // Constructs a root node from hierachical data
        const root = d3.hierarchy(this.data)
            .sum(d=>d.v);

        /* Lays out specified root hierarchy, root and decendants have properties: x0 (start angle), x1 (end angle), y0 (inner radii), y1 (outter radii). These are converted with arc generator to angles and radii
        */
        partition(root);
        
        
        // Unique keys for nodes at depth 1 (first inner ring)
        const d1_nodes = root.descendants().filter(node => node.depth === 1);
        const unique_d1_KValues = Array.from(new Set(d1_nodes.map(node => node.data[`${inner_colour_attr}`])));

        // Unique keys for leaf nodes
        const leaf_nodes = root.descendants().filter(node => !node.children);
        const unique_leaf_KValues = Array.from(new Set(leaf_nodes.map(node => node.data[`${leaf_colour_attr}`])));


        // Define colour scales
        const cat_colourScale = d3.scaleOrdinal()
            .domain(unique_d1_KValues)
            .range(cat_colours);
        
        const leaf_colourScale = d3.scaleOrdinal()
            .domain(unique_leaf_KValues) // Provide an array of unique values of 'k'
            .range(leaf_colours);


        // Arc generator
        this.arc_gen = d3.arc()
            .startAngle(d=>d.x0)
            .endAngle(d=>d.x1)
            .innerRadius(d=>(d.y0 + 0.1))
            .outerRadius(d=>d.y1);

        // Draw burst
        this.burst_paths = this.chart.selectAll('path.burst')
            .data(root.descendants()) // Returns array of decendents starting with root node
            .join(
                enter => enter.append('path')
                .classed('burst', true)
                .classed('leaf', d => !d.children)
                .attr("display", d=>d.depth ? null : "none") // Sets root node display to none (so centre is not coloured)
                .attr("d", this.arc_gen) // Sets paths
                .attr('stroke', '#fff')  // Slice gaps white
                .attr("fill", d=>{
                    // Does not colour centre
                    if (!d.depth){
                        return d;
                    } else if (!d.children) {
                        // Leaf node coloured by category
                        return leaf_colourScale(d.data[`${leaf_colour_attr}`]);
                    } else {
                        // Inner and middle rings coloured by inner ring category
                    const d1_node = d.ancestors().find(node => node.depth === 1);
                    const segmentClass = 'segment-' + d.data[`${inner_colour_attr}`];
                        return cat_colourScale(d1_node.data[`${inner_colour_attr}`]);
                    }
                }),
                update => update
                .attr("display", d=>d.depth ? null : "none") // Sets root node display to none (so centre is not coloured)
                .attr("d", this.arc_gen) // Sets paths
                .attr('stroke', '#fff')  // Slice gaps white
                .attr("fill", d=>{
                    // Does not colour centre
                    if (!d.depth){
                        return d;
                    } else if (!d.children) {
                        // Leaf node coloured by category
                        return leaf_colourScale(d.data[`${leaf_colour_attr}`]);
                    } else {
                        // Inner and middle rings coloured by inner ring category
                    const d1_node = d.ancestors().find(node => node.depth === 1);
                    const segmentClass = 'segment-' + d.data[`${inner_colour_attr}`];
                        return cat_colourScale(d1_node.data[`${inner_colour_attr}`]);
                    }
                }),
                exit => exit.remove()
            );
        

        // Renders piechart in the centre of the sunburst
        if (pieCentre) {
            // Define colour scale
            const pie_colourScale = d3.scaleOrdinal()
                .range(pie_colours);
            
            const num_rings = d3.max(root.descendants(), d=>d.depth);
            
            // Draws slices in order provided
            // Sort found at https://stackoverflow.com/questions/70690369/how-to-keep-the-order-of-slices-fixed-in-a-pie-chart-d3
            const pie = d3.pie()
                .value(d=>d.v)
                .sort((a) => {
                    if (a.type === 'inc') {
                        return -1;
                    } else {
                        return 1;
                    }
                });

            // Pie gen
            const pieData = pie(this.data.centreData);

            // Arc gen
            const pieArc = d3.arc()
                .innerRadius(0)
                .outerRadius(this.radius / ((num_rings + 1) + 0.1/2));

            // Draws pie chart
            this.pie_paths = this.chart.selectAll('path.pie')
                .data(pieData)
                .join(
                    enter => enter.append('path')
                        .classed('pie', true)
                        .attr('d', d=>pieArc(d))
                        .attr('fill', (d,i)=>pie_colourScale(i)),
                    update => update
                        .attr('d', d=>pieArc(d))
                        .attr('fill', (d, i) => pie_colourScale(i)),
                    exit => exit.remove()
                );
        }

        this.paths = this.chart.selectAll('path');
    

        // Removes any legends before creating new ones
        this.svg.selectAll('.legend').remove();

        // Legend for nodes at depth 1
        this.#addLegend(cat_colourScale, unique_d1_KValues, {x:15, y:20})

        // Legend for leaf nodes
        this.#addLegend(leaf_colourScale, unique_leaf_KValues, {x:15, y:80})


        if(highlight_attribute){
            this.click_attribute = this.mouseover_attribute = this.mouseout_attribute = highlight_attribute;
        }
        this.#updateEvents();

        this.#updateTooltips();

        return this;
    }


    /* 
    Adds and positions legends
    */
    #addLegend(colourScale, labels, position = { x: 0, y: 0 }) {
       
        // Creates legend and positions
        let  legend = this.svg.append('g')
            .classed('legend', true)
            .attr('transform', `translate(${position.x},${position.y})`);
    
        // Dimentions for positioning items
        const legendRectSize = 15;
        const legendSpacing = 2;
        
        // Adds g element for each item and positions
        const legendItems = legend.selectAll('.legend-item')
            .data(colourScale.domain()) // Returns array of unique values in colour scale
            .join(
                enter => {
                    const itemEnter = enter.append('g')
                        .classed('legend-item', true)
                        .attr('transform', (d, i) => `translate(0,${i * (legendRectSize + legendSpacing)})`);
    
                    // Rectangles for legend
                    itemEnter.append('rect')
                        .attr('class', (d, i) => `colour-rect ${labels[i]}`)   
                        .attr('width', legendRectSize)
                        .attr('height', legendRectSize)
                        .style('fill', (d) => colourScale(d));
    
                    // Text for legend
                    itemEnter.append('text')
                        .attr('class', (d, i) => `legend-text ${labels[i]}`)
                        .attr('x', legendRectSize + legendSpacing)
                        .attr('y', legendRectSize - legendSpacing)
                        .text((d, i) => labels[i]);
                },
                update => {
                    update.attr('transform', (d, i) => `translate(0,${i*(legendRectSize + legendSpacing)})`);
                    update.select('rect')
                        .style('fill', (d) => colourScale(d));
                    update.select('text')
                        .text((d, i) => labels[i]);
                },
                exit => exit.remove()
            );

        // Calculate width and height of legend g element
        const legendWidth = legend.node().getBBox().width;
        const legendHeight = legend.node().getBBox().height;

        // Add rectangle to enclose everything
        legend.insert('rect', ':first-child')
            .classed('legend-rect', true)
            .attr('width', legendWidth*1.1)
            .attr('height', legendHeight*1.1)
            .style('fill', 'lightgray')
            .style('opacity', 0.7)
            .attr('transform', `translate(${-legendWidth*0.05},${-legendHeight*0.05})`);
            
    }    


    /*
    Updates event handlers
    */
    #updateEvents() {
        // First params has to be event type want to listen to
        // Second params is callback (executed when event occurs) - typically has two params: event obj and dataum attached to ele triggering event
        this.paths.on('click', (e, d)=>{
            this.click(d.data[`${this.click_attribute}`]); 
        })
        .on('mouseover', (e, d) => {
            this.mouseover(d.data[`${this.mouseover_attribute}`]);
        })
        .on('mouseout', (e, d) => {
            this.mouseout(d.data[`${this.mouseout_attribute}`]);
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
                this.paths.attr('data-tippy-content', this.tipText_f);
                this.tips_ref = tippy(this.paths.nodes(), {
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
    - If data has key 'attr' where (children) leaf nodes have key matching this value, then highlighted parents will extend those leaf nodes. Set key 'attr' in leaf nodes to extend when leaf is highlighted
    */
    highlightSelection(keyValues=[], highlight_attribute="k") {
        const highlighted = this.paths.classed('highlight', false)
            .filter(d=>keyValues.includes(d.data[`${highlight_attribute}`]))
            .classed('highlight', true);
       
        /* If highlighted node datum has key 'attr', extend child leaves
        If highlighted is leaf node and has key 'attr', extend using highlight_attribute */
        if (keyValues.length>0 && highlighted.datum().data.attr) {
            if (highlighted.classed('leaf')) {
                this.#extendLeafNodes(highlight_attribute, highlighted.datum().data[`${highlight_attribute}`]);
            }
            this.#extendLeafNodes(highlighted.datum().data.attr, highlighted.datum().data[`${highlight_attribute}`]);
        } else {
            this.#resetLeafNodes();
        }

        return this;
    }


    /* Extends leaf nodes where parent key 'attr' value is used to filter leaf nodes, i.e. extends children of highlighted node
    */
    #extendLeafNodes(parent_k_attr, parent_k_value) {
        const updatedArcGen = d3.arc()
                    .startAngle(d=>d.x0)
                    .endAngle(d=>d.x1)
                    .innerRadius(d=>(d.y0 + 0.1))
                    .outerRadius(d => d.y1 * 1.05);
        
        // Update the outer radius filtered leaf nodes
        const selected_leaf = this.chart.selectAll('path.leaf')
            .filter(d => d.data[`${parent_k_attr}`] === parent_k_value) 
            .classed('extend', true)
            .transition()
            .duration(300)
            .attr('d', d=>updatedArcGen(d));
    }
    
      // Reset extended leaf nodes
    #resetLeafNodes() {
        // Reset the outerRadius of all leaf nodes to their original values
        this.chart.selectAll('path.extend')
            .classed('extend', false)
            .transition()
            .duration(300)
            .attr('d', d => this.arc_gen(d)); 
    }


    /*
    Method to swap data when eventValue matches value in swap_on_attr list
    If no swap_on_attr_val list provided, then will swap data for anything value in eventValues (so long as not empty)
    */
    swapData(eventValues=[], swap_on_attr_val=eventValues) {
        
        const swapSelection = eventValues.filter(value => swap_on_attr_val.includes(value));

        if (swapSelection.length>0 && this.alt_data) {
            // Set data
            // Extracts and removes data from alt_data leaving options
            const data = this.alt_data.data;
            const options = this.alt_data;
            delete options.data;
            // Adds current_data as alt_data
            options['alt_data'] = this.current_data;

            // Boolean to ensure zoom and rotate are set
            this.new_render = true;

            // Resets chart position
            this.chart.attr('transform', `translate(${this.chart_margin[2]+this.chart_width/2},${this.chart_margin[0]+this.chart_height/2})`);
            
            // Sets colours for map
            // const attr_to_colour = data.centreData.map(d => d["k"]);
            // console.log(options.pie_colours);
            this.#setMapColour(data.centreData[0], options.pie_colours);

            this.render(data, options);
        }

        return this;
    }


    /* Function specifically to colour map bubbles based on 
    data which must have keys 'split_type' with values 'lat' or 'lon' and 'split' with lat/lon split around value.
    List of colours ordered where values greater than 'split' value will be coloured by first value
    */
    #setMapColour(data, colours) {
        const bubbles = d3.selectAll('circle.bubble');
        
        bubbles.style('fill', d => {
            // Get the split type ('lat' or 'lon') and corresponding split value
            const splitType = data.split_type;
            const splitValue = data.split;
    
            // Determine the value to compare based on the split type
            const valueToCompare = splitType === 'lat' ? d.lat : d.lon;

            // Set the fill colour based on the comparison result
            return valueToCompare >= splitValue ? colours[0] : colours[1];
        });

        return;
    }
}



