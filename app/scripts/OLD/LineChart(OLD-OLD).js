'use strict';

// imports classes
import Chart from './Chart.js';


/*
Class to render line charts
Extends class Chart
Inclues methods to return a line generator and sort multiple datasets
*/
export default class LineChart extends Chart{

    sorted_dataset;
    lineGen;


    constructor(container, chartMargin=[50,50,50,30], svgWidth=600, svgHeight=400) {
        super(container, chartMargin, svgWidth, svgHeight);

        this.svg.classed('linechart', true);
    }


    /* Render method to create or update the line chart
    - data: dataset as a list of dictionaries (if 1 line), or as a 2D list of dictionaries for multiple lines
    - x_key: used to look up x-axis values, must be a string
    - y-key: used to look up y-axis values, must be a string
    - curveType: a string defining curve used in line generator
    - (optional) x_zero / y_zero: when false, uses data to define axis min
    - (optional) padding options (x_pad_right, y_pad_bott etc) adjusts domains so datapoints are not at chart edges - defaults 0
    NOTE only one scale is created from data min / max values for each axis, which all lines are plotted against
    Both x and y keys can be strings even if data is 2D, but if data 1D, must be string
    All other parameters are optional
    Tick sizes default to 6
    Nice defines if to use nice method on x/y axis (defaults to true)
    Possible curveTypes: see https://d3js.org/d3-shape/curve#curveLinear
    */
    render(data, x_key, y_key, curveType, x_title, y_title, x_zero, y_zero, nice, x_pad_left, x_pad_right, y_pad_bott, y_pad_top, x_tickSize, y_tickSize, lineWidth=3) {

// add way to hide end ticks, probably as method in chart ----------------------------------------------------------------------------------------
        // sets keys dependent on if keys are passed as list of strings or a string
        this.x_key = `${x_key}`;
        this.y_key = `${y_key}`;


        // checks if data is 1D or 2D
        this.updateScales(data, x_zero, y_zero, nice, x_pad_left, x_pad_right, y_pad_bott, y_pad_top);
        this.addAxes(x_title, y_title, x_tickSize, y_tickSize);


        let lines = this.svg.selectAll('g.chart');
        let paths = lines.selectAll('path.line');

        // Remove existing bars before rendering new ones
        paths.remove();

        if (this.sorted_dataset.every(d => !Array.isArray(d))) {
            // 1d array dataset

            let line = lines.append('path')
                .datum(this.sorted_dataset)
                .attr("stroke-width", lineWidth)
                .classed('line', true)
                .attr('d', this.gen_line(curveType, this.x_key, this.y_key));
        } else {
            // 2d array dataset

            let loop_x_keys = false;
            let loop_y_keys = false;

            if (this.x_key_list !== undefined){
                // multiple x keys
                loop_x_keys = true;
            }

            if (this.y_key_list !== undefined){
                // multiple y keys
                loop_y_keys = true;
            }


            for (let i= 0; i < this.sorted_dataset.length; i++) {
                let line = lines.append('path')
                .datum(this.sorted_dataset[i])
                .attr("stroke-width", lineWidth)
                .classed('line ' + i, true)
                .attr('d', this.gen_line(curveType, this.x_key, this.y_key));//loop_x_keys === true ? this.x_key_list[i]:this.x_key, loop_y_keys === true ? this.y_key_list[i]:this.y_key));
            }
        }
    }


    /*
    method returns a line generator
    */
    gen_line(curveType, x_attr, y_attr) {
        let line= d3.line()
                .curve(d3[`${curveType}`]) 
                .x(d => this.scaleX(d[`${x_attr}`]))
                .y(d => this.scaleY(d[`${y_attr}`]));

        return line;
    }


    /*
    Method to sort 2d arrays of multiple datasets and assigns to sorted_dataset
    - key can be a list of strings or a single string
    */
    sort_multi_ds(dataset, key) {
        if (typeof(key) === "string") {
            // when key is singular
            this.sorted_dataset = dataset.map(arr => d3.sort(arr, (a, b) => a[`${key}`] - b[`${key}`]));
        } else {
            // sorts each list within dataset by the corresponding key related by index
            this.sorted_dataset = dataset.map((subArr, i) => {
                return d3.sort(subArr, (a, b) => a[`${key[i]}`] - b[`${key[i]}`]);
            });
        }
    }


    // ------------------------------------------check scales work for when some datasets min are 0 and others are higher, also when negative mins
    /*
    Defines scales based on dataset entirety min and max values
    Sorts datasets according to x-axis key(s)
    */
    updateScales(data, x_zero, y_zero, nice, x_pad_left, x_pad_right, y_pad_bott, y_pad_top) {
        let orig_dataset= data;

        // checks if data is 1d or 2d - if more than one line is required
        if (orig_dataset.every(d => !Array.isArray(d))) {
            // for 1D data array

            // sorts dataset
            this.data = d3.sort(orig_dataset, d => d[this.x_key]);
            this.sorted_dataset = this.data;

            // sets scales
            super.updateScalesLinear(x_zero, y_zero, nice, x_pad_left, x_pad_right, y_pad_bott, y_pad_top);

        } else{
            // for 2D data array

            let datasets_min = undefined;
            let datasets_max = undefined;
            let temp_dataset = [{'x_key':undefined, 'y_key':undefined}, {'x_key':undefined, 'y_key':undefined}]; // used for entire dataset min / max values for scales

            // extracts x_key min/max values
            if (this.x_key_list !== undefined){
                // if x_key_list is defined and multiple x-axis keys exist

                this.sort_multi_ds(orig_dataset, this.x_key_list);

                // finds min and max x-axis values from all datasets
                for (let i= 0; i < this.x_key_list.length; i++) {
                    let min = d3.min(this.sorted_dataset[i], d => d[`${this.x_key_list[i]}`]);
                    let max = d3.max(this.sorted_dataset[i], d => d[`${this.x_key_list[i]}`]);
                    if ((min < datasets_min) || (datasets_min === undefined)) {
                        datasets_min = min;
                    }
                    if ((max > datasets_max) || (datasets_max === undefined)) {
                        datasets_max = max;
                    }
                }
            } else {
                // if x_key is singular string

                this.sort_multi_ds(orig_dataset, this.x_key);

                datasets_min = d3.min(this.sorted_dataset.map(arr => arr.map(obj => obj[this.x_key])).flat());
                datasets_max = d3.max(this.sorted_dataset.map(arr => arr.map(obj => obj[this.x_key])).flat());
            }

            temp_dataset[0]['x_key'] = datasets_min;
            temp_dataset[1]['x_key'] = datasets_max;


            datasets_min = undefined;
            datasets_max = undefined;


            // extracts y_key min/max values
            if (this.y_key_list !== undefined){
                // if y_key_list is defined and multiple y-axis keys exist

                // finds min and max y-axis values from all datasets
                for (let i= 0; i < this.y_key_list.length; i++) {
                    let min = d3.min(this.sorted_dataset[i], d => d[`${this.y_key_list[i]}`]);
                    let max = d3.max(this.sorted_dataset[i], d => d[`${this.y_key_list[i]}`]);
                    if ((min < datasets_min) || (datasets_min === undefined)) {
                        datasets_min = min;
                    }
                    if ((max > datasets_max) || (datasets_max === undefined)) {
                        datasets_max = max;
                    }
                }
            } else {
                // if y_key is singular string

                datasets_min = d3.min(this.sorted_dataset.map(arr => arr.map(obj => obj[this.y_key])).flat());
                datasets_max = d3.max(this.sorted_dataset.map(arr => arr.map(obj => obj[this.y_key])).flat());
            }

            temp_dataset[0]['y_key'] = datasets_min;
            temp_dataset[1]['y_key'] = datasets_max;


            this.data = temp_dataset;

            super.updateScalesLinear(x_zero, y_zero, nice, x_pad_left, x_pad_right, y_pad_bott, y_pad_top);

            this.data = this.sorted_dataset;
        }
    }
}
