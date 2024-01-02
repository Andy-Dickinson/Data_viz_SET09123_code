export default class Barchart{
    // Attributes
    innerWidth; innerHeight;    // effecive size

    svg; chart; bars; xAxis; yAxis;     // elements

    xScale; yScale;             // scales

    barClick; barOver; barOut;  // callbacks
    tpText; barTips;            // tooltips

    data;                       // data

    // constructor
    constructor(container='body', width=500, height=500, margin=[10,10,10,10]){
        // set size
        let [top, bottom, left, right] = margin;
        this.innerWidth = width - left - right;
        this.innerHeight = height - top - bottom;

        // initialise selections
        this.svg = d3.select(container).append('svg')
            .classed('barchart', true)
            .attr('width', width).attr('height', height);
        this.chart = this.svg.append('g').attr('transform', `translate(${left},${top})`);
        this.xAxis = this.svg.append('g').attr('transform', `translate(${left},${height-bottom})`);
        this.yAxis = this.svg.append('g').attr('transform', `translate(${left},${top})`);
        this.bars = this.chart.selectAll('rect.bar');

        // initialise scales
        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        // initialise interactions
        this.barClick = ()=>{};
        this.barOver = ()=>{};
        this.barOut = ()=>{};
        this.tpText = null;
        this.barTips = [];
    }

    // private methods
    #updateScales(){
        let xRange = [0,this.innerWidth],
            yRange = [this.innerHeight, 0],
            xDomain = this.data.map(d=>d.k),
            yDomain = [0, d3.max(this.data, d=>d.v)];
        this.xScale.domain(xDomain).range(xRange).padding(0.3);
        this.yScale.domain(yDomain).range(yRange).nice();
    }

    #updateEvents(){
        // events trigger the callback functions
        // here the callback take the element key as argument
        this.bars.on('click',(e,d)=>{
            // console.log(d);
            this.barClick(d.k);
        })
        this.bars.on('mouseover',(e,d)=>{
            // console.log(d);
            this.barOver(d.k);
        })
        this.bars.on('mouseout',(e,d)=>{
            // console.log(d);
            this.barOut(d.k);
        })
    }

    #updateTooltips(){
        this.barTips.forEach(t=>t.destroy());
        if(this.tpText){
            this.bars.attr('data-tippy-content', this.tpText);
            this.barTips = tippy(this.bars.nodes());
        }
    }

    #updateBars(){
        this.bars = this.bars.data(this.data, d=>d.k)
            .join('rect')
            .classed('bar', true)
            .attr('x', d=>this.xScale(d.k))
            .attr('y', d=>this.yScale(d.v))
            .attr('width', this.xScale.bandwidth())
            .attr('height', d=>this.yScale(0)-this.yScale(d.v));
    }

    #updateAxis(){
        this.xAxis.call(d3.axisBottom(this.xScale));
        this.yAxis.call(d3.axisLeft(this.yScale));
    }

    // public API

    /**
     * Render function, dataset should be in [{key,value}] format
     */
    render(dataset){
        this.data = dataset;
        this.#updateScales();
        this.#updateBars();
        this.#updateAxis();
        this.#updateEvents();
        this.#updateTooltips();
        return this;
    }

    /**
     * Tooltip text setter
     */
    setTooltip(f=null){
        this.tpText = f;
        this.#updateTooltips();
        return this;
    }

    /**
     * Click callback setter
     */
    setClick(f=()=>{}){
        this.barClick = f;
        this.#updateEvents();
        return this;
    }

    /**
     * Hover callback setter
     */
    setOver(f=()=>{}){
        this.barOver = f;
        this.#updateEvents();
        return this;
    }

    /**
     * Out callback setter
     */
    setOut(f=()=>{}){
        this.barOut = f;
        this.#updateEvents();
        return this;
    }

    /**
     * Highlight bars from list of keys
     */
    highlightBars(keys=[]){
        this.bars.classed('highlight', false)
            .filter(d=>keys.includes(d.k))
            .classed('highlight', true);
        return this;
    }
}