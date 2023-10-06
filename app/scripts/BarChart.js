/*
creates barchart contained within g element, contained in svg inside containerSelector
*/
export default class BarChart {

    /*
    Constructor for BarChart
    - container: DOM selector
    - width: visualisation width
    - height: visualisation height
    - margin: chart area margins [top, bottom, left, right]
    */
    constructor(containerSelector, width, height, margin) {
        // initialize width, height and margin
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Create an SVG element inside the container
        this.svg = d3.select(containerSelector)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('barchart', true);

        // appends g element and adds margins
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`); // moves g element down by top margin and right by left margin
    }


    // Render method to create or update the bar chart
    render(data, categoryKey, categoryCount, barOffset, domainMin=0, domainMax='undefined') {

        var barsG = this.svg.selectAll('g');
        var selection = barsG.selectAll('rect.bar');

        // Remove existing bars before rendering new ones
        selection.remove();


        //  y axis
        // Define the input domain (data range)
        if (domainMax === 'undefined'){
            domainMax = (d3.max(data, d => d[`${categoryCount}`])); // used to map yScale
        }

        // Define the chart height (visual representation) - g element
        const g_height = this.height - this.margin[0] - this.margin[1]; // svg height - top margin - bottom margin

        // Create a linear scale
        const yScale = d3.scaleLinear()
            .domain([domainMin, domainMax])
            .range([0, g_height]); // from top margin to (g_height + top margin)


        // x axis
        // Define the input domain (data range)
        var dataUniqueSet = new Set(data.map(d => d[`${categoryKey}`]));  // maps data to be plotted in each bar to a set (to count number of bars for graph)
        var catQuantity = dataUniqueSet.size; // number of bars

        // (((width of svg - left margin - right margin) -  barOffset) / number of bars ) - barwidth
        // (width of visual space - barOffset for end of chart / number of bars) - barOffset
        var barWidth = (((this.width - this.margin[2] - this.margin[3]) - barOffset ) / catQuantity) - barOffset; 

        // Create D3 selections for data binding
        var barsBinded = selection
            .data(data, d => d[`${categoryKey}`]) // binds data by category
            .join('rect')
            .classed('bar', true)
            .attr('height', d => yScale(d[`${categoryCount}`])) // height of each bar
            .attr('width', barWidth)  // width of each bar
            .attr('x', (d, i) => i * barWidth + (i + 1) * barOffset) // horizontal coordinate origin > based on their index every bar width and offset
            .attr('y', d => g_height - yScale(d[`${categoryCount}`])); // vertical coordinate origin (top left corner of each bar) > (height of chart - height of bar)

        // Apply styles, colors, and other attributes based on the data
        barsBinded.style('fill', d => d[`${categoryCount}`] < 400 ? '#ba4a53' : null)
            .style('stroke', d => d[`${categoryCount}`] < 400 ? '#381619' : null)
            .style('stroke-width', '2px');
    }
}