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
    svg; 
    width; // width of SVG element
    height; // height of SVG element
    chart; // g element containing chart
    axisX; // g element containing x-axis
    axisY; // g element containing y-axis
    chartHeight;
    chartWidth;
    margin; // array for margins around chart g element [top, bottom, left, right], applied as a transformation
    x_key;
    y_key;
    scaleX;
    scaleY;


    /*
    Constructor for Chart
    - container: DOM selector
    - margin: chart area margins [top, bottom, left, right]
    - width: visualisation width
    - height: visualisation height
    */
    constructor(container, margin=[50,50,60,30], width=800, height=500) {
        // initialize width, height and margin
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Create an SVG element inside the container
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('viz', true);

        // appends g element and adds margins
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`) // moves g element right by left margin and down by top margin
            .classed('chart', true);

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`) // moves x-axis right by left margin and down by (height of svg - bottom margin)
            .classed('axis-x', true);

        this.axisY = this.svg.append('g')
        .attr('transform', `translate(${this.margin[2]}, ${ this.margin[0]})`) // moves y-axis right by left margin and down by (height - top margin)
        .classed('axis-y', true);
    }




    // sets scales linear, uses nice() method
    updateScalesLinear() {

        this.chartWidth = this.width - this.margin[2] - this.margin[3],
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        let rangeX = [0, this.chartWidth],
            rangeY = [this.chartHeight, 0]; // accounts for upside down mapping

        // x-axis - takes lowest value either from dataset or 0
        let domainX = [Math.min(0, d3.min(this.data, d => d[this.x_key])), d3.max(this.data, d => d[this.x_key])];
        this.scaleX = d3.scaleLinear(domainX, rangeX).nice();

        // y-axis - takes lowest value either from dataset or 0
        let domainY = [Math.min(0, d3.min(this.data, d => d[this.y_key])), d3.max(this.data, d => d[this.y_key])];
        this.scaleY = d3.scaleLinear(domainY, rangeY).nice();
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
                .attr("x", (this.chartWidth / 2) + this.margin[2]) // center of chart + left margin
                .attr("y", this.height - (this.margin[1] / 4)) // 1/4 of the bottom margin up from the bottom of svg chart
                .text(x_title);
        }

        if (y_title !== undefined) {
            // y-axis title
            this.svg.append("text")
                .attr("class", "y-axis-title")
                .attr("text-anchor", "middle")
                .attr("x", -(this.chartHeight / 2) - this.margin[0]) // center of chart - top margin
                .attr("y", 3*(this.margin[3] / 4)) // 3/4 of the left margin
                .attr("transform", "rotate(-90)") // rotate the text to be vertical
                .text(y_title);
        }
    }
}