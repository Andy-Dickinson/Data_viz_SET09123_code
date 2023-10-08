/*
creates barchart contained within g element, contained in SVG inside container passed
margins are applied by transforming the g element within the svg element
*/
export default class BarChart {

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
    #scaleX;
    #scaleY;
    #x; // x-axis units
    #y; // y-axis units


    /*
    Constructor for BarChart
    - container: DOM selector
    - width: visualisation width
    - height: visualisation height
    - margin: chart area margins [top, bottom, left, right]
    */
    constructor(container, width=600, height=400, margin=[50,50,50,50]) {
        // initialize width, height and margin
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Create an SVG element inside the container
        this.svg = d3.select(container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('barchart', true);

        // appends g element and adds margins
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`) // moves g element righty by left margin and down by top margin
            .classed('chart', true);

        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]}, ${this.height - this.margin[1]})`) // moves x-axis right by left margin and down by (height of svg - bottom margin)
            .classed('axisX', true);

        this.axisY = this.svg.append('g')
        .attr('transform', `translate(${this.margin[2]}, ${ this.margin[0]})`) // moves y-axis right by left margin and down by (height - top margin)
        .classed('axisY', true);
    }



    // Render method to create or update the bar chart
    // padding MUST be less than 1, defaults to 0.15
    render(data, categoryKey, categoryCount, x_title, padding) {

        this.data = data;
        this.#x = data.map(d=>d[`${categoryKey}`]);
        this.#y = `${categoryCount}`;

        // x-axis is bandScale
        this.#updateScales(true, padding);
        this.#addAxes(x_title);


        let barsG = this.svg.selectAll('g.chart');
        let rectangles = barsG.selectAll('rect.bar');

        // Remove existing bars before rendering new ones
        rectangles.remove();


        // Create D3 rectangles for data binding
        let barsBinded = rectangles
            .data(data, d => d[`${categoryKey}`]) // binds data by category
            .join('rect')
            .classed('bar', true)
            .attr('height', d => this.chartHeight - this.#scaleY(d[this.#y])) // height of each bar, accounts for upside down mapping
            .attr('width', this.#scaleX.bandwidth())  // width of each bar
            .attr('x', d=>this.#scaleX(d[`${categoryKey}`])) // horizontal coordinate origin - based on scaleBand
            .attr('y', d => this.#scaleY(d[this.#y])); // vertical coordinate origin (top left corner of each bar) - move each bar down by its own scaled height (reverse mapping on y-axis)



        // ----------- needs moving -----------------------
        // Apply styles, colors, and other attributes based on the data
        this.svg.selectAll('g.chart').selectAll('rect.bar').style('fill', d => d[this.#y] < 400 ? '#ba4a53' : null)
            .style('stroke', d => d[this.#y] < 400 ? '#381619' : null)
            .style('stroke-width', '2px');
    }


    // scales linear default, scales band if scaleBand set to true
    #updateScales(scaleBand=false, padding=0.15) {

        this.chartWidth = this.width - this.margin[2] - this.margin[3],
        this.chartHeight = this.height - this.margin[0] - this.margin[1];

        let rangeX = [0, this.chartWidth],
            rangeY = [this.chartHeight, 0];

        // scales band or linear for x-axis
        if (scaleBand === true) {
            this.#scaleX = d3.scaleBand()
                .domain(this.#x)
                .range([0, this.chartWidth])
                .padding(padding);
        } else {
            this.#scaleX = d3.scaleLinear()
                .domain(Math.min(0, d3.min(this.data, d=>d[this.#x])), d3.max(this.data, d=>d[this.#x]))
                .range(rangeX);
        }

        // y-axis
        let domainY = [Math.min(0, d3.min(this.data, d=>d[this.#y])), d3.max(this.data, d=>d[this.#y])];

        this.#scaleY = d3.scaleLinear(domainY, rangeY);
    }


    #addAxes(x_title=undefined) {

        let xAxis = d3.axisBottom(this.#scaleX),
            yAxis = d3.axisLeft(this.#scaleY);

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
    }
}