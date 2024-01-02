'use strict';

/*
Creates chart contained within g element, contained in SVG inside container passed
Margins are applied by transforming the g element within the svg element
Defines function to set linear scales - accounts for upside down mapping of y-axis
Defines function to add axes
Axes titles are a text element within the SVG element
Specific charts are rendered from their relevant classes
*/
export default class Chart {

    data;
    svg; svgWidth; svgHeight;               // svg - visualisation element
    chart;                                  // g element containing chart
    chartHeight; chartWidth; chartMargin;   // chart element, margin is array [top, bottom, left, right], applied as a transformation
    axisX; axisY;                           // g elements for axes
    x_key; y_key;                           // template literal string
    scaleX; scaleY;                         // scales


    /*
    Constructor for Chart
    - container: DOM selector
    - chartMargin: chart area margins [top, bottom, left, right]
    - svgWidth: visualisation Width
    - svgHeight: visualisation Height
    */
    constructor(container, chartMargin=[50,50,60,30], svgWidth=800, svgHeight=500) {
        // initialize svgWidth, svgHeight and chartMargin
        this.svgWidth = svgWidth;
        this.svgHeight = svgHeight;
        this.chartMargin = chartMargin;

        this.chartWidth = this.svgWidth - this.chartMargin[2] - this.chartMargin[3],
        this.chartHeight = this.svgHeight - this.chartMargin[0] - this.chartMargin[1];

        // Create an SVG element inside the container
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight)
            .classed('viz', true);

        // appends g element and adds margins
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.chartMargin[2]},${this.chartMargin[0]})`) // moves g element right by left chartMargin and down by top chartMargin
            .classed('chart', true);

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.chartMargin[2]}, ${this.svgHeight - this.chartMargin[1]})`) // moves x-axis right by left chartMargin and down by (height of svg - bottom chartMargin)
            .classed('axis-x', true);

        this.axisY = this.svg.append('g')
        .attr('transform', `translate(${this.chartMargin[2]}, ${ this.chartMargin[0]})`) // moves y-axis right by left chartMargin and down by top chartMargin
        .classed('axis-y', true);
    }




    /* sets scales linear, uses nice() method by default
        When x_zero / y_zero are false, uses data to define axis min
        padding options adjusts domains so datapoints are not at chart edges - [x_left, x_right, y_bott, y_top]
    */
    updateScalesLinear(x_zero=true, y_zero=true, nice=true, axis_pad=[0,0,0,0]) {

        let domainX,
            domainY;

        let rangeX = [0, this.chartWidth],
            rangeY = [this.chartHeight, 0]; // accounts for upside down mapping

        // x-axis - takes lowest value either from dataset or 0
        let x_min = d3.min(this.data, d => d[this.x_key]);
        let x_max = d3.max(this.data, d => d[this.x_key]);
        if (x_zero === true) {
            domainX = [(Math.min(0, x_min) - axis_pad[0]), (x_max + axis_pad[1])];
        } else {
            domainX = [(x_min - axis_pad[0]), (x_max + axis_pad[1])];
        }
        this.scaleX = d3.scaleLinear(domainX, rangeX);

        // y-axis - takes lowest value either from dataset or 0
        let y_min = d3.min(this.data, d => d[this.y_key]);
        let y_max = d3.max(this.data, d => d[this.y_key]);
        if (y_zero === true) {
            domainY = [((Math.min(0, y_min)) - axis_pad[2]), (y_max + axis_pad[3])];
        }else {
            domainY = [(y_min - axis_pad[2]), (y_max + axis_pad[3])];
        }
        this.scaleY = d3.scaleLinear(domainY, rangeY);

        if (nice === true) {
            this.scaleX.nice();
            this.scaleY.nice();
        }
    }



    // Adds axes and axes titles (if defined)
    // Titles are a text element within the SVG element
    addAxes(x_title=undefined, y_title=undefined, x_tickSize=6, y_tickSize=6) {

        let xAxis = d3.axisBottom(this.scaleX).tickSize(x_tickSize),
            yAxis = d3.axisLeft(this.scaleY).tickSize(y_tickSize);

        this.axisX.call(xAxis);
        this.axisY.call(yAxis);

        if (x_title !== undefined) {
        // x-axis title
        this.svg.append("text")
                .attr("class", "x-axis-title")
                .attr("text-anchor", "middle")
                .attr("x", (this.chartWidth / 2) + this.chartMargin[2]) // center of chart + left chartMargin
                .attr("y", this.svgHeight - (this.chartMargin[1] / 4)) // 1/4 of the bottom chartMargin up from the bottom of svg chart
                .text(x_title);
        }

        if (y_title !== undefined) {
            // y-axis title
            this.svg.append("text")
                .attr("class", "y-axis-title")
                .attr("text-anchor", "middle")
                .attr("x", -(this.chartHeight / 2) - this.chartMargin[0]) // center of chart - top chartMargin
                .attr("y", 3*(this.chartMargin[3] / 4)) // 3/4 of the left chartMargin
                .attr("transform", "rotate(-90)") // rotate the text to be vertical
                .text(y_title);
        }
    }
}