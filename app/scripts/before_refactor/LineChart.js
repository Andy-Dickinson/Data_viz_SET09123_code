'use strict';

// imports classes
import Chart from './Chart.js';

/*
Class to render line charts
Extends class Chart
*/
export default class LineChart extends Chart{

    sorted_dataset;

    constructor(container, chartMargin=[50,50,50,30], svgWidth=600, svgHeight=400) {
        super(container, chartMargin, svgWidth, svgHeight);

        this.sorted_dataset = [];

        // sets svg, margin, chart dimensions, axes and transforms
        this.svg.classed('linechart', true);
    }


    /*
    - data: dataset as a list of dictionaries (if 1 line), or as a 2D list of dictionaries for multiple lines
    - x_key: used to look up x-axis values, must be a string
    - y-key: used to look up y-axis values, must be a string
    - lineGroups: list of group titles in order relating to dataset
    - all other params are optional:
        - curveType: a string defining curve used in line generator
        - x_title / y_title: axis titles
        - axis_pad: adjusts domains so datapoints are not at chart edges - [x_left, x_right, y_bott, y_top] all default 0. May be required to fit in labels
        - x_zero / y_zero: when false, uses data to define axis min (defaults true)
        - nice: defines if to use nice method on x/y axis (defaults true)
        - dot_size: adjusts radius of the dots
        - Tick sizes default to 6
        - lineWidth: width of line drawn, defaults 3
    NOTE only one scale is created from data min / max values for each axis, which all lines are plotted against
    Possible curveTypes: see https://d3js.org/d3-shape/curve#curveLinear
    */
    render(data, x_key, y_key, lineGroups, curveType='curveLinear', x_title, y_title, axis_pad, x_zero, y_zero, nice, dot_size=5, x_tickSize, y_tickSize, lineWidth=3) {
        // sets keys
        this.x_key = `${x_key}`;
        this.y_key = `${y_key}`;

        // sets colour scale
        // A color scale: one color for each group
        var colourScale = d3.scaleOrdinal()
            .domain(lineGroups)
            .range(d3.schemeSet2);


        // if dataset is 1d, make it 2d
        if (data.every(d => !Array.isArray(d))) {
            data = [data];
        }

        // Sorts each dataset
        this.sorted_dataset = data.map(data=>d3.sort(data, d => d[x_key]));

        // updates scales and adds axes
        this.updateScales(x_zero, y_zero, nice, axis_pad);
        this.addAxes(x_title, y_title, x_tickSize, y_tickSize);


        let lines = this.svg.selectAll('g.chart');
        let paths = lines.selectAll('path.line');

        // Remove existing lines before rendering new ones
        paths.remove();


        // Create a line generator
        const lineGen = d3.line()
            .x(d => this.scaleX(d[this.x_key]))
            .y(d => this.scaleY(d[this.y_key]))
            .curve(d3[curveType]);

        // Add a path for each dataset
        lines.selectAll('path.line')
            .data(this.sorted_dataset)
            .enter()
            .append('path')
            .classed('line', true)
            .attr('d', d => lineGen(d))
            .style('stroke', (d, i) => colourScale(lineGroups[i])) // Apply colors based on lineGroups
            .style('stroke-width', lineWidth)
            .style('fill', 'none');


        // removes existing dots before rendering new ones
        let dots = lines.selectAll('g.dots');
        dots.remove();

        // Add the points
        lines.selectAll("g.dots")
          .data(this.sorted_dataset)
          .enter()
          .append('g')
          .classed("dots", true)
          .style("fill", (d,i) => colourScale(lineGroups[i]))
            .selectAll("circle")
            .data(d=>d)
            .enter()
            .append("circle")
            .attr("cx", d => this.scaleX(d[this.x_key]) )
            .attr("cy", d => this.scaleY(d[this.y_key]) )
            .attr("r", dot_size)
            .attr("stroke", "white");


        // removes existing labels before rendering new ones
        let labels = lines.selectAll('g.labels');
        labels.remove();

        // Add a labels at the end of each line
        lines.selectAll("g.labels")
          .data(this.sorted_dataset)
          .enter()
          .append('g')
          .classed('labels', true)
          .each((data, i, d) => {
            // gets the last data point of each dataset and finds its dots scaled position
            let lastIndex = data.length - 1;
            let lastDataPoint = data[lastIndex];
            let xPosition = this.scaleX(lastDataPoint[this.x_key]);
            let yPosition = this.scaleY(lastDataPoint[this.y_key]);
            
            // gets g element corresponding to the label of the last data point for each dataset
            let labelGroup = d3.select(d[i]);
        
            labelGroup
              .append("text")
              .text(lineGroups[i])
              .attr("x", xPosition + 10) // shifts label slightly away from last dot
              .attr("y", yPosition)
              .style("fill", colourScale(lineGroups[i]))
              .style("font-size", 15)
              .style("alignment-baseline", "middle");
          });
    }



    updateScales(x_zero, y_zero, nice, axis_pad) {

        // Scales
        // extracts min and max values from entire dataset for scales
        let x_data_min = d3.min(this.sorted_dataset, ds => d3.min(ds, d => d[this.x_key]));
        let x_data_max = d3.max(this.sorted_dataset, ds => d3.max(ds, d => d[this.x_key]));
        let y_data_min = d3.min(this.sorted_dataset, ds => d3.min(ds, d => d[this.y_key]));
        let y_data_max = d3.max(this.sorted_dataset, ds => d3.max(ds, d => d[this.y_key]));


        // sets datasets min/max to a list of dicts used to create linear scales
        this.data = [{[this.x_key]:x_data_min, [this.y_key]:y_data_min}, {[this.x_key]:x_data_max, [this.y_key]:y_data_max}];


        super.updateScalesLinear(x_zero, y_zero, nice, axis_pad);

        // sets data to be sorted_dataset (to protect against errors)
        this.data = this.sorted_dataset;
    }
}