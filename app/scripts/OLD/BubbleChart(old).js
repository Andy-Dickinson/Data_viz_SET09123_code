export default class BubbleChart {

    /*
    Constructor for BubbleChart
    - container: DOM selector
    - width: visualisation width
    - height: visualisation height
    - margin: chart area margins [top, bottom, left, right]
    */
    constructor(containerSelector, margin, width, height) {
        // initialize width, height and margin
        this.width = width;
        this.height = height;
        this.margin = margin;

        // Create an SVG element inside the container
        this.svg = d3.select(containerSelector)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .classed('bubblechart', true);

        // appends g element and adds margins
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin[2]},${this.margin[0]})`);
    }

    // Render method to create or update the bubble chart
    render(data) {
        // Remove existing bubbles before rendering new ones
        this.svg.selectAll('circle.pie').remove();

        // Create D3 selections for data binding
        let bubbles = this.svg.selectAll('circle.pie')
            .data(data, d => d.breed)
            .enter() // Enter selection for new data
            .append('circle')
            .classed('pie', true)
            .attr('cx', d => d.weight * 10)
            .attr('cy', d => d.height * 6)
            .attr('r', d => d.count * 0.0065);

        // Apply styles, colors, and other attributes based on the data
        bubbles.style('fill', d => d.count < 400 ? '#ba4a53' : null)
            .style('stroke', d => d.count < 400 ? '#381619' : null);
    }
}
