'use strict';

// imports classes
import Chart from './Chart.js';

/*
Class to render line charts
Extends class Chart
*/
export default class Scatter extends Chart{

    colourScale;

    constructor(container, chartMargin=[50,50,50,30], svgWidth=600, svgHeight=400) {
        super(container, chartMargin, svgWidth, svgHeight);

        // sets svg, margin, chart dimensions, axes and transforms
        this.svg.classed('scatter', true);
    }


    render(data, x_key, y_key, x_title, y_title, groupTitles, axis_pad, x_zero, y_zero, nice, dot_size=5, x_tickSize, y_tickSize) {
        // sets keys
        this.x_key = `${x_key}`;
        this.y_key = `${y_key}`;

        // sets colour scale
        // A color scale: one color for each group
        this.colourScale = d3.scaleOrdinal()
            .domain(groupTitles)
            .range(d3.schemeSet2);


        // if dataset is 1d, make it 2d
        if (data.every(d => !Array.isArray(d))) {
            data = [data];
        }

         // updates scales and adds axes
         this.updateScales(data, x_zero, y_zero, nice, axis_pad);
         this.addAxes(x_title, y_title, x_tickSize, y_tickSize);


         let chartG = this.svg.selectAll('g.chart');

          // removes existing dots before rendering new ones
        let dots = chartG.selectAll('g.dots');
        dots.remove();

        // Add the points
        chartG.selectAll("g.dots")
          .data(this.data)
          .enter()
          .append('g')
          .classed("dots", true)
          .style("fill", (d,i) => this.colourScale(groupTitles[i]))
            .selectAll("circle")
            .data(d=>d)
            .enter()
            .append("circle")
            .attr("cx", d => this.scaleX(d[this.x_key]) )
            .attr("cy", d => this.scaleY(d[this.y_key]) )
            .attr("r", dot_size)
            .attr("stroke", "white");


        // removes existing labels before rendering new ones
        let labels = chartG.selectAll('g.labels');
        labels.remove();

        // Add a labels for each group
        chartG.selectAll("g.labels")
          .data(this.data)
          .enter()
          .append('g')
          .classed('labels', true)
          .each((all_datasets, i, dataset) => {
            
            // gets g element corresponding to the label for each dataset
            let labelGroup = d3.select(dataset[i]);
        
            labelGroup
              .append("text")
              .text(groupTitles[i])
              .attr("x", this.chartWidth - 40) // shifts label slightly away edge of chart
              .attr("y", 25*i)
              .style("fill", this.colourScale(groupTitles[i]))
              .style("font-size", 20)
              .style("alignment-baseline", "middle");
          });
    }

    updateScales(data, x_zero, y_zero, nice, axis_pad) {

        // Scales
        // extracts min and max values from entire dataset for scales
        let x_data_min = d3.min(data, ds => d3.min(ds, d => d[this.x_key]));
        let x_data_max = d3.max(data, ds => d3.max(ds, d => d[this.x_key]));
        let y_data_min = d3.min(data, ds => d3.min(ds, d => d[this.y_key]));
        let y_data_max = d3.max(data, ds => d3.max(ds, d => d[this.y_key]));


        // sets datasets min/max to a list of dicts used to create linear scales
        this.data = [{[this.x_key]:x_data_min, [this.y_key]:y_data_min}, {[this.x_key]:x_data_max, [this.y_key]:y_data_max}];


        super.updateScalesLinear(x_zero, y_zero, nice, axis_pad);

        // sets this.data to original dataset
        this.data = data;
    }
}